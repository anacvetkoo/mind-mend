import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface OnboardingData {
  name: string;
  healthGoal?: string;
  gender?: string;
  age?: number;
  mood?: string;
  professionalHelp?: string;
  physicalDistress?: string;
  medications?: string;
  medicationSpec?: string[];
  symptoms?: string[];
  checkInTime?: string;
}

const shouldSaveValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (value === false) return false;
  if (value === 'no') return false;
  if (value === 'skip') return false;
  if (Array.isArray(value) && value.length === 0) return false;

  return true;
};

export const completeUserOnboarding = async (
  uid: string,
  data: OnboardingData
): Promise<void> => {
  const userRef = doc(db, 'users', uid);

  const userUpdateData: Record<string, unknown> = {
    hasCompletedOnboarding: true,
    hasCompletedQuestionnaire: true,
  };

  if (shouldSaveValue(data.name)) {
    userUpdateData.displayName = data.name.trim();
  }

  if (shouldSaveValue(data.gender)) {
    userUpdateData.gender = data.gender;
  }

  if (shouldSaveValue(data.age)) {
    userUpdateData.age = data.age;
  }

  if (shouldSaveValue(data.professionalHelp)) {
    userUpdateData.professionalHelp = data.professionalHelp;
  }

  if (shouldSaveValue(data.physicalDistress)) {
    userUpdateData.physicalDistress = data.physicalDistress;
  }

  if (shouldSaveValue(data.medications)) {
    userUpdateData.medications = data.medications;
  }

  if (shouldSaveValue(data.medicationSpec)) {
    userUpdateData.medicationSpec = data.medicationSpec;
  }

  if (shouldSaveValue(data.symptoms)) {
    userUpdateData.symptoms = data.symptoms;
  }

  if (shouldSaveValue(data.checkInTime)) {
    userUpdateData.checkInTime = data.checkInTime;
  }

  await setDoc(userRef, userUpdateData, { merge: true });

  const journalData: Record<string, unknown> = {
    userId: uid,
    datum: new Date().toISOString().split('T')[0],
    type: 'onboarding',
  };

  if (shouldSaveValue(data.healthGoal)) {
    journalData.healthGoal = data.healthGoal;
  }

  if (shouldSaveValue(data.mood)) {
    journalData.mood = data.mood;
  }

  await addDoc(collection(db, 'dnevniki'), journalData);
};