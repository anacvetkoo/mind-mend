import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Appointment, AppointmentStatus } from '../types/appointments';
import { upsertClientFileForAppointment } from './clientFiles';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createAppointment = async (
  data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = collection(db, 'appointments');
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await upsertClientFileForAppointment({
    therapistId: data.therapistId,
    userId: data.userId,
    userName: data.userName,
    appointmentType: data.appointmentType,
    appointmentDate: data.date,
  });

  return docRef.id;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

const mapAppointmentDoc = (d: any): Appointment => ({
  id: d.id,
  ...d.data(),
  createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? '',
  updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? '',
}) as Appointment;

export const getAppointmentsForUser = async (userId: string): Promise<Appointment[]> => {
  const q = query(
    collection(db, 'appointments'),
    where('userId', '==', userId),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapAppointmentDoc);
};

export const getAppointmentsForTherapist = async (therapistId: string): Promise<Appointment[]> => {
  const q = query(
    collection(db, 'appointments'),
    where('therapistId', '==', therapistId),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapAppointmentDoc);
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  paymentId?: string
): Promise<void> => {
  await updateDoc(doc(db, 'appointments', appointmentId), {
    status,
    ...(paymentId ? { paymentId } : {}),
    updatedAt: serverTimestamp(),
  });
};

export const cancelAppointment = async (
  appointmentId: string,
  cancelledByTherapist = false
): Promise<void> => {
  const status: AppointmentStatus = cancelledByTherapist
    ? 'CANCELLED_BY_THERAPIST'
    : 'CANCELLED';

  await updateAppointmentStatus(appointmentId, status);
};

// Terapevt začne sejo → status IN_SESSION → user vidi aktivni "Join Session"
export const startSession = async (appointmentId: string): Promise<void> => {
  await updateAppointmentStatus(appointmentId, 'IN_SESSION');
};

// Terapevt konča sejo → status COMPLETED
export const endSession = async (appointmentId: string): Promise<void> => {
  await updateAppointmentStatus(appointmentId, 'COMPLETED');
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const isAppointmentUpcoming = (apt: Appointment): boolean => {
  const now = new Date();
  const aptDate = new Date(`${apt.date}T${apt.endTime}`);
  return aptDate > now && apt.status === 'CONFIRMED';
};

export const isAppointmentPast = (apt: Appointment): boolean => {
  const now = new Date();
  const aptDate = new Date(`${apt.date}T${apt.endTime}`);
  return aptDate <= now || apt.status === 'COMPLETED';
};