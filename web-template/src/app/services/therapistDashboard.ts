import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Appointment } from '../types/appointments';

export interface TherapistDashboardStats {
  totalSessions: number;
  activeClients: number;
  contentPublished: number;
  rating: number | null;
}

const isCompletedConfirmedAppointment = (appointment: Appointment) => {
  if (appointment.status !== 'CONFIRMED') return false;

  const appointmentEndDate = new Date(`${appointment.date}T${appointment.endTime}`);

  return appointmentEndDate < new Date();
};

export const getTherapistDashboardStats = async (
  therapistId: string,
  appointments: Appointment[]
): Promise<TherapistDashboardStats> => {
  const completedSessions = appointments.filter(isCompletedConfirmedAppointment);

  const clientFilesQuery = query(
    collection(db, 'clientFiles'),
    where('therapistId', '==', therapistId),
    where('status', '==', 'active')
  );

  const contentQuery = query(
    collection(db, 'content'),
    where('therapistId', '==', therapistId)
  );

  const [clientFilesSnapshot, contentSnapshot, therapistSnapshot] = await Promise.all([
    getDocs(clientFilesQuery),
    getDocs(contentQuery),
    getDoc(doc(db, 'users', therapistId)),
  ]);

  const therapistData = therapistSnapshot.exists() ? therapistSnapshot.data() : null;
  const rating = typeof therapistData?.rating === 'number' ? therapistData.rating : null;

  return {
    totalSessions: completedSessions.length,
    activeClients: clientFilesSnapshot.size,
    contentPublished: contentSnapshot.docs.filter((contentDocument) => {
  const contentData = contentDocument.data();

  return contentData.isDraft !== true;
}).length,
    rating,
  };
};