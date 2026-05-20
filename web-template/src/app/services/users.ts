import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection, getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { UserRole } from './auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: any;
  hasCompletedOnboarding: boolean;
  hasCompletedQuestionnaire: boolean;
}

export interface TherapistDocument {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'therapist';
  createdAt: any;
  hasCompletedOnboarding: boolean;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export const createUserDocument = async (
  uid: string,
  data: { email: string; displayName: string; photoURL?: string }
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL ?? '',
    role: 'user',
    createdAt: serverTimestamp(),
    hasCompletedOnboarding: false,
    hasCompletedQuestionnaire: false,
  });
};

export const createTherapistDocument = async (
  uid: string,
  data: { email: string; firstName: string; lastName: string }
): Promise<void> => {
  const therapistRef = doc(db, 'users', uid);
  await setDoc(therapistRef, {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'therapist',
    createdAt: serverTimestamp(),
    hasCompletedOnboarding: false,
    isApproved: false,
    profileComplete: false,
  });
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getUserDocument = async (
  uid: string
): Promise<(UserDocument | TherapistDocument) | null> => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return null;

  return { uid: snapshot.id, ...snapshot.data() } as UserDocument | TherapistDocument;
};

export const updateUserDisplayName = async (
  uid: string,
  displayName: string
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { displayName }, { merge: true });
};

export const updateTherapistProfile = async (
  uid: string,
  profileData: {
    name?: string;
    title?: string;
    specializations?: string[];
    fieldOfWork?: string;
    bio?: string;
    yearsOfExperience?: string;
    education?: string;
    licenseNumber?: string;
    profileImage?: string;
  }
): Promise<void> => {
  const therapistRef = doc(db, 'users', uid);
  await setDoc(therapistRef, profileData, { merge: true });
};

export const updateTherapistAvailability = async (
  uid: string,
  availability: any
): Promise<void> => {
  const therapistRef = doc(db, 'users', uid);
  await setDoc(therapistRef, { availability }, { merge: true });
};

export const getTherapistAvailability = async (
  uid: string
): Promise<any | null> => {
  const therapistRef = doc(db, 'users', uid);
  const snapshot = await getDoc(therapistRef);
  if (!snapshot.exists()) return null;
  return snapshot.data().availability ?? null;
};

export const updateBlockedTimes = async (
  uid: string,
  blockedTimes: any[]
): Promise<void> => {
  const therapistRef = doc(db, 'users', uid);
  await setDoc(therapistRef, { blockedTimes }, { merge: true });
};

export const getBlockedTimes = async (
  uid: string
): Promise<any[]> => {
  const therapistRef = doc(db, 'users', uid);
  const snapshot = await getDoc(therapistRef);
  if (!snapshot.exists()) return [];
  const result = snapshot.data().blockedTimes ?? [];
  console.log('[getBlockedTimes] uid:', uid, '| blockedTimes:', JSON.stringify(result));
  return result;
};

// ─── Dark Mode (per-user) ─────────────────────────────────────────────────────

export const getUserDarkMode = async (uid: string): Promise<boolean> => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return false;
  return snapshot.data().darkMode ?? false;
};

export const updateUserDarkMode = async (uid: string, darkMode: boolean): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { darkMode }, { merge: true });
};

// ─── Notifications (per-user) ─────────────────────────────────────────────────

export const getUserNotificationsEnabled = async (uid: string): Promise<boolean> => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return false;
  return snapshot.data().notificationsEnabled ?? false;
};

export const updateUserNotificationsEnabled = async (uid: string, notificationsEnabled: boolean): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { notificationsEnabled }, { merge: true });
};

// ─── Biometric Auth (per-user) ────────────────────────────────────────────────

export const getUserBiometricAuthEnabled = async (uid: string): Promise<boolean> => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return false;
  return snapshot.data().biometricAuthEnabled ?? false;
};

export const updateUserBiometricAuthEnabled = async (uid: string, biometricAuthEnabled: boolean): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { biometricAuthEnabled }, { merge: true });
};


export interface TherapistContentPreview {
  id: string;
  title: string;
  category?: string;
  duration?: string;
  
}

export interface TherapistProfileData {
  id: string;
  name: string;
  avatar: string;
  title: string;
  specialization: string;
  rating: number;
  reviews: number;
  bio: string;
  tags: string[];
  yearsExperience: number;
  sessionsCompleted: number;
  content: TherapistContentPreview[];
}

const getStringValue = (...values: unknown[]): string => {
  const value = values.find((item) => typeof item === 'string' && item.trim() !== '');

  return typeof value === 'string' ? value.trim() : '';
};

const mapTherapistData = (id: string, data: any): TherapistProfileData => {
  const firstName = getStringValue(data.firstName);
  const lastName = getStringValue(data.lastName);

  return {
    id,
    name:
      getStringValue(
        data.displayName,
        data.fullName,
        data.name,
        `${firstName} ${lastName}`.trim()
      ) || 'Therapist',
    avatar:
      getStringValue(
        data.photoURL,
        data.profileImage,
        data.profileImageUrl
      ),
    title:
      getStringValue(
        data.title,
        data.fieldOfWork,
        data.profession
      ) || 'Mental health professional',
    specialization:
      getStringValue(
        data.fieldOfWork,
        data.specialization
      ),
    rating: data.rating || 5,
    reviews: data.reviews || data.reviewCount || 0,
    bio:
      getStringValue(
        data.bio,
        data.about,
        data.description
      ) || 'This therapist creates supportive mental health and wellness content.',
    tags: data.specializations || data.tags || [],
    yearsExperience: Number(data.yearsOfExperience || data.yearsExperience || 0),
    sessionsCompleted: Number(data.sessionsCompleted || 0),
    content: []
  };
};

const getTherapistContent = async (therapistId: string): Promise<TherapistContentPreview[]> => {
  const contentQuery = query(
    collection(db, 'content'),
    where('therapistId', '==', therapistId)
  );

  const snapshot = await getDocs(contentQuery);

  return snapshot.docs.map((contentDocument) => {
  const data = contentDocument.data();

  return {
    id: contentDocument.id,
    title: getStringValue(data.title) || 'Untitled content',
    category: getStringValue(data.category, data.contentType),
    duration: getStringValue(data.duration),
    ...data,
  };
});
};

export const getTherapistById = async (therapistId: string): Promise<TherapistProfileData | null> => {
  const therapistRef = doc(db, 'users', therapistId);
  const snapshot = await getDoc(therapistRef);

  if (!snapshot.exists()) return null;

  const therapist = mapTherapistData(snapshot.id, snapshot.data());
  const content = await getTherapistContent(therapistId);

  return {
    ...therapist,
    content,
  };
};

export const getTherapists = async (): Promise<TherapistProfileData[]> => {
  const therapistsQuery = query(collection(db, 'users'), where('role', '==', 'therapist'));
  const snapshot = await getDocs(therapistsQuery);

  return snapshot.docs.map((therapistDocument) =>
    mapTherapistData(therapistDocument.id, therapistDocument.data())
  );
};