import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockService } from '../services/mockService';
import { Button, Input, Card, Select } from '../components/Common';
import { Activity } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // Default new registration to Patient for "Create myself" flow
  const [role, setRole] = useState<UserRole>('PATIENT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await mockService.login(email, password);
        if (user) {
          login(user);
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Registration
        if (!name || !email || !password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }
        const newUser = await mockService.register({
          name,
          email,
          password,
          role
        });
        login(newUser);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#153e17]/10 mb-4">
          <Activity className="h-8 w-8 text-[#153e17]" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">MediCare Pro</h1>
        <p className="text-slate-600 mt-2">Healthcare Management System</p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-[#153e17]">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLogin ? 'Enter your credentials to access your account' : 'Sign up as a new user'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Select
                label="I am a..."
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                options={[
                  { value: 'PATIENT', label: 'Patient' },
                  // In a real app, staff might be created only by Admins, but leaving here for demo flexibility
                  { value: 'DOCTOR', label: 'Doctor' },
                  { value: 'RECEPTIONIST', label: 'Receptionist' },
                  { value: 'ADMIN', label: 'Administrator' }
                ]}
              />
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@medicare.pro"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#153e17] hover:text-[#102e11] font-medium"
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </Card>
      
      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} MediCare Pro. All rights reserved.
      </p>
    </div>
  );
};