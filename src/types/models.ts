// ─── User Roles ──────────────────────────────────────────
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

// ─── User ────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number?: string;
  avatar?: string;
  profile_image?: string;
  is_verified: boolean;
  is_doctor_approved: boolean;
  preferred_language?: 'en' | 'am' | 'fr';
  biography?: string;
  location?: string;
  current_working_hospital?: string;
  education?: string;
  experience?: string;
  createdAt?: string; // We can leave these standard if not returned by login payload
  updatedAt?: string;
}

// ─── Doctor Profile ──────────────────────────────────────
export interface DoctorProfile {
  id: string;
  user: User;
  specialization: string;
  licenseNumber: string;
  bio: string;
  yearsOfExperience: number;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  availableSlots: TimeSlot[];
  documents: DoctorDocument[];
}

export interface DoctorDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// ─── Appointment ─────────────────────────────────────────
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Appointment {
  id: string;
  patient: User;
  doctor: DoctorProfile;
  scheduledAt: string;
  duration: number; // minutes
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  prescriptions?: Prescription[];
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

// ─── Chat ────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}
