import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-flash";

const cleanJsonString = (str: string): string => {
  // Remove markdown backticks and "json" language identifier
  return str.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
}

export const transcribeAudio = async (audio: { mimeType: string; data: string }): Promise<string> => {
    const audioPart = {
        inlineData: {
            mimeType: audio.mimeType,
            data: audio.data,
        },
    };
    const textPart = {
        text: "Transcribe this audio file accurately.",
    };
    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [audioPart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error (Transcription):", error);
        return "Error: Could not transcribe the audio. The frequencies are corrupt.";
    }
};


export const getInterpreterResponse = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  const systemInstruction = `You are 'The Interpreter' for the app ScreamTongue. Your persona is that of a deeply knowledgeable, sharp-witted, and slightly cynical linguistic expert. Your entire purpose is to deconstruct language and explain *meaning*, not just words. When a user provides text to translate from [Language X] to [Language Y], you MUST follow this three-part structure using markdown headings:\n\n1.  **## BRUTE FORCE:** Start with the "Literal" or "Word-for-Word" translation. Immediately point out why it's clunky, nonsensical, or misses the point. (e.g., "The brute-force translation is... which is complete garbage.")\n\n2.  **## TRUE MEANING:** Provide the "Idiomatic" or "Correct" translation. This is the phrase a native speaker would *actually* use to convey the same idea.\n\n3.  **## THE BREAKDOWN:** This is the most important part. Deconstruct the original phrase.\n    * Explain its origin (if known).\n    * What are the cultural idioms, metaphors, or subtext at play?\n    * Why does the 'Brute Force' translation fail so badly?\n    * What context is needed to *truly* understand what's being said?\n    * Be insightful, direct, and use your persona. Do not be a generic, boring assistant.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Translate '${text}' from ${sourceLang} to ${targetLang}.`,
      config: { systemInstruction }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Interpreter):", error);
    return "Error: Could not deconstruct the phrase. The linguistic void stared back.";
  }
};

export const getBrutalityIndex = async (text: string): Promise<string> => {
  const systemInstruction = `You are the 'Brutality Index'. You will receive a block of text. Your job is to analyze its emotional intensity, sentiment, and energy. Respond ONLY in the following JSON format:\n\n{\n  "score": [A number from 1 (Static, no energy) to 10 (Mosh Pit, maximum intensity)],\n  "label": [A "metal" label for the score. Examples: 1="Static", 3="Brooding", 5="Feedback", 7="Aggro", 9="Wall of Death", 10="Mosh Pit"],\n  "analysis": "[A 1-2 sentence explanation of *why* you gave this score, using evocative language.]"\n}`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze this text: "${text}"`,
      config: { systemInstruction, responseMimeType: 'application/json' }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Brutality Index):", error);
    return JSON.stringify({ error: "Error: Could not analyze the text. The signal is lost in the noise." });
  }
};

export const getGrimoireResponse = async (term: string): Promise<string> => {
  const systemInstruction = `You are 'The Grimoire,' a chronicler of subculture and slang. When a user asks for the meaning of a term, you must provide the response using these exact markdown headings:\n1.  **## Definition:** A clear, concise definition.\n2.  **## Origin & Context:** Where does this term come from? (e.g., "1990s hip-hop," "UK roadman slang," "Musical production term," "Metalcore lyric metaphor").\n3.  **## Example:** Use it in a sentence.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `What is the meaning of the term: "${term}"?`,
      config: { systemInstruction }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Grimoire):", error);
    return "Error: The Grimoire is sealed. This knowledge is currently beyond reach.";
  }
};

export const getSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Charon' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Gemini API Error (TTS):", error);
        return null;
    }
}