import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { analizirajDnevnikZAI } from "./aiService";

const KOLEKCIJA_DNEVNIKI = "dnevniki";

/**
 * Shrani dnevnik, sproži AI analizo in posodobi dokument v bazi.
 */
export const ustvariInAnalizirajDnevnik = async (userId, vnosPodatki) => {
  try {
    const noviDnevnik = {
      userId: userId,
      datum: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      timestamp: new Date().toISOString(),
      razpolozenje: vnosPodatki.razpolozenje, // { glavno: "", podrobno: [] }
      vprasanja_check_in: vnosPodatki.vprasanja_check_in, // { spanje: "", to_do: true }
      zapis: vnosPodatki.zapis,
      ai_analiza: {
        analizirano: false,
        razpolozenje_potrjeno: "",
        sprozilci: [],
        nasvet: "Analiziram..."
      }
    };

    //shranimo osnovne podatke v Firestore (varnost, če internet prekine)
    const docRef = await addDoc(collection(db, KOLEKCIJA_DNEVNIKI), noviDnevnik);
    console.log("Osnovni dnevnik shranjen z ID:", docRef.id);

    const aiRezultat = await analizirajDnevnikZAI(noviDnevnik); //ai analiza dnevnika

    const dokumentReference = doc(db, KOLEKCIJA_DNEVNIKI, docRef.id);
    await updateDoc(dokumentReference, {
      "ai_analiza.analizirano": true,
      "ai_analiza.razpolozenje_potrjeno": aiRezultat.razpolozenje_potrjeno,
      "ai_analiza.sprozilci": aiRezultat.sprozilci,
      "ai_analiza.nasvet": aiRezultat.nasvet
    });

    return {
      id: docRef.id,
      ...noviDnevnik,
      ai_analiza: { analizirano: true, ...aiRezultat }
    };

  } catch (error) {
    console.error("Napaka v ustvariInAnalizirajDnevnik:", error);
    throw error;
  }
};

/**
 * Pridobi zgodovino vseh dnevnikov za določenega uporabnika.
 */
export const pridobiZgodovinoDnevnikov = async (userId) => {
  try {
    const q = query(
      collection(db, KOLEKCIJA_DNEVNIKI),
      where("userId", "==", userId),
      orderBy("timestamp", "desc") // Najprej najnovejši
    );

    const querySnapshot = await getDocs(q);
    const dnevniki = [];
    
    querySnapshot.forEach((doc) => {
      dnevniki.push({ id: doc.id, ...doc.data() });
    });

    return dnevniki;
  } catch (error) {
    console.error("Napaka pri pridobivanju zgodovine:", error);
    return [];
  }
};