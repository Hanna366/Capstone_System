import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type User } from '@/services/authService';
import { blynkService } from '@/services/blynkService';

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
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'devices'>('users');
  const [error, setError] = useState<string | null>(null);

  // Check if user has admin privileges
  useEffect(() => {
    if (!authService.hasRole('admin')) {
      setError('Access denied. Admin privileges required.');
      return;
    }

    // Load users and devices
    const loadData = async () => {
      try {
        // Simulate loading users (in a real app, this would come from an API)
        const mockUsers: User[] = [
          { id: '1', username: 'admin', name: 'Admin User', role: 'admin' },
          { id: '2', username: 'maint', name: 'Maintenance User', role: 'maintainer' },
          { id: '3', username: 'user', name: 'Regular User', role: 'user' },
        ];
        
        // Simulate loading devices (in a real app, this would come from an API)
        const mockDevices: Device[] = [
          { id: 'dev-001', name: 'Solar Rack #1', blynkId: 'BLYNK_ID_001', status: 'online', location: 'Building A, Rooftop', lastActive: '2023-05-15 10:30:45' },
          { id: 'dev-002', name: 'Solar Rack #2', blynkId: 'BLYNK_ID_002', status: 'online', location: 'Building B, Yard', lastActive: '2023-05-15 11:20:30' },
          { id: 'dev-003', name: 'Solar Rack #3', blynkId: 'BLYNK_ID_003', status: 'offline', location: 'Building C, Terrace', lastActive: '2023-05-14 16:45:20' },
          { id: 'dev-004', name: 'Solar Rack #4', blynkId: 'BLYNK_ID_004', status: 'maintenance', location: 'Building D, Balcony', lastActive: '2023-05-15 09:15:10' },
        ];

        setUsers(mockUsers);
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

  if (!authService.hasRole('admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-400 mb-8">
            {error || 'You must be an admin to access this dashboard.'}
          </p>
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-slate-700 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-slate-400">Manage system users and deployed hardware</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </header>

        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 mb-6">
          <div className="flex space-x-4 mb-6 border-b border-slate-700">
            <button
              className={`pb-3 px-1 ${
                activeTab === 'users'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Users Management
            </button>
            <button
              className={`pb-3 px-1 ${
                activeTab === 'devices'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('devices')}
            >
              Devices & Hardware
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wager">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wager">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wager">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${user.role === 'admin' ? 'bg-purple-800/50 text-purple-300' :
                            user.role === 'maintainer' ? 'bg-amber-800/50 text-amber-300' :
                            'bg-slate-700 text-slate-300'}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        Active
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        N/A
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Blynk ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wager">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wager">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{device.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300 font-mono">{device.blynkId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {device.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${device.status === 'online' ? 'bg-emerald-800/50 text-emerald-300' :
                            device.status === 'maintenance' ? 'bg-amber-800/50 text-amber-300' :
                            'bg-rose-800/50 text-rose-300'}`}
                        >
                          {device.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {device.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Users</span>
                <span className="text-white font-medium">{users.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deployed Devices</span>
                <span className="text-white font-medium">{devices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Online Devices</span>
                <span className="text-white font-medium">{devices.filter(d => d.status === 'online').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Maintenance Devices</span>
                <span className="text-white font-medium">{devices.filter(d => d.status === 'maintenance').length}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 py-3 px-4 rounded-lg transition-colors">
                Add New User
              </button>
              <button className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 py-3 px-4 rounded-lg transition-colors">
                Register Device
              </button>
              <button className="bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 py-3 px-4 rounded-lg transition-colors">
                Schedule Maintenance
              </button>
              <button className="bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 py-3 px-4 rounded-lg transition-colors">
                System Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;