import { db, auth } from '../services/firebaseConfig'; // Prilagodite pot do vaše firebaseConfig datoteke
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface StreakData {
  current: number;
  longest: number;
}

export async function getStreakDataFromFirestore(): Promise<StreakData> {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return { current: 0, longest: 0 };
  }

  try {
    const q = query(
      collection(db, "dnevniki"), 
      where("userId", "==", currentUser.uid),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    
    const dates: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.date && !dates.includes(data.date)) {
        dates.push(data.date);
      }
    });

    if (dates.length === 0) {
      return { current: 0, longest: 0 };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    if (dates[0] === todayStr || dates[0] === yesterdayStr) {
      currentStreak = 1;
      for (let i = 0; i < dates.length - 1; i++) {
        const currentNum = new Date(dates[i]).getTime();
        const nextNum = new Date(dates[i + 1]).getTime();
        const diffTime = Math.abs(currentNum - nextNum);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          break; 
        }
      }
    }

    // najdaljši streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 0; i < dates.length - 1; i++) {
      const currentNum = new Date(dates[i]).getTime();
      const nextNum = new Date(dates[i + 1]).getTime();
      const diffTime = Math.abs(currentNum - nextNum);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1; 
      }
    }
    
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return {
      current: currentStreak,
      longest: longestStreak
    };

  } catch (error) {
    console.error("Napaka pri računanju streaka iz Firestore:", error);
    return { current: 0, longest: 0 };
  }
}