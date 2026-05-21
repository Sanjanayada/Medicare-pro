import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  LogOut, 
  Activity, 
  Menu,
  X,
  UserCog,
  FileText
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define navigation items
  const allNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] },
    { label: 'Staff', path: '/users', icon: UserCog, roles: ['ADMIN'] },
    { label: 'Patients', path: '/patients', icon: Users, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { label: 'Appointments', path: '/appointments', icon: Calendar, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] },
    // For Patients, we might want a direct link to their profile or records
    // { label: 'My Records', path: '/my-records', icon: FileText, roles: ['PATIENT'] }, 
  ];

  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Activity className="h-8 w-8 text-green-400 mr-2" />
          <span className="text-xl font-bold">MediCare Pro</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-[#153e17] text-white border border-[#1a4f1c]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-[#153e17] border border-green-900 flex items-center justify-center text-sm font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-[#153e17] mr-2" />
            <span className="font-bold text-slate-900">MediCare Pro</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};