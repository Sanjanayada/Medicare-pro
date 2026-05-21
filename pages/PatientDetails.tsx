import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { Patient, MedicalRecord } from '../types';
import { Card, Button, Input, Badge } from '../components/Common';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | undefined>();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const { user } = useAuth();

  // New Record State
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      setPatient(mockService.getPatientById(id));
      setRecords(mockService.getMedicalRecords(id));
    }
  }, [id]);

  const canAddRecord = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (id && user) {
      const added = mockService.addMedicalRecord({
        patientId: id,
        doctorId: user.id,
        doctorName: user.name,
        date: new Date().toISOString().split('T')[0],
        ...newRecord
      });
      setRecords([...records, added]);
      setShowAddRecord(false);
      setNewRecord({ diagnosis: '', prescription: '', notes: '' });
    }
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        {user?.role !== 'PATIENT' && (
          <Link to="/patients" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Patients
          </Link>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card title="Patient Information">
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-slate-400 mr-3" />
                <span className="text-sm text-slate-600">{patient.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-slate-400 mr-3" />
                <span className="text-sm text-slate-600">{patient.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-slate-400 mr-3" />
                <span className="text-sm text-slate-600">{patient.address || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-slate-400 mr-3" />
                <span className="text-sm text-slate-600">DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <span className="block text-xl font-bold text-slate-900">{records.length}</span>
                  <span className="text-xs text-slate-500">Visits</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <span className="block text-xl font-bold text-slate-900">
                     {patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : '-'}
                  </span>
                  <span className="text-xs text-slate-500">Age</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Medical History */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Medical History" className="h-full">
            {canAddRecord && (
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setShowAddRecord(!showAddRecord)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medical Note
                </Button>
              </div>
            )}

            {showAddRecord && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-sm font-medium text-slate-900 mb-3">New Record</h4>
                <form onSubmit={handleAddRecord} className="space-y-4">
                  <Input 
                    label="Diagnosis" 
                    value={newRecord.diagnosis}
                    onChange={e => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    required
                  />
                   <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea 
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#153e17]"
                      rows={3}
                      value={newRecord.notes}
                      onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <Input 
                    label="Prescription (Optional)" 
                    placeholder="e.g. Amoxicillin 500mg"
                    value={newRecord.prescription}
                    onChange={e => setNewRecord({...newRecord, prescription: e.target.value})}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddRecord(false)}>Cancel</Button>
                    <Button type="submit" size="sm">Save Record</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-6">
              {records.length === 0 ? (
                <p className="text-center text-slate-500 py-4">No medical records found.</p>
              ) : (
                records.map((record) => (
                  <div key={record.id} className="relative pl-6 pb-6 border-l-2 border-slate-200 last:pb-0">
                    <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-[#153e17] border-4 border-white shadow-sm"></div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{record.diagnosis}</span>
                      <div className="text-right">
                        <span className="block text-xs text-slate-500">{new Date(record.date).toLocaleDateString()}</span>
                        <span className="block text-xs text-[#153e17]">{record.doctorName}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                      <p className="text-sm text-slate-700 mb-2">{record.notes}</p>
                      {record.prescription && (
                         <div className="flex items-start mt-2 pt-2 border-t border-slate-200">
                           <FileText className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                           <span className="text-sm text-slate-600 font-medium">Rx: {record.prescription}</span>
                         </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};