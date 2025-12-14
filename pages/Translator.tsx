import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, Volume2, Send, Loader2, Image as ImageIcon, Video, Upload, Camera, X, RefreshCcw, PlayCircle } from 'lucide-react';
import { translateText, analyzeVisual, translateVisualText, generateSpeech } from '../services/geminiService';
import { Phrase } from '../types';
import { base64ToUint8Array, decodeAudioData } from '../utils/audio';

const COMMON_PHRASES: Phrase[] = [
  { bn: "আমার ডাক্তার দরকার", ar: "أحتاج طبيب", ar_phonetic: "ahtaj tabib" },
  { bn: "টয়লেট কোথায়?", ar: "أين الحمام؟", ar_phonetic: "ayna al-hammam?" },
  { bn: "আমি ব্যথা পাচ্ছি", ar: "أنا في ألم", ar_phonetic: "ana fi alam" },
  { bn: "হোটেল কোথায়?", ar: "أين الفندق؟", ar_phonetic: "ayna al-funduq?" },
];

export default function Translator() {
  const [mode, setMode] = useState<'voice' | 'text' | 'camera'>('voice');
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Vision/Camera State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [visualPrompt, setVisualPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Live Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTab, setCameraTab] = useState<'live' | 'upload'>('live');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up stream on unmount
  useEffect(() => {
      return () => {
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop());
          }
      };
  }, []);

  // --- CAMERA FUNCTIONS ---
  const startCamera = async () => {
      setTranslation("");
      setPreviewUrl(null);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment' } 
          });
          streamRef.current = stream;
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
          setIsCameraActive(true);
      } catch (err) {
          console.error("Camera Error", err);
          alert("ক্যামেরা চালু করা সম্ভব হচ্ছে না। সেটিংস চেক করুন। (Camera Error)");
      }
  };

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
      }
      setIsCameraActive(false);
  };

  const captureAndTranslate = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
          
          stopCamera(); // Stop live stream to show result
          setPreviewUrl(canvas.toDataURL('image/jpeg', 0.7)); // Show captured frame
          
          setIsLoading(true);
          const text = await translateVisualText(base64);
          setTranslation(text);
          setIsLoading(false);
      }
  };

  // --- AUDIO FUNCTIONS ---
  const handleTranslation = async (textToTranslate: string) => {
    if (!textToTranslate.trim()) return;
    setIsLoading(true);
    setTranscript(textToTranslate);
    
    const result = await translateText(textToTranslate);
    setTranslation(result.arabic);
    setPhonetic(result.phonetic);
    setIsLoading(false);
  };

  const playTranslation = async () => {
      if (!translation || isPlayingAudio) return;
      setIsPlayingAudio(true);
      try {
          const audioData = await generateSpeech(translation);
          if (audioData) {
               const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
               const buffer = await decodeAudioData(base64ToUint8Array(audioData), audioContext);
               const source = audioContext.createBufferSource();
               source.buffer = buffer;
               source.connect(audioContext.destination);
               source.start(0);
               source.onended = () => {
                   setIsPlayingAudio(false);
                   audioContext.close();
               };
          } else {
              setIsPlayingAudio(false);
          }
      } catch (e) {
          console.error(e);
          setIsPlayingAudio(false);
      }
  };

  // --- FILE UPLOAD ANALYSIS ---
  const handleVisualAnalysis = async () => {
      if (!selectedFile) return;
      setIsLoading(true);
      const prompt = visualPrompt || "What is written here or what is happening? Translate relevant text to Bengali.";
      const result = await analyzeVisual(selectedFile, prompt);
      setTranslation(result);
      setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          setTranslation(""); 
      }
  };

  // Simulating Voice Recognition
  const toggleListening = () => {
    if (isListening) {
       setIsListening(false);
       return;
    }
    
    setIsListening(true);
    setTranscript("শুনছি...");
    setTranslation("");
    setPhonetic("");

    setTimeout(() => {
      const simulatedPhrase = "আমার পানি দরকার";
      setTranscript(simulatedPhrase);
      setIsListening(false);
      handleTranslation(simulatedPhrase);
    }, 2000);
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900 max-w-md mx-auto pb-24 transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-center text-dark dark:text-white font-bengali">অনুবাদ করুন</h2>

      {/* Mode Switcher */}
      <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {(['voice', 'text', 'camera'] as const).map(m => (
          <button
            key={m}
            onClick={() => { 
                setMode(m); 
                setTranscript(""); 
                setTranslation("");
                setSelectedFile(null);
                setPreviewUrl(null);
                stopCamera(); // Ensure camera stops if changing mode
            }}
            className={`flex-1 py-2 rounded-md font-medium font-bengali transition-colors ${
              mode === m 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m === 'voice' ? 'কণ্ঠ' : m === 'text' ? 'লেখা' : 'ক্যামেরা'}
          </button>
        ))}
      </div>

      {/* Voice Mode UI */}
      {mode === 'voice' && (
        <div className="flex flex-col items-center space-y-8 animate-fade-in">
          <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md min-h-[240px] flex flex-col justify-center items-center text-center border border-gray-100 dark:border-gray-700 transition-colors">
            {isLoading ? (
                <Loader2 className="animate-spin text-primary" size={40} />
            ) : transcript && transcript !== "শুনছি..." ? (
              <div className="space-y-6 w-full animate-fade-in">
                <div>
                  <p className="text-sm text-gray-400 mb-1 font-bengali">বাংলা</p>
                  <p className="text-xl font-medium text-dark dark:text-gray-200 font-bengali">{transcript}</p>
                </div>
                <hr className="border-gray-100 dark:border-gray-700" />
                <div>
                  <p className="text-sm text-gray-400 mb-1 font-bengali">আরবি</p>
                  <p className="text-3xl font-arabic text-primary mb-2">{translation}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">{phonetic}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-lg font-bengali">
                {isListening ? "শুনছি..." : "মাইক্রোফোনে ট্যাপ করে কথা বলুন"}
              </p>
            )}
          </div>

          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-primary hover:bg-green-500'
            }`}
          >
            {isListening ? <StopCircle size={40} color="white" /> : <Mic size={40} color="white" />}
          </button>
        </div>
      )}

      {/* Text Mode UI */}
      {mode === 'text' && (
        <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                <textarea 
                    className="w-full p-2 outline-none text-lg font-bengali resize-none h-32 bg-transparent text-dark dark:text-white placeholder-gray-400"
                    placeholder="এখানে লিখুন..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                    <button 
                        onClick={() => handleTranslation(inputText)}
                        disabled={isLoading || !inputText}
                        className="bg-primary text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        <span className="font-bengali">অনুবাদ</span>
                    </button>
                </div>
            </div>

            {(translation) && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-primary animate-fade-in">
                    <p className="text-sm text-gray-400 mb-1 font-bengali">আরবি</p>
                    <p className="text-3xl font-arabic text-primary mb-2">{translation}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">{phonetic}</p>
                </div>
            )}
        </div>
      )}

      {/* Camera/Vision Mode UI */}
      {mode === 'camera' && (
          <div className="space-y-4 animate-fade-in">
              {/* Sub-Tabs for Camera Mode */}
              <div className="flex gap-2 mb-2">
                  <button 
                      onClick={() => { setCameraTab('live'); startCamera(); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold font-bengali flex items-center justify-center gap-2 ${cameraTab === 'live' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                      <Camera size={16} /> লাইভ ক্যামেরা
                  </button>
                  <button 
                      onClick={() => { setCameraTab('upload'); stopCamera(); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold font-bengali flex items-center justify-center gap-2 ${cameraTab === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                      <Upload size={16} /> আপলোড
                  </button>
              </div>

              {cameraTab === 'live' && (
                  <div className="bg-black rounded-2xl overflow-hidden relative shadow-lg min-h-[300px] flex items-center justify-center">
                      {isCameraActive ? (
                          <div className="relative w-full h-full">
                              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover min-h-[300px]" />
                              <canvas ref={canvasRef} className="hidden" />
                              
                              {/* Camera Overlay Controls */}
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                                  <button 
                                    onClick={stopCamera} 
                                    className="p-3 bg-white/20 rounded-full backdrop-blur text-white hover:bg-white/30"
                                  >
                                      <X size={24} />
                                  </button>
                                  <button 
                                    onClick={captureAndTranslate}
                                    className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-xl flex items-center justify-center hover:bg-gray-100 active:scale-95 transition"
                                  >
                                      <div className="w-12 h-12 bg-primary rounded-full"></div>
                                  </button>
                              </div>
                              <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded font-bengali backdrop-blur">
                                  লাইভ ভিউ
                              </div>
                          </div>
                      ) : previewUrl ? (
                          <div className="relative w-full">
                             <img src={previewUrl} alt="Captured" className="w-full h-full object-cover" />
                             <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 flex flex-col items-center justify-center p-4">
                                 {isLoading ? (
                                     <div className="text-white flex flex-col items-center animate-pulse">
                                         <Loader2 size={48} className="animate-spin mb-2" />
                                         <span className="font-bengali text-lg">অনুবাদ করা হচ্ছে...</span>
                                     </div>
                                 ) : translation && (
                                     <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-2xl backdrop-blur-md w-full max-w-xs text-center animate-slide-up">
                                         <p className="text-dark dark:text-white font-bengali text-lg leading-relaxed mb-4">{translation}</p>
                                         <div className="flex justify-center gap-3">
                                             <button 
                                               onClick={playTranslation}
                                               className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-bold text-sm active:scale-95 transition"
                                             >
                                                 {isPlayingAudio ? <Loader2 size={16} className="animate-spin"/> : <Volume2 size={16} />}
                                                 শুনুন
                                             </button>
                                             <button 
                                               onClick={startCamera}
                                               className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-dark dark:text-white px-4 py-2 rounded-full font-bold text-sm active:scale-95 transition"
                                             >
                                                 <RefreshCcw size={16} /> আবার
                                             </button>
                                         </div>
                                     </div>
                                 )}
                             </div>
                          </div>
                      ) : (
                          <button onClick={startCamera} className="flex flex-col items-center text-gray-400 hover:text-white transition">
                              <Camera size={48} className="mb-2 opacity-50" />
                              <span className="font-bengali text-sm">ক্যামেরা চালু করুন</span>
                          </button>
                      )}
                  </div>
              )}

              {cameraTab === 'upload' && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <input 
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    
                    {!selectedFile ? (
                        <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                        >
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-3">
                                <Upload size={32} className="text-blue-500" />
                            </div>
                            <p className="font-bengali text-gray-500 dark:text-gray-400 font-medium">ছবি বা ভিডিও আপলোড করুন</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">চিহ্ন, মেনু বা যেকোনো দৃশ্য</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {selectedFile.type.startsWith('video') ? (
                                <video src={previewUrl!} controls className="w-full rounded-lg max-h-64 bg-black" />
                            ) : (
                                <img src={previewUrl!} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
                            )}
                            <button 
                                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {selectedFile && (
                        <div className="mt-4">
                            <input 
                            type="text" 
                            value={visualPrompt}
                            onChange={(e) => setVisualPrompt(e.target.value)}
                            placeholder="কি জানতে চান? (ঐচ্ছিক)"
                            className="w-full border dark:border-gray-600 rounded-lg p-2 mb-3 outline-none focus:border-primary bg-transparent text-dark dark:text-white font-bengali"
                            />
                            <button 
                                onClick={handleVisualAnalysis}
                                disabled={isLoading}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : selectedFile.type.startsWith('video') ? <Video size={20} /> : <ImageIcon size={20} />}
                                <span className="font-bengali">বিশ্লেষণ করুন</span>
                            </button>
                        </div>
                    )}
                </div>
              )}

              {/* Result Display for Upload Mode */}
              {cameraTab === 'upload' && translation && (
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border-l-4 border-indigo-500 animate-fade-in">
                      <p className="font-bold text-gray-700 dark:text-gray-300 mb-2 font-bengali">বিশ্লেষণ ফলাফল:</p>
                      <p className="text-dark dark:text-white font-bengali leading-relaxed whitespace-pre-wrap mb-4">{translation}</p>
                      <button 
                        onClick={playTranslation}
                        className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition"
                       >
                         {isPlayingAudio ? <Loader2 size={14} className="animate-spin"/> : <Volume2 size={14} />}
                         শুনুন
                       </button>
                  </div>
              )}
          </div>
      )}

      {/* Quick Phrases (Only in Voice/Text mode) */}
      {mode !== 'camera' && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-gray-300 font-bengali">জরুরি বাক্য</h3>
            <div className="space-y-3">
            {COMMON_PHRASES.map((phrase, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer" onClick={() => {
                    setTranscript(phrase.bn);
                    setTranslation(phrase.ar);
                    setPhonetic(phrase.ar_phonetic);
                    setMode('voice');
                }}>
                <div>
                    <p className="font-medium text-dark dark:text-white font-bengali">{phrase.bn}</p>
                    <p className="text-primary text-xl font-arabic mt-1">{phrase.ar}</p>
                </div>
                <button className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full text-secondary hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                    <Volume2 size={24} />
                </button>
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}