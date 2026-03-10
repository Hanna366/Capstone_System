import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type User, type PendingUser } from '@/services/authService';
import { blynkService } from '@/services/blynkService';
import { Switch } from '@/components/ui/switch';

interface Device {
  id: string;
  name: string;
  blynkId: string;
  status: 'online' | 'offline' | 'maintenance';
  location: string;
  lastActive: string;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'devices'>('users');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Check if user has admin privileges
  useEffect(() => {
    if (!authService.hasRole('admin')) {
      setError('Access denied. Admin privileges required.');
      return;
    }

    // Load users and devices
    const loadData = async () => {
      try {
        // Load existing users (in a real app, this would come from an API)
        const existingUsers = [
          { id: '1', username: 'admin', name: 'Admin User', role: 'admin' as const, password: 'admin123' },
          { id: '2', username: 'maint', name: 'Maintenance User', role: 'user' as const, password: 'maint123' },
          { id: '3', username: 'user', name: 'Regular User', role: 'user' as const, password: 'user123' },
        ];
        
        // Load pending users from authService
        const pendingUsersList = authService.getPendingUsersList();
        
        // Load devices (in a real app, this would come from an API)
        const mockDevices: Device[] = [
          { id: 'dev-001', name: 'Drying Rack #1', blynkId: 'Not Connected', status: 'offline', location: 'Building A, Rooftop', lastActive: 'Never connected' },
          { id: 'dev-002', name: 'Drying Rack #2', blynkId: 'Not Connected', status: 'offline', location: 'Building B, Yard', lastActive: 'Never connected' },
          { id: 'dev-003', name: 'Drying Rack #3', blynkId: 'Not Connected', status: 'offline', location: 'Building C, Terrace', lastActive: 'Never connected' },
          { id: 'dev-004', name: 'Drying Rack #4', blynkId: 'Not Connected', status: 'offline', location: 'Building D, Balcony', lastActive: 'Never connected' },
        ];

        setUsers(existingUsers);
        setPendingUsers(pendingUsersList);
        setDevices(mockDevices);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to approve a user
  const approveUser = async (userId: string) => {
    try {
      // Call the authService to approve the user
      const success = await authService.approveUser(userId);
      
      if (success) {
        // Refresh the pending users list
        const updatedPendingUsers = authService.getPendingUsersList();
        setPendingUsers(updatedPendingUsers);
        
        console.log(`User ${userId} approved successfully`);
      } else {
        console.error(`Failed to approve user ${userId}`);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      setError('Failed to approve user');
    }
  };

  // Function to reject a user
  const rejectUser = async (userId: string) => {
    try {
      // Call the authService to reject the user
      const success = await authService.rejectUser(userId);
      
      if (success) {
        // Refresh the pending users list
        const updatedPendingUsers = authService.getPendingUsersList();
        setPendingUsers(updatedPendingUsers);
        
        console.log(`User ${userId} rejected successfully`);
      } else {
        console.error(`Failed to reject user ${userId}`);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError('Failed to reject user');
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (!authService.hasRole('admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Enhanced background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.05),transparent_70%)]"></div>
        
        <div className="relative z-10 text-center max-w-lg w-full">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-rose-600/30 via-rose-500/20 to-pink-600/30 mb-10 relative border-2 border-rose-500/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-3xl blur-xl animate-pulse"></div>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 mb-6 animate-fade-in">Access Denied</h1>
          
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md rounded-2xl p-8 mb-8 border border-rose-500/20 shadow-xl">
            <p className="text-slate-300 text-lg leading-relaxed">
              {error || 'You must be an admin to access this dashboard.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">Administrator privileges required</span>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-10 py-4 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-orange-500/40 font-bold text-lg hover:scale-105 flex items-center justify-center gap-3 mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10 transition-transform duration-500 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="relative z-10">Return to Dashboard</span>
          </button>
          
          <div className="mt-8 text-sm text-slate-500">
            Need admin access? Contact your system administrator.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8 relative overflow-hidden">
        {/* Enhanced background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.05),transparent_70%)]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="space-y-8">
            {/* Animated header skeleton */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-orange-500/20 shadow-xl">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-8 w-64 bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-xl animate-pulse"></div>
                  <div className="h-4 w-80 bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div className="w-32 h-12 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl animate-pulse"></div>
            </div>
            
            {/* Animated content skeleton */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md rounded-2xl border-2 border-orange-500/30 shadow-2xl p-6 animate-pulse">
              <div className="h-6 w-48 bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-lg mb-8"></div>
              <div className="space-y-4">
                <div className="h-48 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="h-64 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl"></div>
                  <div className="md:col-span-2 h-64 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.05),transparent_70%)]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-8">
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-orange-500/30 shadow-2xl hover:border-orange-500/40 transition-all duration-500 hover:shadow-orange-500/20">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center border border-orange-500/30 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.548-.99 3.192-.99 4.74 0 1.548.99 1.548 2.607 0 3.606-1.462 1.001-2.923 2.001-4.385 3.001-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.548.99-3.192.99-4.74 0-1.548-.99-1.548-2.607 0-3.606 1.462-1.001 2.923-2.001 4.385-3.001z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400/20 to-amber-400/20 animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-blue-500 mb-2 animate-fade-in">Admin Dashboard</h1>
                <p className="text-slate-300 text-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Manage system users and deployed hardware
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:from-orange-700/50 hover:to-amber-700/50 text-white px-6 py-3 rounded-xl transition-all duration-500 border border-slate-600/50 shadow-lg hover:shadow-orange-500/30 hover:scale-105 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-500 group-hover:-translate-x-1 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="relative z-10">Back to Dashboard</span>
            </button>
          </div>
        </header>

        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl border-2 border-orange-500/50 shadow-2xl p-6 mb-6 hover:border-orange-500/60 transition-all duration-500 hover:shadow-orange-500/30 hover:scale-[1.01]">
          <div className="flex space-x-2 mb-6 border-b border-orange-500/30 pb-2">
            <button
              className={`px-6 py-3 font-medium transition-all duration-500 relative group ${
                activeTab === 'users'
                  ? 'text-orange-400 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl border border-orange-500/30 shadow-lg'
                  : 'text-slate-400 hover:text-orange-300 hover:bg-slate-700/30 rounded-xl hover:scale-105'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Active Users
              </div>
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              )}
            </button>
            <button
              className={`px-6 py-3 font-medium transition-all duration-500 relative group ${
                activeTab === 'pending'
                  ? 'text-orange-400 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl border border-orange-500/30 shadow-lg'
                  : 'text-slate-400 hover:text-orange-300 hover:bg-slate-700/30 rounded-xl hover:scale-105'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Approvals
              </div>
              {pendingUsers.filter(u => !u.approved).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse border-2 border-slate-900 shadow-lg">
                  {pendingUsers.filter(u => !u.approved).length}
                </span>
              )}
              {activeTab === 'pending' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              )}
            </button>
            <button
              className={`px-6 py-3 font-medium transition-all duration-500 relative group ${
                activeTab === 'devices'
                  ? 'text-orange-400 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl border border-orange-500/30 shadow-lg'
                  : 'text-slate-400 hover:text-orange-300 hover:bg-slate-700/30 rounded-xl hover:scale-105'
              }`}
              onClick={() => setActiveTab('devices')}
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Devices & Hardware
              </div>
              {activeTab === 'devices' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              )}
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="overflow-x-auto rounded-2xl border border-orange-500/20 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-700/60 to-slate-800/60">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        User
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Role
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Joined
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-500/10">
                  {users.map((user, index) => (
                    <tr key={user.id} className={`hover:bg-gradient-to-r from-slate-700/40 to-slate-800/40 transition-all duration-300 ${index % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center border border-orange-500/30">
                            <span className="text-orange-400 font-bold">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-xs text-slate-400">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${user.role === 'admin' ? 'bg-gradient-to-r from-purple-600/40 to-purple-700/40 text-purple-300 border border-purple-500/40 shadow-sm' :
                            'bg-gradient-to-r from-slate-600/40 to-slate-700/40 text-slate-300 border border-slate-500/40 shadow-sm'}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/40 to-emerald-700/40 text-emerald-300 rounded-full text-xs font-medium border border-emerald-500/40 shadow-sm flex items-center gap-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <span className="px-2 py-1 bg-slate-700/40 rounded-lg text-xs">N/A</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="overflow-x-auto">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-2">Pending User Approvals</h3>
                <p className="text-slate-300">Review and approve new user registrations</p>
              </div>
              
              {pendingUsers.filter(u => !u.approved).length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-emerald-500/20">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500/30 to-green-500/30 mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full blur-lg animate-pulse"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">No Pending Approvals</h4>
                  <p className="text-slate-400 max-w-md mx-auto">All user registrations have been processed. Great job staying on top of your admin duties!</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-800/30 to-slate-900/30 overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-700/60 to-slate-800/60">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-amber-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            User
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-amber-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-amber-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Registration Date
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-amber-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.548-.99 3.192-.99 4.74 0 1.548.99 1.548 2.607 0 3.606-1.462 1.001-2.923 2.001-4.385 3.001-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.548.99-3.192.99-4.74 0-1.548-.99-1.548-2.607 0-3.606 1.462-1.001 2.923-2.001 4.385-3.001z" />
                            </svg>
                            Actions
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-500/10">
                      {pendingUsers.filter(u => !u.approved).map((user, index) => (
                        <tr key={user.id} className={`hover:bg-gradient-to-r from-slate-700/40 to-slate-800/40 transition-all duration-300 ${index % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center border border-amber-500/30">
                                <span className="text-amber-400 font-bold">{user.name.charAt(0)}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{user.name}</div>
                                <div className="text-xs text-slate-400">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            <span className="px-2 py-1 bg-slate-700/40 rounded-lg">{user.createdAt}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => approveUser(user.id)}
                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-1 group relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="relative z-10">Approve</span>
                              </button>
                              <button
                                onClick={() => rejectUser(user.id)}
                                className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-1 group relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="relative z-10">Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Approved users section */}
              {pendingUsers.filter(u => u.approved).length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4">Recently Approved Users</h4>
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Approved By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Approved At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {pendingUsers.filter(u => u.approved).map((user) => (
                        <tr key={user.id} className="hover:bg-slate-700/30">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {user.approvedBy || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {user.approvedAt || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="overflow-x-auto rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-700/60 to-slate-800/60">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        Device
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Location
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Last Active
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10">
                  {devices.map((device, index) => (
                    <tr key={device.id} className={`hover:bg-gradient-to-r from-slate-700/40 to-slate-800/40 transition-all duration-300 ${index % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-emerald-500 animate-pulse' : device.status === 'maintenance' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                          <div>
                            <div className="text-sm font-medium text-white">{device.name}</div>
                            <div className="text-xs text-slate-400">ID: {device.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 max-w-xs">
                        <div className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{device.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${device.status === 'online' ? 'bg-gradient-to-r from-emerald-600/40 to-green-600/40 text-emerald-300 border border-emerald-500/40 shadow-sm' :
                            device.status === 'maintenance' ? 'bg-gradient-to-r from-amber-600/40 to-orange-600/40 text-amber-300 border border-amber-500/40 shadow-sm' :
                            'bg-gradient-to-r from-rose-600/40 to-red-600/40 text-rose-300 border border-rose-500/40 shadow-sm'}`}
                        >
                          {device.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <span className="px-2 py-1 bg-slate-700/40 rounded-lg">{device.lastActive}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md rounded-2xl border-2 border-orange-500/30 p-6 shadow-2xl hover:border-orange-500/40 transition-all duration-500 hover:shadow-orange-500/20 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-xl border border-orange-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">System Overview</h3>
            </div>
            
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-xl border border-slate-700/30 hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="text-slate-300">Total Users</span>
                  </div>
                  <span className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{users.length}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-xl border border-slate-700/30 hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-300">Pending Approvals</span>
                  </div>
                  <span className="text-2xl font-bold text-white bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{pendingUsers.filter(u => !u.approved).length}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-xl border border-slate-700/30 hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    <span className="text-slate-300">Deployed Devices</span>
                  </div>
                  <span className="text-2xl font-bold text-white bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">{devices.length}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-xl border border-slate-700/30 hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-slate-300">Online Devices</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">{devices.filter(d => d.status === 'online').length}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-xl border border-slate-700/30 hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-500"></div>
                    <span className="text-slate-300">Maintenance Devices</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-400">{devices.filter(d => d.status === 'maintenance').length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md rounded-2xl border-2 border-blue-500/30 p-6 shadow-2xl hover:border-blue-500/40 transition-all duration-500 hover:shadow-blue-500/20 hover:scale-[1.01]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl border border-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Quick Actions</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="group relative overflow-hidden bg-gradient-to-br from-emerald-600/30 to-green-600/30 hover:from-emerald-600/40 hover:to-green-600/40 border border-emerald-500/40 text-emerald-300 py-4 px-5 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 flex flex-col items-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-semibold relative z-10">Add New User</span>
              </button>
              
              <button className="group relative overflow-hidden bg-gradient-to-br from-blue-600/30 to-indigo-600/30 hover:from-blue-600/40 hover:to-indigo-600/40 border border-blue-500/40 text-blue-300 py-4 px-5 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 flex flex-col items-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <span className="font-semibold relative z-10">Register Device</span>
              </button>
              
              <button className="group relative overflow-hidden bg-gradient-to-br from-amber-600/30 to-orange-600/30 hover:from-amber-600/40 hover:to-orange-600/40 border border-amber-500/40 text-amber-300 py-4 px-5 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 flex flex-col items-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold relative z-10">Schedule Maintenance</span>
              </button>
              
              <button className="group relative overflow-hidden bg-gradient-to-br from-rose-600/30 to-pink-600/30 hover:from-rose-600/40 hover:to-pink-600/40 border border-rose-500/40 text-rose-300 py-4 px-5 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-rose-500/20 flex flex-col items-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold relative z-10">System Logs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;