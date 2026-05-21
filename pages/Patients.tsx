import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Card, Button, Input, Select } from '../components/Common';
import { mockService } from '../services/mockService';
import { Patient } from '../types';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Patients: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: ''
  });

  useEffect(() => {
    setPatients(mockService.getPatients());
  }, []);

  // Permission Checks
  if (user?.role === 'PATIENT') {
    return <Navigate to="/" replace />;
  }

  const canAdd = user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN';
  const canDelete = user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN';

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const added = mockService.addPatient(newPatient as any);
    setPatients([...patients, added]);
    setShowAddModal(false);
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      dob: '',
      gender: 'Male',
      address: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      mockService.deletePatient(id);
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">Manage patient records and information</p>
        </div>
        {canAdd && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        )}
      </div>

      <Card className="!p-0 overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              className="pl-10 w-full rounded-md border border-slate-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#153e17]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age/Gender</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-[#153e17]/10 flex items-center justify-center text-[#153e17] font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{patient.name}</div>
                        <div className="text-sm text-slate-500">ID: #{patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{patient.email}</div>
                    <div className="text-sm text-slate-500">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {patient.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs` : 'N/A'}
                    </div>
                    <div className="text-sm text-slate-500">{patient.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link to={`/patients/${patient.id}`} className="text-[#153e17] hover:text-[#102e11] inline-flex items-center">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Link>
                    {canDelete && (
                      <button onClick={() => handleDelete(patient.id)} className="text-red-600 hover:text-red-900 inline-flex items-center ml-4">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900">Add New Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  required
                  value={newPatient.name}
                  onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={newPatient.email}
                  onChange={e => setNewPatient({...newPatient, email: e.target.value})}
                />
                <Input
                  label="Phone Number"
                  required
                  value={newPatient.phone}
                  onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  required
                  value={newPatient.dob}
                  onChange={e => setNewPatient({...newPatient, dob: e.target.value})}
                />
                <Select
                  label="Gender"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  value={newPatient.gender}
                  onChange={e => setNewPatient({...newPatient, gender: e.target.value})}
                />
                <Input
                  label="Address"
                  className="md:col-span-2"
                  value={newPatient.address}
                  onChange={e => setNewPatient({...newPatient, address: e.target.value})}
                />
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Save Patient</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};