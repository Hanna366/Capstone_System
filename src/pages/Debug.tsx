import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";

export const DebugPage = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    const getDebugInfo = () => {
      const localStorageUser = localStorage.getItem('user_session');
      const isAuthenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      setDebugInfo({
        localStorageUser,
        isAuthenticated,
        currentUser,
        windowLocation: window.location.href,
        windowOrigin: window.location.origin,
        timestamp: new Date().toISOString()
      });
    };

    getDebugInfo();
    
    // Update every second
    const interval = setInterval(getDebugInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTestLogin = () => {
    const testUser = {
      id: 'test_user_123',
      username: 'testuser',
      name: 'Test User',
      role: 'user'
    };
    
    authService.setCurrentUser(testUser);
    navigate('/');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Current State</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Is Authenticated:</span>
                    <span className={`font-mono ${debugInfo.isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                      {debugInfo.isAuthenticated?.toString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current User:</span>
                    <span className="font-mono text-amber-400">
                      {debugInfo.currentUser ? debugInfo.currentUser.name : 'null'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Window Origin:</span>
                    <span className="font-mono text-blue-400">{debugInfo.windowOrigin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current URL:</span>
                    <span className="font-mono text-purple-400 text-xs">{debugInfo.windowLocation}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">LocalStorage Data</h3>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <pre className="text-xs text-slate-300 overflow-x-auto">
                    {debugInfo.localStorageUser 
                      ? JSON.stringify(JSON.parse(debugInfo.localStorageUser), null, 2)
                      : 'No user data in localStorage'
                    }
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={handleTestLogin} variant="outline" className="bg-green-600/20 border-green-500/50 text-green-400 hover:bg-green-600/30">
                Test Login (Set Test User)
              </Button>
              <Button onClick={handleLogout} variant="outline" className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30">
                Logout
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30">
                Go to Dashboard
              </Button>
              <Button onClick={() => navigate('/login')} variant="outline" className="bg-amber-600/20 border-amber-500/50 text-amber-400 hover:bg-amber-600/30">
                Go to Login
              </Button>
            </div>
            
            <div className="bg-slate-900/30 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Instructions for Google OAuth Fix:</h4>
              <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Cloud Console</a></li>
                <li>Navigate to "APIs & Services" → "Credentials"</li>
                <li>Find your OAuth 2.0 Client ID and click edit</li>
                <li>Add this redirect URI: <code className="bg-slate-700 px-2 py-1 rounded">{debugInfo.windowOrigin}/google-callback</code></li>
                <li>Save the configuration</li>
                <li>Try Google login again</li>
              </ol>
              <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <p className="text-amber-300 text-sm">
                  <strong>Current Port:</strong> {window.location.port || '80'}<br/>
                  <strong>Redirect URI to Add:</strong> {debugInfo.windowOrigin}/google-callback
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugPage;