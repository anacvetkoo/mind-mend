import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Appointment } from '../types/appointments';
import type {
  AppointmentMessage,
  ClientFile,
  ClientFileDetailsData,
  ClientFileSummary,
  ClientProfileSummary,
  ClientWellbeingSummary,
  CreateClientFileInput,
  LatestCheckInSummary,
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

const getClientProfileSummary = async (userId: string): Promise<ClientProfileSummary> => {
  const userSnapshot = await getDoc(doc(db, 'users', userId));

  if (!userSnapshot.exists()) {
    return {
      gender: '',
      age: null,
      medications: '',
      medicationSpec: [],
      professionalHelp: '',
      symptoms: [],
      createdAt: '',
    };
  }

  const data = userSnapshot.data();

  return {
    gender: data.gender ?? '',
    age: typeof data.age === 'number' ? data.age : null,
    medications: data.medications ?? '',
    medicationSpec: Array.isArray(data.medicationSpec) ? data.medicationSpec : [],
    professionalHelp: data.professionalHelp ?? '',
    symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
    createdAt: mapDateValue(data.createdAt),
  };
};

const getLatestCheckInSummary = async (userId: string): Promise<LatestCheckInSummary | null> => {
  const checkInsQuery = query(
    collection(db, 'dnevniki'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(checkInsQuery);

  const latestCheckIn = snapshot.docs
    .map((item) => item.data())
    .sort((firstCheckIn, secondCheckIn) => {
      const firstDate = new Date(firstCheckIn.date ?? firstCheckIn.timestamp ?? '').getTime();
      const secondDate = new Date(secondCheckIn.date ?? secondCheckIn.timestamp ?? '').getTime();

      return secondDate - firstDate;
    })[0];

  if (!latestCheckIn) return null;

  return {
    date: latestCheckIn.date ?? '',
    emotionalState: latestCheckIn.emotionalState ?? '',
    dominantEmotion: Array.isArray(latestCheckIn.dominantEmotion) ? latestCheckIn.dominantEmotion : [],
    stressLevel: typeof latestCheckIn.stressLevel === 'number' ? latestCheckIn.stressLevel : null,
    sleepQuality: latestCheckIn.sleepQuality ?? '',
    socialConnection: typeof latestCheckIn.socialConnection === 'number' ? latestCheckIn.socialConnection : null,
    gratitude: latestCheckIn.gratitude ?? '',
    difficulties: latestCheckIn.difficulties ?? '',
    thoughtsToday: latestCheckIn.thoughtsToday ?? '',
    tomorrowHelp: latestCheckIn.tomorrowHelp ?? '',
    energySource: latestCheckIn.energySource ?? '',
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
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(appointmentsQuery);

  return snapshot.docs
    .map(mapAppointmentDocument)
    .sort((firstAppointment, secondAppointment) => {
      const firstDate = new Date(`${firstAppointment.date}T${firstAppointment.startTime}`).getTime();
      const secondDate = new Date(`${secondAppointment.date}T${secondAppointment.startTime}`).getTime();

      return secondDate - firstDate;
    });
};

const getClientWellbeingSummary = async (userId: string): Promise<ClientWellbeingSummary> => {
  const checkInsQuery = query(
  collection(db, 'dnevniki'),
  where('userId', '==', userId)
);

const snapshot = await getDocs(checkInsQuery);
const checkIns = snapshot.docs
  .map((item) => item.data())
  .sort((firstCheckIn, secondCheckIn) => {
    const firstDate = new Date(firstCheckIn.date).getTime();
    const secondDate = new Date(secondCheckIn.date).getTime();

    return secondDate - firstDate;
  });
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

const getAppointmentStartDate = (appointment: Appointment) => {
  return new Date(`${appointment.date}T${appointment.startTime}`);
};

const getAppointmentEndDate = (appointment: Appointment) => {
  return new Date(`${appointment.date}T${appointment.endTime}`);
};

const getCompletedAppointments = (appointments: Appointment[]) => {
  const now = new Date();

  return appointments.filter((appointment) => {
    if (appointment.status === 'COMPLETED') return true;

    if (appointment.status !== 'CONFIRMED') return false;

    return getAppointmentEndDate(appointment) < now;
  });
};

const getUpcomingAppointments = (appointments: Appointment[]) => {
  const now = new Date();

  return appointments.filter((appointment) => {
    if (appointment.status !== 'CONFIRMED') return false;

    return getAppointmentEndDate(appointment) >= now;
  });
};

const getLastCompletedAppointment = (appointments: Appointment[]) => {
  return [...getCompletedAppointments(appointments)].sort((firstAppointment, secondAppointment) => {
    return getAppointmentEndDate(secondAppointment).getTime() - getAppointmentEndDate(firstAppointment).getTime();
  })[0];
};

const getNextUpcomingAppointment = (appointments: Appointment[]) => {
  return [...getUpcomingAppointments(appointments)].sort((firstAppointment, secondAppointment) => {
    return getAppointmentStartDate(firstAppointment).getTime() - getAppointmentStartDate(secondAppointment).getTime();
  })[0];
};

export const getTherapistClientFiles = async (therapistId: string): Promise<ClientFileSummary[]> => {
  const clientFilesQuery = query(
  collection(db, 'clientFiles'),
  where('therapistId', '==', therapistId)
);

  const snapshot = await getDocs(clientFilesQuery);
  const clientFiles = snapshot.docs
  .map(mapClientFileDocument)
  .sort((a, b) => {
    const firstDate = new Date(a.updatedAt || a.createdAt).getTime();
    const secondDate = new Date(b.updatedAt || b.createdAt).getTime();

    return secondDate - firstDate;
  });

  const summaries = await Promise.all(
    clientFiles.map(async (clientFile) => {
      const appointments = await getClientAppointments(therapistId, clientFile.userId);
const completedAppointments = getCompletedAppointments(appointments);
const lastAppointment = getLastCompletedAppointment(appointments);
const nextAppointment = getNextUpcomingAppointment(appointments);

return {
  ...clientFile,
  totalSessions: completedAppointments.length,
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
const clientProfile = await getClientProfileSummary(userId);
const latestCheckIn = await getLatestCheckInSummary(userId);

return {
  clientFile,
  appointments,
  wellbeingSummary,
  clientProfile,
  latestCheckIn,
};
};

export const updateClientAppointmentNotes = async (
  appointmentId: string,
  therapistNotes: string,
  nextSteps: string
): Promise<void> => {
  await updateDoc(doc(db, 'appointments', appointmentId), {
    therapistNotes: therapistNotes.trim() || deleteField(),
    nextSteps: nextSteps.trim() || deleteField(),
    updatedAt: serverTimestamp(),
  });
};

const getSessionKeyMaterial = (appointmentId: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`mm_session_${appointmentId}_k9x2p`.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

const decryptSessionMessage = async (
  cipherText: string,
  appointmentId: string
): Promise<string> => {
  try {
    if (!cipherText) return '';

    const key = await getSessionKeyMaterial(appointmentId);
    const combined = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Archived message decrypt failed:', error);
    return cipherText;
  }
};

export const getAppointmentMessages = async (
  appointmentId: string,
  therapistId: string,
  userId: string
): Promise<AppointmentMessage[]> => {
  const messagesQuery = query(
    collection(db, 'sessions', appointmentId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  const snapshot = await getDocs(messagesQuery);

  const messages: AppointmentMessage[] = await Promise.all(
    snapshot.docs.map(async (documentSnapshot): Promise<AppointmentMessage> => {
      const data = documentSnapshot.data();
      const senderId = data.senderId ?? '';
      const message = await decryptSessionMessage(data.text ?? '', appointmentId);

      return {
        id: documentSnapshot.id,
        appointmentId,
        therapistId,
        userId,
        senderId,
        senderRole: senderId === therapistId ? 'therapist' : 'user',
        message,
        createdAt: mapDateValue(data.timestamp),
      };
    })
  );

  return messages;
};

