import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/Common';
import { mockService } from '../services/mockService';
import { Appointment, Patient } from '../types';
import { Plus, Check, X, Calendar, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // New Appointment State
  const [newApp, setNewApp] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    reason: ''
  });

  useEffect(() => {
    let allApps = mockService.getAppointments();
    
    // Filter for Patient
    if (user?.role === 'PATIENT') {
      const myProfile = mockService.getPatientByUserId(user.id);
      if (myProfile) {
        setNewApp(prev => ({...prev, patientId: myProfile.id})); // Auto-select self
        allApps = allApps.filter(a => a.patientId === myProfile.id);
      } else {
        allApps = [];
      }
    }

    setAppointments(allApps);
    setPatients(mockService.getPatients());
  }, [user]);

  // Permissions
  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isReceptionist = user?.role === 'RECEPTIONIST';
  const isAdmin = user?.role === 'ADMIN';

  const canCreate = isReceptionist || isPatient || isAdmin;
  const canApprove = isDoctor || isAdmin;
  const canDelete = isReceptionist || isAdmin;
  // Doctor can cancel, Receptionist can cancel/delete
  const canCancel = isDoctor || isReceptionist || isAdmin; 

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = mockService.addAppointment({
      ...newApp,
      doctorId: '2', // Default assignment, in real app select doctor
      status: isPatient ? 'PENDING' : 'SCHEDULED'
    });
    setAppointments([...appointments, created]);
    setShowModal(false);
    // Reset but keep patientId if patient
    setNewApp({
      patientId: isPatient ? newApp.patientId : '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      reason: ''
    });
  };

  const updateStatus = (id: string, status: Appointment['status']) => {
    mockService.updateAppointmentStatus(id, status);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this appointment?')) {
      mockService.deleteAppointment(id);
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown';

  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime();
  });

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-500">
            {isPatient ? 'Your scheduled visits' : 'Manage patient visits'}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {isPatient ? 'Request Appointment' : 'New Appointment'}
          </Button>
        )}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                {!isPatient && <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                      <div className="text-sm text-slate-900">
                        {new Date(app.date).toLocaleDateString()}
                      </div>
                      <span className="ml-2 text-sm text-slate-500">{app.time}</span>
                    </div>
                  </td>
                  {!isPatient && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{getPatientName(app.patientId)}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500">{app.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      app.status === 'COMPLETED' ? 'success' : 
                      app.status === 'CANCELLED' ? 'error' : 
                      app.status === 'PENDING' ? 'warning' : 'brand'
                    }>
                      {app.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {/* Doctor Actions */}
                      {canApprove && (app.status === 'PENDING' || app.status === 'SCHEDULED') && (
                        <>
                          {app.status === 'PENDING' && (
                            <button 
                              onClick={() => updateStatus(app.id, 'SCHEDULED')}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => updateStatus(app.id, 'COMPLETED')}
                            className="text-[#153e17] hover:text-[#102e11] p-1"
                            title="Complete"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      {/* Cancel Action */}
                      {canCancel && app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                         <button 
                            onClick={() => updateStatus(app.id, 'CANCELLED')}
                            className="text-orange-600 hover:text-orange-900 p-1"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                      )}

                      {/* Receptionist Delete */}
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(app.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sortedAppointments.length === 0 && (
                <tr>
                  <td colSpan={isPatient ? 4 : 5} className="px-6 py-8 text-center text-slate-500">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                {isPatient ? 'Request Appointment' : 'New Appointment'}
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                {!isPatient && (
                  <Select 
                    label="Patient"
                    options={patients.map(p => ({ value: p.id, label: p.name }))}
                    value={newApp.patientId}
                    onChange={e => setNewApp({...newApp, patientId: e.target.value})}
                    required
                  />
                )}
                <Input 
                  label="Date"
                  type="date"
                  value={newApp.date}
                  onChange={e => setNewApp({...newApp, date: e.target.value})}
                  required
                />
                <Input 
                  label="Time"
                  type="time"
                  value={newApp.time}
                  onChange={e => setNewApp({...newApp, time: e.target.value})}
                  required
                />
                <Input 
                  label="Reason"
                  placeholder="e.g. Annual Checkup"
                  value={newApp.reason}
                  onChange={e => setNewApp({...newApp, reason: e.target.value})}
                  required
                />
                <div className="flex justify-end space-x-3 mt-6">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit">{isPatient ? 'Send Request' : 'Schedule'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};