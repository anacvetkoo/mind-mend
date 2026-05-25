import type { Appointment, AppointmentType } from './appointments';

export type ClientFileStatus = 'active' | 'inactive';

export interface ClientFile {
  id: string;
  therapistId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhotoURL?: string;
  status: ClientFileStatus;
  totalSessions: number;
  lastAppointmentAt?: string;
  nextAppointmentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFileSummary extends ClientFile {
  lastAppointment?: Appointment;
  nextAppointment?: Appointment;
}

export interface ClientWellbeingSummary {
  totalCheckIns: number;
  recentCheckIns: number;
  averageStressLevel: number | null;
  dominantEmotion: string;
  latestCheckInDate: string;
}

export interface AppointmentMessage {
  id: string;
  appointmentId: string;
  therapistId: string;
  userId: string;
  senderId: string;
  senderRole: 'user' | 'therapist';
  message: string;
  createdAt: string;
}

export interface ClientFileDetailsData {
  clientFile: ClientFile;
  appointments: Appointment[];
  wellbeingSummary: ClientWellbeingSummary;
  clientProfile: ClientProfileSummary;
  latestCheckIn: LatestCheckInSummary | null;
}

export interface CreateClientFileInput {
  therapistId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhotoURL?: string;
  appointmentType?: AppointmentType;
  appointmentDate?: string;
}

export interface ClientProfileSummary {
  gender: string;
  age: number | null;
  medications: string;
  medicationSpec: string[];
  professionalHelp: string;
  symptoms: string[];
  createdAt: string;
}

export interface LatestCheckInSummary {
  date: string;
  emotionalState: string;
  dominantEmotion: string[];
  stressLevel: number | null;
  sleepQuality: string;
  socialConnection: number | null;
  gratitude: string;
  difficulties: string;
  thoughtsToday: string;
  tomorrowHelp: string;
  energySource: string;
}