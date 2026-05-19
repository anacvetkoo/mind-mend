import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { app } from './firebaseConfig'; 

const aiService = getAI(app, { backend: new GoogleAIBackend() });

const model = getGenerativeModel(aiService, { model: "gemini-3-flash-preview" }); //gemini-3-flash-preview - 20 povpraševanj na dan?

export async function generateAIWellnessTips(checkIns: any[]): Promise<string[]> {
  const fallbackTips = [
    "Take a deep breath and give yourself credit for tracking your mood today. Every step counts! 💜",
    "Establishing a consistent sleep pattern supports your brain's emotional processing and recovery."
  ];

  //podatke za zadnjih 5 dnevnikov iz baze
  const recentData = (checkIns || []).slice(0, 5).map(c => ({
    date: c.date,
    mood: c.emotionalState || 'neutral',
    emotions: Array.isArray(c.dominantEmotion) ? c.dominantEmotion.join(', ') : c.dominantEmotion || 'none',
    stress: c.stressLevel ?? 'unknown',
    sleepQuality: c.sleepQuality || 'not specified',
    difficulties: c.difficulties || 'none reported',
    thoughtsToday: c.thoughtsToday || 'none reported',
    gratitude: c.gratitude || 'none reported',
    tomorrowHelp: c.tomorrowHelp || 'none reported',
    energySource: c.energySource || 'not specified',
    socialConnection: c.socialConnection ?? 'not specified'
  }));

  const prompt = `
    You are an empathetic, professional AI wellness coach for a mental health app called MindMend.
    Based on the user's recent emotional history for the past few days, generate exactly 2 personalized, highly actionable, and encouraging wellness tips (1-2 sentences each).

    User's recent history (from newest to oldest):
    ${JSON.stringify(recentData, null, 2)}

    Strictly return ONLY a valid JSON array of strings containing exactly 2 tips. Do not write any markdown wrappers like \`\`\`json, intro text, or explanation. Example format:
    ["Tip number one", "Tip number two"]
  `;

  try {
    //pokličemo model preko novega Firebase AI SDK-ja
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    console.log("Uraden Firebase AI odgovor:", text);

    let cleanJson = text;
    if (cleanJson.includes("```")) {
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Napaka znotraj Firebase AI servisa:", error);
    return fallbackTips;
  }
}