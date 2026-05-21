import React, { useEffect, useState } from 'react';
import { Card, Button } from '../components/Common';
import { mockService } from '../services/mockService';
import { DashboardStats, Appointment, Patient } from '../types';
import { Users, Calendar, Clock, Activity, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [patientProfile, setPatientProfile] = useState<Patient | undefined>();

  useEffect(() => {
    if (user) {
      const dashboardStats = mockService.getDashboardStats(user);
      setStats(dashboardStats);
      
      const allApps = mockService.getAppointments();
      const today = new Date().toISOString().split('T')[0];
      
      if (user.role === 'PATIENT') {
        const pProfile = mockService.getPatientByUserId(user.id);
        setPatientProfile(pProfile);
        const myApps = allApps
          .filter(a => a.patientId === pProfile?.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first
        setRecentAppointments(myApps.slice(0, 5));
      } else {
        // Staff View: Today's schedule
        const todaysApps = allApps
          .filter(a => a.date === today)
          .sort((a, b) => a.time.localeCompare(b.time));
        setRecentAppointments(todaysApps);
      }
    }
  }, [user]);

  if (!stats) return <div>Loading...</div>;

  const data = [
    { name: 'Mon', appointments: 4 },
    { name: 'Tue', appointments: 7 },
    { name: 'Wed', appointments: 5 },
    { name: 'Thu', appointments: 9 },
    { name: 'Fri', appointments: 6 },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-slate-50`}>
          <Icon className="h-6 w-6 text-slate-600" />
        </div>
      </div>
    </Card>
  );

  // Patient Dashboard View
  if (user?.role === 'PATIENT') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
            <p className="text-sm text-slate-500">Here is your health overview</p>
          </div>
          {patientProfile && (
            <Link to={`/patients/${patientProfile.id}`}>
              <Button variant="outline">View My Profile</Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Visits" value={stats.totalAppointments} icon={Calendar} color="#153e17" />
          <StatCard title="Upcoming Appointment" value={stats.upcomingAppointment || 'None'} icon={Clock} color="#10b981" />
          <StatCard title="Active Prescriptions" value={stats.activePrescriptions} icon={FileText} color="#8b5cf6" />
        </div>

        <Card title="My Recent Appointments">
          <div className="space-y-4">
            {recentAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">You have no appointment history.</p>
                <Link to="/appointments"><Button>Schedule Appointment</Button></Link>
              </div>
            ) : (
              recentAppointments.map(app => (
                <div key={app.id} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{new Date(app.date).toLocaleDateString()} at {app.time}</p>
                    <p className="text-xs text-slate-500">{app.reason}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    app.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                    app.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                    app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-[#153e17]/10 text-[#153e17]'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Staff Dashboard View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} color="#153e17" />
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} color="#10b981" />
        <StatCard title="Total Staff" value={stats.totalUsers} icon={Activity} color="#8b5cf6" />
        <StatCard title="Pending Actions" value="3" icon={Clock} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card title="Weekly Appointments" className="lg:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="appointments" fill="#153e17" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card title="Today's Schedule">
          <div className="space-y-4">
            {recentAppointments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No appointments for today.</p>
            ) : (
              recentAppointments.map(app => {
                const patient = mockService.getPatientById(app.patientId);
                return (
                  <div key={app.id} className="flex items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-16 text-center">
                      <span className="block text-sm font-bold text-slate-900">{app.time}</span>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-slate-900">{patient?.name}</p>
                      <p className="text-xs text-slate-500">{app.reason}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        app.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                        app.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-[#153e17]/10 text-[#153e17]'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};