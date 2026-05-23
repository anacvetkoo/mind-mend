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
