import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { createUserDocument, createTherapistDocument, getUserDocument } from './users';

export type UserRole = 'user' | 'therapist';

export interface AuthResult {
  success: boolean;
  role?: UserRole;
  error?: string;
}

const googleProvider = new GoogleAuthProvider();

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getUserDocument(credential.user.uid);

    if (!userDoc) {
      return { success: false, error: 'User data not found. Please contact support.' };
    }

    return { success: true, role: userDoc.role };
  } catch (err: any) {
    return { success: false, error: mapAuthError(err.code) };
  }
};

export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const userDoc = await getUserDocument(credential.user.uid);

    if (!userDoc) {
      await createUserDocument(credential.user.uid, {
        email: credential.user.email ?? '',
        displayName: credential.user.displayName ?? '',
      });
      return { success: true, role: 'user' };
    }

    return { success: true, role: userDoc.role };
  } catch (err: any) {
    return { success: false, error: mapAuthError(err.code) };
  }
};

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export const signUpUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(credential.user.uid, {
      email,
      displayName: '',
    });
    return { success: true, role: 'user' };
  } catch (err: any) {
    return { success: false, error: mapAuthError(err.code) };
  }
};

export const signUpTherapist = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<AuthResult> => {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await createTherapistDocument(credential.user.uid, {
      email,
      firstName,
      lastName,
    });
    return { success: true, role: 'therapist' };
  } catch (err: any) {
    return { success: false, error: mapAuthError(err.code) };
  }
};

// ─── Logout / Password Reset ──────────────────────────────────────────────────

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const sendPasswordReset = async (email: string): Promise<AuthResult> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: mapAuthError(err.code) };
  }
};

// ─── Auth State Observer ──────────────────────────────────────────────────────

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ─── Error Mapping ────────────────────────────────────────────────────────────

const mapAuthError = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    default:
      return 'Something went wrong. Please try again.';
  }
};