import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Appointment } from '../types/appointments';
import type {
  AppointmentMessage,
  ClientFile,
  ClientFileDetailsData,
  ClientFileSummary,
  ClientWellbeingSummary,
  CreateClientFileInput,
} from '../types/clientFiles';

const getClientFileId = (therapistId: string, userId: string): string => {
  return `${therapistId}_${userId}`;
};

const mapDateValue = (value: any): string => {
  return value?.toDate?.()?.toISOString?.() ?? value ?? '';
};

const mapClientFileDocument = (documentSnapshot: any): ClientFile => {
  const data = documentSnapshot.data();

  return {
    id: documentSnapshot.id,
    therapistId: data.therapistId ?? '',
    userId: data.userId ?? '',
    userName: data.userName ?? 'Client',
    userEmail: data.userEmail ?? '',
    userPhotoURL: data.userPhotoURL ?? '',
    status: data.status ?? 'active',
    totalSessions: Number(data.totalSessions ?? 0),
    lastAppointmentAt: mapDateValue(data.lastAppointmentAt),
    nextAppointmentAt: mapDateValue(data.nextAppointmentAt),
    createdAt: mapDateValue(data.createdAt),
    updatedAt: mapDateValue(data.updatedAt),
  };
};

const mapAppointmentDocument = (documentSnapshot: any): Appointment => {
  const data = documentSnapshot.data();

  return {
    id: documentSnapshot.id,
    ...data,
    createdAt: mapDateValue(data.createdAt),
    updatedAt: mapDateValue(data.updatedAt),
  } as Appointment;
};

const mapAppointmentMessageDocument = (documentSnapshot: any): AppointmentMessage => {
  const data = documentSnapshot.data();

  return {
    id: documentSnapshot.id,
    appointmentId: data.appointmentId ?? '',
    therapistId: data.therapistId ?? '',
    userId: data.userId ?? '',
    senderId: data.senderId ?? '',
    senderRole: data.senderRole ?? 'user',
    message: data.message ?? '',
    createdAt: mapDateValue(data.createdAt),
  };
};

const getClientAppointments = async (therapistId: string, userId: string): Promise<Appointment[]> => {
  const appointmentsQuery = query(
    collection(db, 'appointments'),
    where('therapistId', '==', therapistId),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(appointmentsQuery);
  return snapshot.docs.map(mapAppointmentDocument);
};

const getClientWellbeingSummary = async (userId: string): Promise<ClientWellbeingSummary> => {
  const checkInsQuery = query(
    collection(db, 'dnevniki'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(checkInsQuery);
  const checkIns = snapshot.docs.map((item) => item.data());
  const lastThirtyDays = new Date();
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);

  const recentCheckIns = checkIns.filter((checkIn) => {
    const checkInDate = new Date(checkIn.date);
    return checkInDate >= lastThirtyDays;
  });

  const stressLevels = recentCheckIns
    .map((checkIn) => Number(checkIn.stressLevel))
    .filter((value) => !Number.isNaN(value));

  const emotionCounts = recentCheckIns.reduce<Record<string, number>>((acc, checkIn) => {
    const emotion = checkIn.dominantEmotion || checkIn.emotionalState;
    if (!emotion) return acc;
    acc[emotion] = (acc[emotion] ?? 0) + 1;
    return acc;
  }, {});

  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Not enough data';

  return {
    totalCheckIns: checkIns.length,
    recentCheckIns: recentCheckIns.length,
    averageStressLevel: stressLevels.length > 0
      ? Math.round((stressLevels.reduce((sum, value) => sum + value, 0) / stressLevels.length) * 10) / 10
      : null,
    dominantEmotion,
    latestCheckInDate: checkIns[0]?.date ?? '',
  };
};

export const upsertClientFileForAppointment = async (input: CreateClientFileInput): Promise<void> => {
  const clientFileId = getClientFileId(input.therapistId, input.userId);
  const clientFileRef = doc(db, 'clientFiles', clientFileId);
  const snapshot = await getDoc(clientFileRef);

  const baseData = {
    therapistId: input.therapistId,
    userId: input.userId,
    userName: input.userName,
    ...(input.userEmail ? { userEmail: input.userEmail } : {}),
    ...(input.userPhotoURL ? { userPhotoURL: input.userPhotoURL } : {}),
    status: 'active',
    updatedAt: serverTimestamp(),
  };

  if (snapshot.exists()) {
    await setDoc(clientFileRef, baseData, { merge: true });
    return;
  }

  await setDoc(clientFileRef, {
    ...baseData,
    totalSessions: 0,
    createdAt: serverTimestamp(),
  });
};

export const getTherapistClientFiles = async (therapistId: string): Promise<ClientFileSummary[]> => {
  const clientFilesQuery = query(
    collection(db, 'clientFiles'),
    where('therapistId', '==', therapistId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(clientFilesQuery);
  const clientFiles = snapshot.docs.map(mapClientFileDocument);

  const summaries = await Promise.all(
    clientFiles.map(async (clientFile) => {
      const appointments = await getClientAppointments(therapistId, clientFile.userId);
      const now = new Date();
      const nextAppointment = appointments
        .filter((appointment) => appointment.status === 'CONFIRMED' && new Date(`${appointment.date}T${appointment.endTime}`) >= now)
        .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())[0];
      const lastAppointment = appointments
        .filter((appointment) => appointment.status === 'COMPLETED' || new Date(`${appointment.date}T${appointment.endTime}`) < now)
        .sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime())[0];

      return {
        ...clientFile,
        totalSessions: appointments.length,
        lastAppointment,
        nextAppointment,
      };
    })
  );

  return summaries;
};

export const getClientFileDetails = async (
  therapistId: string,
  userId: string
): Promise<ClientFileDetailsData | null> => {
  const clientFileId = getClientFileId(therapistId, userId);
  const clientFileRef = doc(db, 'clientFiles', clientFileId);
  const snapshot = await getDoc(clientFileRef);

  if (!snapshot.exists()) return null;

  const clientFile = mapClientFileDocument(snapshot);
  const appointments = await getClientAppointments(therapistId, userId);
  const wellbeingSummary = await getClientWellbeingSummary(userId);

  return {
    clientFile,
    appointments,
    wellbeingSummary,
  };
};

export const updateClientAppointmentNotes = async (
  appointmentId: string,
  therapistNotes: string,
  nextSteps: string
): Promise<void> => {
  const updateData = {
    ...(therapistNotes.trim() ? { therapistNotes: therapistNotes.trim() } : { therapistNotes: '' }),
    ...(nextSteps.trim() ? { nextSteps: nextSteps.trim() } : { nextSteps: '' }),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(doc(db, 'appointments', appointmentId), updateData);
};

export const getAppointmentMessages = async (
  appointmentId: string,
  therapistId: string,
  userId: string
): Promise<AppointmentMessage[]> => {
  const messagesQuery = query(
    collection(db, 'appointmentMessages'),
    where('appointmentId', '==', appointmentId),
    where('therapistId', '==', therapistId),
    where('userId', '==', userId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(messagesQuery);
  return snapshot.docs.map(mapAppointmentMessageDocument);
};
