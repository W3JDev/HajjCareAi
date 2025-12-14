import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, X, Video as VideoIcon, VideoOff, Sparkles, Loader2, Volume2, Navigation, Trash2 } from 'lucide-react';
import { LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { getLiveClient } from '../services/geminiService';
import { createPcmBlob, decodeAudioData, base64ToUint8Array, arrayBufferToBase64 } from '../utils/audio';
import { useApp } from '../context/AppContext';
import { LANGUAGE_NAMES } from '../utils/translations';

interface LiveAssistantProps {
  onClose: () => void;
}

export default function LiveAssistant({ onClose }: LiveAssistantProps) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // App Control Hooks
  const navigate = useNavigate();
  const { addWater, user, checklist } = useApp();

  // Refs
  const navigateRef = useRef(navigate);
  const addWaterRef = useRef(addWater);
  const userRef = useRef(user);
  const checklistRef = useRef(checklist);
  
  // Session Ref for accessing sendRealtimeInput from outside
  const sessionRef = useRef<any>(null);

  // Audio/Video Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Conversation History State
  const currentInputRef = useRef("");
  const currentOutputRef = useRef("");

  // Update refs when state changes
  useEffect(() => {
    navigateRef.current = navigate;
    addWaterRef.current = addWater;
    userRef.current = user;
    checklistRef.current = checklist;
  }, [navigate, addWater, user, checklist]);

  useEffect(() => {
    let isMounted = true;
    let sessionPromise: Promise<any>;

    const startSession = async () => {
      try {
        const ai = getLiveClient();
        
        // 1. Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;
        
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        inputContextRef.current = inputCtx;
        
        // 2. Get Microphone Stream
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
        } catch (err: any) {
            console.error("Permission Error:", err);
            if (isMounted) {
                setStatus('error');
                setErrorMessage("Microphone permission denied.");
            }
            return;
        }

        // 3. Define Tools
        const tools: { functionDeclarations: FunctionDeclaration[] }[] = [{
            functionDeclarations: [
              {
                name: "navigate_to_screen",
                description: "Navigate the user to a specific screen within the app.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    screen: {
                      type: Type.STRING,
                      enum: ["home", "translate", "health", "map", "guide", "sos", "expenses", "checklist", "profile"]
                    }
                  },
                  required: ["screen"]
                }
              },
              {
                name: "start_navigation",
                description: "Start real-time turn-by-turn navigation to a physical location using Google Maps.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    destination: {
                      type: Type.STRING,
                      description: "The name of the destination (e.g. 'Kaaba', 'Hotel', 'Mina')."
                    }
                  },
                  required: ["destination"]
                }
              },
              {
                name: "call_contact",
                description: "Call or message a family member on WhatsApp. Use this when the user asks to call their son, daughter, dad, etc.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    relation: {
                      type: Type.STRING,
                      description: "The relation of the contact (e.g., 'son', 'daughter', 'dad')."
                    }
                  },
                  required: ["relation"]
                }
              },
              {
                name: "log_water_intake",
                description: "Log water intake.",
                parameters: { type: Type.OBJECT, properties: {} }
              },
              {
                name: "get_health_summary",
                description: "Get user health status.",
                parameters: { type: Type.OBJECT, properties: {} }
              },
              {
                name: "explore_map_3d",
                description: "Show a location on the 3D map for visual exploration (not navigation).",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: { type: Type.STRING }
                  },
                  required: ["query"]
                }
              }
            ]
        }];

        // Calculate context
        const currentPhase = checklistRef.current.find(p => !p.items.every(i => i.completed))?.title || "Completed";
        const userName = userRef.current.name.split(' ')[0]; // First name
        const contactsList = userRef.current.contacts.map(c => `${c.relation}: ${c.name} (${c.number})`).join(', ');
        const documentsList = userRef.current.documents?.map(d => `${d.type}: ${d.name} (Exp: ${d.expiry || 'N/A'})`).join(', ') || "No documents uploaded.";
        const preferredLanguage = LANGUAGE_NAMES[userRef.current.language as keyof typeof LANGUAGE_NAMES] || 'English';

        // Load Chat History
        const savedHistory = localStorage.getItem('hajjcare_assistant_history');
        const historyContext = savedHistory ? JSON.parse(savedHistory).map((h: any) => `${h.role}: ${h.text}`).join('\n') : "No previous conversation.";

        // 4. Connect to Live API
        sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            tools: tools,
            systemInstruction: `You are HajjCare's AI, a sweet, caring family member (like a niece or nephew) for ${userRef.current.name}.
            
            **YOUR PERSONA:**
            - **IMPORTANT:** You MUST address the user affectionately as 'Aunty', 'Khala', 'Jahanara Aunty', or '${userName} Aunty'.
            - **NEVER** ask robotic questions like "How can I help?". 
            - **ALWAYS** start by asking: "How are you feeling Aunty?", "Are you tired?", "How is your Hajj going?", or "What are you doing now?". Be chatty and sweet.
            - **LANGUAGE:** Speak **${preferredLanguage}** naturally and affectionately.
            
            **CONTEXT:**
            - Hajj Stage: ${currentPhase}
            - Health: ${userRef.current.conditions.join(', ')}
            - Family Contacts: ${contactsList}
            - Uploaded Documents: ${documentsList}
            - Previous Chat: ${historyContext}

            **ACTIONS & TOOLS:**
            1. **CALLING FAMILY (CRITICAL):**
               - If she asks to call family (e.g. "call my son"), **IMMEDIATELY** use the 'call_contact' tool.
            
            2. **VISUAL TRANSLATION (CAMERA):**
               - If the camera is on, **ALWAYS** look for text (signs, menus, documents) in the video feed.
               - **DEFAULT:** If you see text in a foreign language, **automatically translate it to ${preferredLanguage}** and tell her what it says without waiting for a question.
               - If she asks "what is this?", describe the scene or object in ${preferredLanguage}.

            3. **DOCUMENTS:**
               - If she asks about her passport/visa expiry or details, use the 'Uploaded Documents' context to answer.

            Make her feel safe, loved, and cared for.`,
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {}
          },
          callbacks: {
            onopen: () => {
                if (isMounted) setStatus('connected');
                console.log("Gemini Live Connected");

                // Audio Input Setup
                if (!inputCtx || !stream) return;
                const source = inputCtx.createMediaStreamSource(stream);
                const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                
                processor.onaudioprocess = (e) => {
                    if (!isMicOn) return; 
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmBlob = createPcmBlob(inputData);
                    sessionPromise.then((session) => {
                       session.sendRealtimeInput({ media: { mimeType: pcmBlob.mimeType, data: pcmBlob.data } });
                    });
                };

                source.connect(processor);
                processor.connect(inputCtx.destination);
                sourceNodeRef.current = source;
                processorRef.current = processor;
            },
            onmessage: async (msg: LiveServerMessage) => {
                // Accumulate Transcription for History
                if (msg.serverContent?.outputTranscription?.text) {
                  currentOutputRef.current += msg.serverContent.outputTranscription.text;
                }
                if (msg.serverContent?.inputTranscription?.text) {
                  currentInputRef.current += msg.serverContent.inputTranscription.text;
                }

                if (msg.serverContent?.turnComplete) {
                  // Save turn to localStorage
                  const userText = currentInputRef.current.trim();
                  const modelText = currentOutputRef.current.trim();
                  
                  if (userText || modelText) {
                    const existingHistory = JSON.parse(localStorage.getItem('hajjcare_assistant_history') || '[]');
                    const newHistory = [
                      ...existingHistory, 
                      ...(userText ? [{ role: 'User', text: userText }] : []),
                      ...(modelText ? [{ role: 'Assistant', text: modelText }] : [])
                    ].slice(-10); // Keep last 10 turns
                    
                    localStorage.setItem('hajjcare_assistant_history', JSON.stringify(newHistory));
                    
                    // Reset buffers
                    currentInputRef.current = "";
                    currentOutputRef.current = "";
                  }
                }

                // Tool Handling
                if (msg.toolCall) {
                    console.log("Tool:", msg.toolCall);
                    const responses = [];
                    for (const fc of msg.toolCall.functionCalls) {
                        let result: any = { success: true };
                        const args = fc.args as any;

                        if (fc.name === 'navigate_to_screen') {
                             const pathMap: any = { 'home':'/', 'translate':'/translate', 'health':'/health', 'map':'/map', 'guide':'/guide', 'sos':'/sos', 'expenses':'/expenses', 'checklist': '/checklist', 'profile': '/profile' };
                             navigateRef.current(pathMap[args.screen] || '/');
                             result = { message: `Navigated to ${args.screen}` };
                        } 
                        else if (fc.name === 'start_navigation') {
                             const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(args.destination)}&travelmode=walking`;
                             window.open(url, '_blank');
                             result = { message: `Opened Google Maps for ${args.destination}` };
                        }
                        else if (fc.name === 'call_contact') {
                             const relation = args.relation.toLowerCase();
                             const contact = userRef.current.contacts?.find(c => c.relation.toLowerCase().includes(relation) || relation.includes(c.relation.toLowerCase()));
                             
                             if (contact) {
                                 // Open WhatsApp
                                 // wa.me is robust for both web and mobile
                                 const link = `https://wa.me/${contact.number}`;
                                 window.open(link, '_blank');
                                 result = { message: `Initiated WhatsApp call/chat to ${contact.name} (${contact.relation})` };
                             } else {
                                 result = { message: `Contact for ${relation} not found in profile.` };
                             }
                        }
                        else if (fc.name === 'explore_map_3d') {
                             navigateRef.current('/map');
                             setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('hajjcare-explore', { detail: { query: args.query } }));
                             }, 500);
                             result = { message: `Showing ${args.query} on 3D map` };
                        }
                        else if (fc.name === 'log_water_intake') {
                             addWaterRef.current();
                             result = { count: userRef.current.waterIntake + 1 };
                        }
                        else if (fc.name === 'get_health_summary') {
                             result = { water: userRef.current.waterIntake, meds: userRef.current.medications };
                        }

                        responses.push({ id: fc.id, name: fc.name, response: { result } });
                    }
                    sessionPromise.then(s => s.sendToolResponse({ functionResponses: responses }));
                }

                // Audio Output Handling
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData && outputCtx) {
                    const buffer = await decodeAudioData(base64ToUint8Array(audioData), outputCtx);
                    const source = outputCtx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(outputCtx.destination);
                    const now = outputCtx.currentTime;
                    const start = Math.max(now, nextStartTimeRef.current);
                    source.start(start);
                    nextStartTimeRef.current = start + buffer.duration;
                }
            },
            onclose: () => { if (isMounted) setStatus('disconnected'); },
            onerror: (err) => { 
                console.error(err); 
                if (isMounted) { setStatus('error'); setErrorMessage("Connection Error"); }
            }
          }
        });

        // Store session in ref for use in other effects (e.g., camera)
        sessionPromise.then(session => {
            if (isMounted) sessionRef.current = session;
        });

      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message);
      }
    };

    startSession();

    return () => {
      isMounted = false;
      sessionPromise?.then(s => s.close());
      streamRef.current?.getTracks().forEach(t => t.stop());
      videoStreamRef.current?.getTracks().forEach(t => t.stop());
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      sourceNodeRef.current?.disconnect();
      processorRef.current?.disconnect();
      audioContextRef.current?.close();
      inputContextRef.current?.close();
      sessionRef.current = null;
    };
  }, []);

  // Camera Logic
  useEffect(() => {
    if (isCameraOn) {
        // Start Camera
        navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } }).then(stream => {
            videoStreamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            
            // Start sending frames
            videoIntervalRef.current = setInterval(() => {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                if (!canvas || !video) return;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                    
                    // Send frame to Gemini if connected
                    if (sessionRef.current) {
                        try {
                            sessionRef.current.sendRealtimeInput({ 
                                media: { 
                                    mimeType: 'image/jpeg', 
                                    data: base64 
                                } 
                            });
                        } catch (e) {
                            // Sometime might fail if session closing
                        }
                    }
                }
            }, 1000); 
        }).catch(err => {
            console.error("Camera error:", err);
            setIsCameraOn(false);
        });
    } else {
        // Stop Camera
        videoStreamRef.current?.getTracks().forEach(t => t.stop());
        if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    }
  }, [isCameraOn]);
  
  const clearHistory = () => {
    localStorage.removeItem('hajjcare_assistant_history');
    alert("Memory Cleared");
  };

  return (
    <div className="fixed bottom-20 right-4 z-[60] animate-slide-up">
      <div className="bg-white dark:bg-gray-800 w-80 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-green-600 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={20} className="animate-pulse" />
            <h3 className="font-bold font-bengali">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Camera Preview (Hidden if off) */}
        <div className={`relative bg-black transition-all duration-300 ${isCameraOn ? 'h-48' : 'h-0'}`}>
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
             <canvas ref={canvasRef} width={320} height={240} className="hidden" />
             <div className="absolute bottom-2 left-0 right-0 text-center">
                 <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full font-bengali">Camera On</span>
             </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[180px] relative bg-gray-50 dark:bg-gray-900">
          {status === 'connecting' && (
            <div className="flex flex-col items-center gap-3 text-gray-500">
               <Loader2 className="animate-spin text-primary" size={32} />
               <span className="text-sm font-bengali">Connecting...</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center text-red-500 px-2">
              <p className="font-bold mb-2">Error</p>
              <p className="text-xs">{errorMessage}</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-dark dark:text-white">Close</button>
            </div>
          )}

          {status === 'connected' && (
             <>
               <div className="relative mb-6">
                   <div className={`absolute inset-0 bg-primary blur-xl rounded-full transition-opacity duration-300 ${isMicOn ? 'opacity-40 animate-pulse-slow' : 'opacity-10'}`}></div>
                   <div className="relative w-24 h-24 bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-full shadow-inner border-4 border-white dark:border-gray-600 flex items-center justify-center">
                       <div className="flex items-center gap-1 h-8">
                           {[1,2,3,4,5].map(i => (
                               <div key={i} className={`w-1.5 bg-primary rounded-full transition-all duration-150 ${isMicOn ? 'animate-[bounce_1s_infinite]' : 'h-1'}`} style={{ animationDelay: `${i * 0.1}s`, height: isMicOn ? '20px' : '4px' }}></div>
                           ))}
                       </div>
                   </div>
               </div>
               
               <p className="text-center text-gray-600 dark:text-gray-300 font-bengali text-sm mb-6">
                  {isMicOn ? "Listening..." : "Microphone Off"}
               </p>

               {/* Controls */}
               <div className="flex gap-3">
                   <button 
                     onClick={() => setIsMicOn(!isMicOn)}
                     className={`p-4 rounded-full shadow-lg transition-all active:scale-95 ${
                         isMicOn 
                         ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600' 
                         : 'bg-red-500 text-white'
                     }`}
                   >
                       {isMicOn ? <Mic size={24} /> : <Volume2 size={24} />} 
                   </button>
                   
                   <button 
                     onClick={() => setIsCameraOn(!isCameraOn)}
                     className={`p-4 rounded-full shadow-lg transition-all active:scale-95 ${
                         isCameraOn
                         ? 'bg-blue-500 text-white' 
                         : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600'
                     }`}
                   >
                       {isCameraOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
                   </button>

                   <button 
                     onClick={clearHistory}
                     className="p-4 rounded-full bg-white dark:bg-gray-700 text-gray-500 hover:text-red-500 border border-gray-200 dark:border-gray-600 transition active:scale-95"
                     title="Clear Memory"
                   >
                       <Trash2 size={24} />
                   </button>
                   
                   <button onClick={onClose} className="p-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition active:scale-95">
                       <X size={24} />
                   </button>
               </div>
             </>
          )}
        </div>
      </div>
    </div>
  );
}