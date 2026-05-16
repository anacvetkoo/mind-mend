export type AppointmentType = 'Chat' | 'Voice Call' | 'Video Call' | 'In Person';

export type AppointmentStatus =
  | 'AVAILABLE'
  | 'REQUESTED'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'CANCELLED_BY_THERAPIST'
  | 'PAYMENT_FAILED'
  | 'COMPLETED';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface WorkingHours {
  day: DayOfWeek;
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface TherapistAvailability {
  therapistId: string;
  workingHours: WorkingHours[];
  appointmentDuration: number; // in minutes
  breakDuration: number; // in minutes
  enabledTypes: AppointmentType[];
  inPersonAddress?: string;
  isSetupComplete: boolean;
}

export interface BlockedTime {
  id: string;
  therapistId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  startTime?: string; // HH:MM format (optional for full day blocks)
  endTime?: string; // HH:MM format (optional for full day blocks)
  reason: string;
  isFullDay: boolean;
}

export interface AppointmentSlot {
  id: string;
  therapistId: string;
  date: string; // ISO date
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  therapistId: string;
  therapistName: string;
  userId: string;
  userName: string;
  appointmentType: AppointmentType;
  date: string; // ISO date
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: AppointmentStatus;
  notes?: string;
  inPersonAddress?: string;
  price: number;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  id: string;
  therapistId: string;
  userId: string;
  appointmentType: AppointmentType;
  proposedDate: string;
  proposedStartTime: string;
  proposedEndTime: string;
  message?: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED';
  therapistResponse?: string;
  suggestedAlternativeDate?: string;
  suggestedAlternativeTime?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'payment' | 'cancellation' | 'reminder' | 'request';
  title: string;
  message: string;
  appointmentId?: string;
  isRead: boolean;
  createdAt: string;
}
