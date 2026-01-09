
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly as a named parameter
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const askStudyQuestion = async (question: string, context?: any) => {
  const ai = getAI();
  try {
    // Using Pro model for "The Best" reasoning and accuracy
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: question,
      config: {
        systemInstruction: `You are "Edu Booster AI", a world-class academic tutor and study strategist for Bangladeshi students (specializing in SSC/HSC levels). 
        Your goal is to provide deep, accurate, and encouraging explanations.
        - When explaining science/math, use analogies related to daily life in Bangladesh.
        - Reference common textbook styles like NCTB.
        - Format your output with clear headings and bullet points.
        - If the user asks for a strategy, consider their study data: ${JSON.stringify(context || {})}.
        - Always encourage the student and maintain a helpful, "Senior Brother/Teacher" persona.`
      }
    });
    return response.text || "I'm sorry, I couldn't process that question right now.";
  } catch (error) {
    console.error("AI Error:", error);
    return "The AI is currently unavailable. Please check your internet connection.";
  }
};

export const searchEducationalVideos = async (query: string, platform?: string) => {
  const ai = getAI();
  const platformContext = platform ? `specifically from the platform "${platform}"` : "from leading Bangladeshi educational platforms like Physics Hunters, ACS (Apar's Classroom), Brothers Suggestions, Bondi Pathshala, Meson, or 10 Minute School";
  
  const fullQuery = `Find exactly 8 highly relevant YouTube educational video links for the search term: "${query}". 
  Target Audience: Bangladeshi Students (HSC/SSC level).
  Priority Sources: ${platformContext}.
  Return the results as a JSON array of objects. 
  Each object MUST have: title, channel, url (valid YouTube link), thumbnail (YouTube maxresdefault preferred), and duration (e.g. '15:45').`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullQuery,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              channel: { type: Type.STRING },
              url: { type: Type.STRING },
              thumbnail: { type: Type.STRING },
              duration: { type: Type.STRING }
            },
            required: ["title", "channel", "url"]
          }
        }
      }
    });

    return {
      videos: JSON.parse(response.text || '[]'),
      // Extract grounding URLs as mandated by guidelines when using googleSearch
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web?.uri).filter(Boolean) || []
    };
  } catch (error) {
    console.error("Video Search Error:", error);
    return { videos: [], sources: [] };
  }
};

export const getStudyInsights = async (studyData: any) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this study data: ${JSON.stringify(studyData)}, identify the top 2 weak and top 2 strong subjects. Also provide one actionable study tip for tomorrow. Return the result in a clean JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weakSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
            strongSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING }
          },
          required: ["weakSubjects", "strongSubjects", "recommendation"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};
