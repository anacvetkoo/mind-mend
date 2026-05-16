// Daily check-in utilities for tracking, streaks, and AI analysis

const CHECK_INS_KEY = 'daily_check_ins';
const CURRENT_STREAK_KEY = 'current_streak';
const LONGEST_STREAK_KEY = 'longest_streak';

export interface CheckInData {
  id: string;
  date: string;
  timestamp: number;
  emotionalState?: string;
  dominantEmotion?: string;
  thoughtsToday?: string;
  stressLevel?: number;
  sleepQuality?: string;
  energySource?: string;
  difficulties?: string;
  socialConnection?: number;
  gratitude?: string;
  tomorrowHelp?: string;
}

export interface StreakData {
  current: number;
  longest: number;
}

// Get all check-ins
export function getAllCheckIns(): CheckInData[] {
  const stored = localStorage.getItem(CHECK_INS_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

// Save a new check-in
export function saveCheckIn(data: Omit<CheckInData, 'id'>): CheckInData {
  const checkIns = getAllCheckIns();
  const newCheckIn: CheckInData = {
    ...data,
    id: `check-in-${Date.now()}`
  };

  checkIns.push(newCheckIn);
  localStorage.setItem(CHECK_INS_KEY, JSON.stringify(checkIns));

  // Update streak
  updateStreak();

  return newCheckIn;
}

// Check if today's check-in is completed
export function isTodayCompleted(): boolean {
  const checkIns = getAllCheckIns();
  const today = new Date().toDateString();

  return checkIns.some(checkIn => {
    const checkInDate = new Date(checkIn.date).toDateString();
    return checkInDate === today;
  });
}

// Get today's check-in if it exists
export function getTodayCheckIn(): CheckInData | null {
  const checkIns = getAllCheckIns();
  const today = new Date().toDateString();

  const todayCheckIn = checkIns.find(checkIn => {
    const checkInDate = new Date(checkIn.date).toDateString();
    return checkInDate === today;
  });

  return todayCheckIn || null;
}

// Calculate and update streak
function updateStreak(): void {
  const checkIns = getAllCheckIns();
  if (checkIns.length === 0) {
    localStorage.setItem(CURRENT_STREAK_KEY, '0');
    return;
  }

  // Sort by date descending
  const sorted = checkIns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecentDate = new Date(sorted[0].date);
  mostRecentDate.setHours(0, 0, 0, 0);

  // Check if most recent is today or yesterday
  const dayDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff > 1) {
    streak = 0;
  } else {
    // Count consecutive days
    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);

      const currDate = new Date(sorted[i].date);
      currDate.setHours(0, 0, 0, 0);

      const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
  }

  localStorage.setItem(CURRENT_STREAK_KEY, streak.toString());

  // Update longest streak if needed
  const longestStreak = parseInt(localStorage.getItem(LONGEST_STREAK_KEY) || '0');
  if (streak > longestStreak) {
    localStorage.setItem(LONGEST_STREAK_KEY, streak.toString());
  }
}

// Get current streak data
export function getStreakData(): StreakData {
  return {
    current: parseInt(localStorage.getItem(CURRENT_STREAK_KEY) || '0'),
    longest: parseInt(localStorage.getItem(LONGEST_STREAK_KEY) || '0')
  };
}

// Get check-ins for a specific date range
export function getCheckInsInRange(startDate: Date, endDate: Date): CheckInData[] {
  const checkIns = getAllCheckIns();
  return checkIns.filter(checkIn => {
    const date = new Date(checkIn.date);
    return date >= startDate && date <= endDate;
  });
}

// Get check-ins for last N days
export function getRecentCheckIns(days: number): CheckInData[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return getCheckInsInRange(startDate, endDate);
}

// Mock AI analysis based on check-in data
export function generateAIInsights(checkInData: CheckInData): string[] {
  const insights: string[] = [];

  // Stress level insights
  if (checkInData.stressLevel !== undefined) {
    if (checkInData.stressLevel >= 7) {
      insights.push("Your stress level is quite high today. Consider taking short breaks and practicing deep breathing.");
    } else if (checkInData.stressLevel <= 3) {
      insights.push("Great job managing your stress today! Keep up the positive momentum.");
    }
  }

  // Sleep quality insights
  if (checkInData.sleepQuality === 'poor' || checkInData.sleepQuality === 'very-poor') {
    insights.push("Poor sleep can affect your mood and energy. Try to establish a calming bedtime routine.");
  } else if (checkInData.sleepQuality === 'excellent') {
    insights.push("Excellent sleep quality! This is giving you a strong foundation for the day.");
  }

  // Social connection insights
  if (checkInData.socialConnection !== undefined && checkInData.socialConnection <= 3) {
    insights.push("Feeling isolated? Even a brief connection with someone can make a difference.");
  }

  // Emotional state insights
  if (checkInData.emotionalState === 'anxious' || checkInData.emotionalState === 'stressed') {
    insights.push("When feeling anxious, grounding exercises can help bring you back to the present moment.");
  }

  if (insights.length === 0) {
    insights.push("Thank you for checking in today. You're building healthy self-awareness habits.");
  }

  return insights;
}

// Get days with completed check-ins for calendar marking
export function getCompletedDays(month: number, year: number): number[] {
  const checkIns = getAllCheckIns();
  const completedDays = new Set<number>();

  checkIns.forEach(checkIn => {
    const date = new Date(checkIn.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      completedDays.add(date.getDate());
    }
  });

  return Array.from(completedDays);
}

// Get weekly emotional trend
export function getWeeklyTrend(): string {
  const recentCheckIns = getRecentCheckIns(7);

  if (recentCheckIns.length === 0) {
    return 'Not enough data';
  }

  const stressLevels = recentCheckIns
    .map(c => c.stressLevel)
    .filter(s => s !== undefined) as number[];

  if (stressLevels.length === 0) {
    return 'Stable';
  }

  const avgStress = stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;

  if (avgStress >= 7) return 'High stress';
  if (avgStress <= 3) return 'Low stress';
  return 'Moderate';
}
