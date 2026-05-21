import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/Common';
import { mockService } from '../services/mockService';
import { User, UserRole } from '../types';
import { Plus, Trash2, Shield, UserCog } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Users: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'password123', // Default for mock
    role: 'DOCTOR' as UserRole
  });

  useEffect(() => {
    setUsers(mockService.getUsers());
  }, []);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await mockService.register(newUser);
    setUsers(mockService.getUsers());
    setShowModal(false);
    setNewUser({ name: '', email: '', password: 'password123', role: 'DOCTOR' });
  };

  const handleDelete = (id: string) => {
    if (id === user.id) {
      alert("You cannot delete yourself.");
      return;
    }
    if (window.confirm('Delete this user?')) {
      mockService.deleteUser(id);
      setUsers(mockService.getUsers());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-500">Create and manage Doctors and Receptionists</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-[#153e17]/10 flex items-center justify-center text-[#153e17] font-bold mr-3">
                      {u.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={u.role === 'ADMIN' ? 'error' : u.role === 'DOCTOR' ? 'success' : 'neutral'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {u.role !== 'ADMIN' && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Add New Staff Member</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Name"
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
                required
              />
              <Input
                label="Email"
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
                required
              />
              <Select
                label="Role"
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                options={[
                  { value: 'DOCTOR', label: 'Doctor' },
                  { value: 'RECEPTIONIST', label: 'Receptionist' },
                  { value: 'ADMIN', label: 'Admin' }
                ]}
              />
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};