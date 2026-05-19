import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { UserRole } from './auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
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
  data: { email: string; displayName: string }
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    email: data.email,
    displayName: data.displayName,
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