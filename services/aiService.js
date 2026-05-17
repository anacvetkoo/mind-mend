import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Funkcija pošlje podatke dnevnika na Gemini in vrne strukturirano analizo(JSON). Ko bomo kaj pošiljale Gemini-ji, kličemo to funkcijo z pripravljenim promptom
 * @param {Object} podatkiDnevnika - Celotni podatki o današnjem dnevniku
 */

export const analizirajDnevnikZAI = async (podatkiDnevnika) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      const prompt = `
        Deluj kot nežen, empatičen in strokoven terapevtski pomočnik v aplikaciji MindMend. 
        Analiziraj današnji dnevni vnos uporabnika in vrni podatke v strogem JSON formatu.
  
        PODATKI O UPORABNIKU ZA DANES:
        - Glavno počutje (smeško): ${podatkiDnevnika.razpolozenje.glavno}
        - Podrobni občutki: ${podatkiDnevnika.razpolozenje.podrobno.join(", ")}
        - Spanec/stres check-in: ${JSON.stringify(podatkiDnevnika.vprasanja_check_in)}
        - Osebni zapis uporabnika: "${podatkiDnevnika.zapis}"
  
        NAVODILA ZA ANALIZO:
        1. Kratko oceni čustveno stanje v polju "razpolozenje_potrjeno".
        2. Iz besedila in podatkov poskusi izluščiti glavne sprožilce (triggers) za to stanje (maksimalno 3).
        3. Podaj osebno prilagojen, topel terapevtski nasvet (največ 3 stavki).
  
        ODGOVORI IZKLJUČNO V TEM JSON FORMATU (brez kakršnih koli markdown oznak ali uvodnega teksta):
        {
          "razpolozenje_potrjeno": "izluščeno stanje",
          "sprozilci": ["sprožilec 1", "sprožilec 2"],
          "nasvet": "tvoj prijazen nasvet uporabniku"
        }
      `;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResult = response.text();
  
      const cistiJson = textResult.replace(/```json|```/g, "").trim();
  
      return JSON.parse(cistiJson);
    } catch (error) {
      console.error("Napaka pri Gemini AI analizi:", error);
      return {
        razpolozenje_potrjeno: "Neznano",
        sprozilci: [],
        nasvet: "Danes mi ni uspelo analizirati tvojega dnevnika, a tvoji občutki so vedno pomembni. Vzemí si trenutek zase. 🌿"
      };
    }
  };