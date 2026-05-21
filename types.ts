export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Only for mock auth logic
}

export interface Patient {
  id: string;
  userId?: string; // Link to the user account if they signed up themselves
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  doctorId?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  date: string;
  diagnosis: string;
  notes: string;
  prescription?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string; // Helper for display
  doctorId: string;
  date: string; // ISO date string
  time: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'APPROVED';
  reason: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalUsers: number;
  todayAppointments: number;
}