import { User, Patient, Appointment, MedicalRecord } from '../types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: '1', name: 'Dr. Sarah Smith', email: 'admin@medicare.pro', role: 'ADMIN', password: 'password123' },
  { id: '2', name: 'Dr. John Doe', email: 'doctor@medicare.pro', role: 'DOCTOR', password: 'password123' },
  { id: '3', name: 'Jane Receptionist', email: 'frontdesk@medicare.pro', role: 'RECEPTIONIST', password: 'password123' },
  { id: '4', name: 'Alice Patient', email: 'alice@example.com', role: 'PATIENT', password: 'password123' },
];

const MOCK_PATIENTS: Patient[] = [
  { id: '1', userId: '4', name: 'Alice Patient', email: 'alice@example.com', phone: '555-0101', dob: '1985-04-12', gender: 'Female', address: '123 Maple St', createdAt: '2023-01-15' },
  { id: '2', name: 'Bob Williams', email: 'bob@example.com', phone: '555-0102', dob: '1978-08-23', gender: 'Male', address: '456 Oak Ave', createdAt: '2023-02-20' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-0103', dob: '1990-12-05', gender: 'Male', address: '789 Pine Ln', createdAt: '2023-03-10' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', phone: '555-0104', dob: '1992-06-30', gender: 'Female', address: '321 Elm St', createdAt: '2023-04-05' },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', patientId: '1', patientName: 'Alice Patient', doctorId: '2', date: new Date().toISOString().split('T')[0], time: '09:00', status: 'SCHEDULED', reason: 'Annual Checkup' },
  { id: '2', patientId: '2', patientName: 'Bob Williams', doctorId: '2', date: new Date().toISOString().split('T')[0], time: '10:30', status: 'COMPLETED', reason: 'Flu Symptoms' },
  { id: '3', patientId: '3', patientName: 'Charlie Brown', doctorId: '2', date: '2023-10-28', time: '14:00', status: 'PENDING', reason: 'Back Pain' },
];

const MOCK_RECORDS: MedicalRecord[] = [
  { id: '1', patientId: '1', doctorId: '2', doctorName: 'Dr. John Doe', date: '2023-01-15', diagnosis: 'Healthy', notes: 'Patient is in good health. Blood pressure normal.', prescription: 'Vitamins' },
  { id: '2', patientId: '2', doctorId: '2', doctorName: 'Dr. John Doe', date: '2023-02-20', diagnosis: 'Seasonal Flu', notes: 'Patient presented with fever and cough.', prescription: 'Tamiflu, Rest' },
];

const loadFromStorage = <T>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

class MockService {
  private users: User[];
  private patients: Patient[];
  private appointments: Appointment[];
  private records: MedicalRecord[];

  constructor() {
    this.users = loadFromStorage('users', MOCK_USERS);
    this.patients = loadFromStorage('patients', MOCK_PATIENTS);
    this.appointments = loadFromStorage('appointments', MOCK_APPOINTMENTS);
    this.records = loadFromStorage('records', MOCK_RECORDS);
  }

  // --- Auth & Users ---
  async login(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  async register(user: Omit<User, 'id'>): Promise<User> {
    const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
    this.users.push(newUser);
    saveToStorage('users', this.users);

    // If registering as a Patient, automatically create a Patient profile
    if (user.role === 'PATIENT') {
      this.addPatient({
        name: user.name,
        email: user.email,
        phone: '',
        dob: '',
        gender: 'Other',
        address: '',
        userId: newUser.id
      });
    }

    return newUser;
  }

  getUsers(): User[] {
    return this.users;
  }

  deleteUser(id: string): void {
    this.users = this.users.filter(u => u.id !== id);
    saveToStorage('users', this.users);
  }

  // --- Patients ---
  getPatients(): Patient[] {
    return this.patients;
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  getPatientByUserId(userId: string): Patient | undefined {
    return this.patients.find(p => p.userId === userId);
  }

  getPatientByEmail(email: string): Patient | undefined {
    return this.patients.find(p => p.email === email);
  }

  addPatient(patient: Omit<Patient, 'id' | 'createdAt'>): Patient {
    const newPatient = {
      ...patient,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.patients.push(newPatient);
    saveToStorage('patients', this.patients);
    return newPatient;
  }

  deletePatient(id: string): void {
    this.patients = this.patients.filter(p => p.id !== id);
    // Also cleanup appointments? For mock, maybe not strictly necessary but good practice
    this.appointments = this.appointments.filter(a => a.patientId !== id);
    saveToStorage('patients', this.patients);
    saveToStorage('appointments', this.appointments);
  }

  // --- Appointments ---
  getAppointments(): Appointment[] {
    return this.appointments;
  }

  addAppointment(appointment: Omit<Appointment, 'id' | 'patientName'>): Appointment {
    const patient = this.patients.find(p => p.id === appointment.patientId);
    const newAppt = {
      ...appointment,
      patientName: patient?.name || 'Unknown',
      id: Math.random().toString(36).substr(2, 9)
    };
    this.appointments.push(newAppt);
    saveToStorage('appointments', this.appointments);
    return newAppt;
  }

  updateAppointmentStatus(id: string, status: Appointment['status']): void {
    this.appointments = this.appointments.map(a => a.id === id ? { ...a, status } : a);
    saveToStorage('appointments', this.appointments);
  }

  deleteAppointment(id: string): void {
    this.appointments = this.appointments.filter(a => a.id !== id);
    saveToStorage('appointments', this.appointments);
  }

  // --- Medical Records ---
  getMedicalRecords(patientId: string): MedicalRecord[] {
    return this.records.filter(r => r.patientId === patientId);
  }

  addMedicalRecord(record: Omit<MedicalRecord, 'id'>): MedicalRecord {
    const newRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.records.push(newRecord);
    saveToStorage('records', this.records);
    return newRecord;
  }

  // --- Stats ---
  getDashboardStats(user?: User): any {
    const today = new Date().toISOString().split('T')[0];
    
    // Patient specific stats
    if (user?.role === 'PATIENT') {
      const patient = this.getPatientByUserId(user.id);
      if (!patient) return { totalAppointments: 0, nextAppointment: null };
      
      const myApps = this.appointments.filter(a => a.patientId === patient.id);
      const upcoming = myApps
        .filter(a => new Date(a.date) >= new Date(today) && a.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      return {
        totalAppointments: myApps.length,
        upcomingAppointment: upcoming ? `${upcoming.date} at ${upcoming.time}` : 'None',
        activePrescriptions: this.records.filter(r => r.patientId === patient.id && r.prescription).length
      };
    }

    // Admin/Doctor/Receptionist stats
    return {
      totalPatients: this.patients.length,
      totalAppointments: this.appointments.length,
      totalUsers: this.users.length,
      todayAppointments: this.appointments.filter(a => a.date === today).length
    };
  }
}

export const mockService = new MockService();