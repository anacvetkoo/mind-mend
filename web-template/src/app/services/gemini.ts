import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { app, db } from './firebaseConfig';
import { doc, updateDoc } from "firebase/firestore";

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

//AI podrobnejša analiza
export async function generateAIAnalysis(pastLogs: any[]): Promise<string> {
  const formattedLogs = (pastLogs || []).slice(0, 10).map((log, index) => `
--- ENTRY #${index + 1} ---
Date: ${log.date}
Overall Mood: ${log.mood}
Dominant Emotions: ${log.emotions}
Stress Level (1-10): ${log.stressLevel}
Sleep Quality: ${log.sleepQuality}
Reported Difficulties: ${log.difficulties}
Thoughts Logged: "${log.thoughtsToday}"
Gratitude: "${log.gratitude}"
What would help tomorrow: "${log.tomorrowHelp}"
`).join('\n');

  const prompt = `
    You are MindMend AI, an expert cognitive-behavioral insights assistant. 
    Analyze the following last 10 psychological journal entries of a user to discover deep emotional insights, track stress levels, find behavioral patterns, and uncover specific emotional triggers.

    User's journal data:
    ${formattedLogs}

    Please provide a highly professional, empathetic, and comprehensive mental wellness report. 
    Structure your response cleanly using bullet points and clear sections:
    1. **Mood & Stress Trajectory**: Analyze how their mood and stress level have been trending over time.
    2. **Key Triggers & Patterns**: Identify recurring themes, situations, or thoughts that seem to cause distress, tiredness, or restlessness.
    3. **Hidden Strengths & Gratitude**: Highlight positive moments, resilience factors, or sources of comfort they mentioned.
    4. **Actionable Mindfulness Advice**: Give 2-3 tailored, highly practical cognitive-behavioral tips to break negative cycles based on these 10 logs.

    Keep the tone grounding, direct, and supportive. Use clear paragraph breaks. Do not use markdown headers like '#' but you can use bold text '**' for emphasis.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    return text || "No analysis could be generated at this time.";
  } catch (error) {
    console.error("Napaka znotraj Firebase AI servisa (Deep Analysis):", error);
    return "We were unable to compile your cognitive report at this moment. Please log another entry tomorrow or try reloading the screen shortly.";
  }
}


//chat z otto
export async function generateAITherapistReply(chatHistory: { sender: string; text: string }[]): Promise<string> {
  const formattedHistory = chatHistory.map(msg => {
    const role = msg.sender === 'user' ? 'User' : 'MindMend AI Therapist';
    return `${role}: ${msg.text}`;
  }).join('\n');

  const prompt = `
    You are Otto, an empathetic, supportive, and professional AI therapist for the mental health app MindMend. 
    Your goal is to guide the user using gentle cognitive-behavioral insights, active listening, and grounding techniques.

    Rules for your persona:
    - Keep your answers relatively short, conversational, and warm (1-3 sentences maximum).
    - Never sound like a rigid machine; sound like a compassionate counselor.
    - Ask open-ended questions when appropriate to let the user express themselves.
    - Do not give clinical medical diagnoses.

    Here is the conversation history so far:
    ${formattedHistory}

    Provide the next logical, caring response as Otto:
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    return text || "I am here and listening. Tell me more.";
  } catch (error) {
    console.error("Napaka znotraj Firebase AI servisa (Chat):", error);
    return "I hear you, and I'm so sorry you're dealing with this. Can you expand a little bit more on how that makes you feel?";
  }
}

//generiranje recomended contenta
export async function generateAIRecommendations(checkIns: any[], userId: string, availableContent: any[]): Promise<{ id?: string; category: 'relaxation' | 'breathing' | 'sound therapy'; difficulty: 'easy' | 'medium' | 'hard'; duration: string; title: string; description: string }[]> {
  const fallbackRecommendations = [
    { id: "rec-1", category: 'breathing' as const, difficulty: 'easy' as const, duration: '5 min', title: 'Box Breathing Technique', description: 'Calm your nervous system instantly.' },
    { id: "rec-2", category: 'relaxation' as const, difficulty: 'medium' as const, duration: '10 min', title: 'Progressive Muscle Relaxation', description: 'Release physical tension from head to toe.' },
    { id: "rec-3", category: 'sound therapy' as const, difficulty: 'easy' as const, duration: '15 min', title: 'Tibetan Singing Bowls', description: 'Deep alpha waves for mental clarity.' }
  ];

  const recentData = (checkIns || []).slice(0, 5).map(c => ({
    mood: c.emotionalState || 'neutral',
    emotions: Array.isArray(c.dominantEmotion) ? c.dominantEmotion.join(', ') : c.dominantEmotion || 'none',
    stress: c.stressLevel ?? 'unknown',
    sleepQuality: c.sleepQuality || 'not specified',
    difficulties: c.difficulties || 'none reported'
  }));

  const cleanDbContent = (availableContent || []).map(item => ({
    id: item.id || item.docId,
    title: item.title,
    category: item.category,
    difficulty: item.difficulty,
    duration: item.duration || 'Not specified',
    description: item.description
  }));

  const prompt = `
    You are an AI mental health content recommender for the MindMend app.
    
    TASK:
    Analyze the user's recent emotional state and select EXACTLY 3 matching exercises from our official library provided below. Do not invent new exercises. Choose only from the provided list.

    USER'S RECENT EMOTIONAL STATE:
    ${JSON.stringify(recentData, null, 2)}

    OFFICIAL LIBRARY CONTENT AVAILABLE IN OUR DATABASE:
    ${JSON.stringify(cleanDbContent, null, 2)}

    CRITICAL RULES:
    1. Select exactly 3 objects that would best help the user based on their mood, stress, and difficulties.
    2. Keep the original 'id', 'category', 'difficulty', 'duration', 'title', and 'description' exactly as they appear in the library list.
    3. Strictly return ONLY a valid JSON array containing exactly 3 objects. Do not write markdown wrappers like \`\`\`json, no chat, no intro, no explanation.

    Example output format:
    [
      { "id": "obstoječi-id-1", "category": "breathing", "difficulty": "easy", "duration": "5 min", "title": "Realen Naslov Iz Baze", "description": "Realen opis iz baze." },
      ...
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    let cleanJson = text;
    if (cleanJson.includes("```")) {
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const parsedRecommendations = JSON.parse(cleanJson);

    if (userId) {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        latestAIRecommendations: parsedRecommendations
      });
      console.log("Uporabnikova personalizirana priporočila iz baze so shranjena!");
    }
    return parsedRecommendations;
  } catch (error) {
    console.error("Napaka znotraj Firebase AI servisa (Recommendations):", error);
    return fallbackRecommendations;
  }
}