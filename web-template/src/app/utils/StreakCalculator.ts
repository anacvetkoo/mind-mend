import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface StreakData {
  current: number;
  longest: number;
}

const DIARY_COLLECTION = 'dnevniki';
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const EMPTY_STREAK: StreakData = { current: 0, longest: 0 };

const toDateString = (date: Date): string => date.toISOString().split('T')[0];

const getDayDifference = (firstDate: string, secondDate: string): number => {
  const differenceInMs = Math.abs(
    new Date(firstDate).getTime() - new Date(secondDate).getTime()
  );

  return Math.ceil(differenceInMs / MILLISECONDS_PER_DAY);
};


const calculateCurrentStreak = (dates: string[]): number => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const newestDate = dates[0];
  if (newestDate !== toDateString(today) && newestDate !== toDateString(yesterday)) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const dayDifference = getDayDifference(dates[i], dates[i + 1]);

    if (dayDifference === 1) {
      streak++;
    } else if (dayDifference > 1) {
      break;
    }
  }

  return streak;
};

const calculateLongestStreak = (dates: string[]): number => {
  let longestStreak = 0;
  let runLength = 1;

  for (let i = 0; i < dates.length - 1; i++) {
    const dayDifference = getDayDifference(dates[i], dates[i + 1]);

    if (dayDifference === 1) {
      runLength++;
    } else if (dayDifference > 1) {
      longestStreak = Math.max(longestStreak, runLength);
      runLength = 1;
    }
  }

  return Math.max(longestStreak, runLength);
};

export async function getStreakDataFromFirestore(): Promise<StreakData> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return { ...EMPTY_STREAK };
  }

  try {
    const diaryQuery = query(
      collection(db, DIARY_COLLECTION),
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(diaryQuery);

    const dates: string[] = [];
    querySnapshot.forEach((entry) => {
      const { date } = entry.data();
      if (date && !dates.includes(date)) {
        dates.push(date);
      }
    });

    if (dates.length === 0) {
      return { ...EMPTY_STREAK };
    }

    return {
      current: calculateCurrentStreak(dates),
      longest: calculateLongestStreak(dates),
    };
  } catch (error) {
    console.error('Failed to calculate streak from Firestore:', error);
    return { ...EMPTY_STREAK };
  }
}