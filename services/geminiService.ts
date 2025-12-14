import { GoogleGenAI, SchemaType } from "@google/genai";
import { LANGUAGE_NAMES } from "../utils/translations";

// Fallback key provided by user
const FALLBACK_API_KEY = 'AIzaSyBcfSXPPK8Ne9twxakXS7_c4k0k14F67FE';

const getClient = () => {
  const val = process.env.API_KEY;
  let apiKey = FALLBACK_API_KEY;
  
  if (val) {
      const clean = val.replace(/['"]/g, '').trim();
      if (clean !== 'undefined' && clean !== 'null' && clean !== '') {
          apiKey = clean;
      }
  }
  
  if (!apiKey) {
    console.error("API Key not found or invalid in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper for file conversion
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const translateText = async (text: string, targetLangCode: string = 'ar'): Promise<{ arabic: string, phonetic: string }> => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    
    // We assume target is usually Arabic for Hajj purposes, but if different need adaptation.
    // For now, let's keep it translating TO Arabic from Input.
    const prompt = `Translate the following text to Arabic suitable for a Hajj pilgrim. 
    Also provide a phonetic pronunciation guide in English alphabet.
    Return JSON format: { "arabic": "...", "phonetic": "..." }
    
    Text: "${text}"`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      arabic: result.arabic || "Translation unavailable",
      phonetic: result.phonetic || ""
    };
  } catch (error) {
    console.error("Translation error:", error);
    return { arabic: "Error translating", phonetic: "" };
  }
};

export const findNearbyPlaces = async (query: string, lat: number, lng: number, langCode: string = 'bn') => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    const langName = LANGUAGE_NAMES[langCode as keyof typeof LANGUAGE_NAMES] || 'English';

    const response = await ai.models.generateContent({
      model,
      contents: `Find precise locations for "${query}". The user is currently at latitude: ${lat}, longitude: ${lng}.
      Use the Google Maps tool to find real places. 
      IMPORTANT: Return the place names in ${langName} script/transliteration if possible.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const places = chunks
      .map((chunk: any) => {
        if (chunk.maps && chunk.maps.title) {
           return {
             title: chunk.maps.title,
             uri: chunk.maps.uri,
             address: "Google Maps Location",
             location: {
                lat: lat + (Math.random() - 0.5) * 0.005,
                lng: lng + (Math.random() - 0.5) * 0.005
             }
           };
        }
        return null;
      })
      .filter((p: any) => p !== null);

    return {
        text: response.text,
        places: places,
        chunks: chunks
    };

  } catch (error) {
    console.error("Maps error:", error);
    return { text: "Error fetching places.", places: [] };
  }
};

export const searchGuide = async (query: string, langCode: string = 'bn') => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    const langName = LANGUAGE_NAMES[langCode as keyof typeof LANGUAGE_NAMES] || 'English';

    const response = await ai.models.generateContent({
      model,
      contents: `Answer the following question about Hajj or Umrah rituals in ${langName}. Keep it concise and helpful for a pilgrim. Query: ${query}`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Search error:", error);
    return { text: "Sorry, information not found.", sources: [] };
  }
};

export const askWithThinking = async (query: string, langCode: string = 'bn') => {
  try {
    const ai = getClient();
    const model = 'gemini-3-pro-preview';
    const langName = LANGUAGE_NAMES[langCode as keyof typeof LANGUAGE_NAMES] || 'English';

    const response = await ai.models.generateContent({
      model,
      contents: `You are a knowledgeable Islamic scholar and Hajj guide.
      
      TASK:
      Answer this complex query in ${langName} with deep reasoning and clarity.
      
      Query: ${query}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Thinking error:", error);
    return "Sorry, I am having trouble thinking deeply right now.";
  }
};

export const analyzeVisual = async (file: File, prompt: string, langCode: string = 'bn') => {
  try {
    const ai = getClient();
    const base64Data = await fileToBase64(file);
    const model = 'gemini-3-pro-preview';
    const langName = LANGUAGE_NAMES[langCode as keyof typeof LANGUAGE_NAMES] || 'English';

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          },
          {
            text: `Analyze this visual (image or video) and answer in ${langName}.
            Query: ${prompt}`
          }
        ]
      }
    });

    return response.text;
  } catch (error) {
    console.error("Visual analysis error:", error);
    return "Sorry, cannot analyze this.";
  }
};

export const translateVisualText = async (base64Data: string, langCode: string = 'bn') => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    const langName = LANGUAGE_NAMES[langCode as keyof typeof LANGUAGE_NAMES] || 'English';

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Analyze this image.
            1. If there is visible text (signs, documents, menus), translate it to ${langName}.
            2. If there is no clear text, describe what you see briefly in ${langName}.
            Provide ONLY the translation or description. No preamble.` }
        ]
      }
    });

    return response.text || "Cannot read text.";
  } catch (error) {
    console.error("Visual translation error:", error);
    return "Error analyzing image.";
  }
};

export const extractDocumentInfo = async (file: File, langCode: string = 'bn') => {
  try {
    const ai = getClient();
    const base64Data = await fileToBase64(file);
    const model = 'gemini-2.5-flash';
    const langName = LANGUAGE_NAMES[langCode as keyof typeof LANGUAGE_NAMES] || 'English';

    const prompt = `Analyze this image. It is likely a travel document (Passport, Visa, or Medical Report).
    Extract the following information in JSON format:
    1. type: One of 'passport', 'visa', 'medical', or 'other'.
    2. name: Name of the person on the document.
    3. expiry: Expiry date if available (YYYY-MM-DD or string).
    4. summary: A very brief 1-sentence summary in ${langName} of what this document is and its status.
    
    If you cannot find specific info, use null or empty string.`;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: file.type } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Doc extraction error:", error);
    return { type: 'other', name: 'Unknown', expiry: null, summary: 'Info extraction failed' };
  }
};

export const generateHealthSummary = async (userProfile: any) => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    const langName = LANGUAGE_NAMES[userProfile.language as keyof typeof LANGUAGE_NAMES] || 'English';

    const prompt = `You are a caring health assistant for a Hajj pilgrim named ${userProfile.name}.
    
    User Profile:
    - Age: Elderly
    - Conditions: ${userProfile.conditions.join(', ')}
    - Medications: ${userProfile.medications.map((m:any) => m.name).join(', ')}
    - Water Intake Today: ${userProfile.waterIntake}/8 glasses
    - Energy Level: ${userProfile.energyLevel}
    
    Generate a short, warm, and encouraging daily health summary in ${langName}.
    Include:
    1. Praise for good habits.
    2. Gentle reminders for medications or rest.
    3. A specific tip for the Hajj climate.
    
    Keep it sweet and personal. Address her as 'Aunty' or '${userProfile.name}'.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (e) {
    console.error("Health summary error:", e);
    return "Sorry, cannot generate summary.";
  }
};

export const generateSpeech = async (text: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ['AUDIO'], 
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData;
  } catch (error) {
    console.error("TTS error:", error);
    return null;
  }
};

export const getLiveClient = () => {
    return getClient();
}