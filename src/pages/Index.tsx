import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StatusBanner } from "@/components/StatusBanner";
import { SolarPowerCard } from "@/components/SolarPowerCard";
import { WeatherCard } from "@/components/WeatherCard";
import { WeatherAnalysisCard } from "@/components/WeatherAnalysisCard";
import { RackControlCard } from "@/components/RackControlCard";
import { BlynkConnectionStatus } from "@/components/BlynkConnectionStatus";
import { BlynkSettingsDialog } from "@/components/BlynkSettingsDialog";
import { NotificationHistory } from "@/components/NotificationHistory";
import { NotificationCenter } from "@/components/NotificationCenter";
import { CoverStatusCard } from "@/components/CoverStatusCard";
import { blynkService, type DeviceData } from "@/services/blynkService";
import { authService } from "@/services/authService";
import { toast } from "sonner";

const Index = () => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ensure auth state is loaded from localStorage
  useEffect(() => {
    authService.refreshAuthState();
  }, []);
  
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // Handle OAuth callback when Google redirects back to the root URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    
    if (error) {
      console.error('Google OAuth error:', error);
      toast.error(`Google login failed: ${error}`);
      // Clean the URL to remove the error parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Still navigate to login on error
      navigate('/login');
      return;
    }
    
    if (code) {
      // Process the Google OAuth callback
      const processGoogleCallback = async () => {
        try {
          // Clean the URL to remove the code parameter
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Handle the Google callback using the auth service
          const user = await authService.handleGoogleCallback(code);
          
          if (user) {
            toast.success(`Welcome, ${user.name}! Signed in with Google.`);
            // Immediately navigate to ensure authentication state is set
            navigate('/', { replace: true });
          } else {
            toast.error('Failed to authenticate with Google');
            navigate('/login');
          }
        } catch (err) {
          console.error('Error handling Google callback:', err);
          toast.error('An error occurred during Google authentication');
          navigate('/login');
        }
      };
      
      processGoogleCallback();
    }
    
    const initService = async () => {
      const success = await blynkService.initialize("BLYNK_API_KEY_12345");
      if (success) {
        const unsubscribe = blynkService.subscribe(setDeviceData);
        return () => {
          unsubscribe();
        };
      }
    };

    initService();

    return () => {
      blynkService.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative scale-75 animate-pulse-slow">
              <img
                src="/logo.png"
                alt="Smart Drying Rack Logo"
                className="h-48 w-auto drop-shadow-2xl brightness-125 contrast-125 saturate-150"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/40 via-transparent to-blue-500/40 rounded-full blur-lg animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-blue-400/30 rounded-full opacity-80"></div>
            </div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-blue-500 pb-4 animate-fade-in">
              Smart Drying Rack
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* User Info and Logout */}
            <div className="hidden md:flex items-center gap-3 mr-4">
              <div className="text-right">
                <p className="text-white font-medium">{currentUser?.name}</p>
                <p className="text-slate-400 text-sm capitalize">{currentUser?.role}</p>
              </div>
              <button 
                onClick={() => {
                  authService.logout();
                  navigate('/login');
                }}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors duration-200"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
            
            <button className="p-3 rounded-full bg-gradient-to-r from-orange-600/30 via-orange-500/20 to-blue-600/30 hover:from-orange-600/40 hover:via-orange-500/30 hover:to-blue-600/40 text-white backdrop-blur-md border border-orange-500/30 shadow-2xl transition-all duration-500 ease-out flex items-center justify-center w-14 h-14 group">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-500 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </button>
            <div className="hidden md:block">
              <NotificationCenter />
            </div>
            <button className="p-3 rounded-full bg-gradient-to-r from-emerald-600/30 via-emerald-500/20 to-teal-600/30 hover:from-emerald-600/40 hover:via-emerald-500/30 hover:to-teal-600/40 text-white backdrop-blur-md border border-emerald-500/30 shadow-2xl transition-all duration-500 ease-out flex items-center justify-center w-14 h-14 group relative">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-500 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <span className="absolute -bottom-8 text-xs text-white whitespace-nowrap bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">Maintenance</span>
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 -mt-2">
            <div className="h-full flex flex-col">
              <div className="flex-grow">
                <WeatherAnalysisCard
                  temperature={deviceData?.temperature || 51}
                  humidity={deviceData?.humidity || 0}
                  uvIndex={deviceData?.uvIndex || 7}
                  windSpeed={deviceData?.windSpeed || 38}
                />
              </div>
              <div className="mt-4">
                <CoverStatusCard
                  windSpeed={deviceData?.windSpeed || 38}
                  humidity={deviceData?.humidity || 0}
                  temperature={deviceData?.temperature || 51}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-6 -mt-6">
            <StatusBanner
              title="System Status"
              message="Connected"
              variant={deviceData?.connected ? "success" : "warning"}
              isCharging={!!deviceData?.isCharging}
            />

            <SolarPowerCard
              batteryLevel={deviceData?.batteryLevel || 94}
              isCharging={!!deviceData?.isCharging}
              currentOutput={deviceData?.currentOutput || 126.57}
            />

            <RackControlCard
              onExtend={() => blynkService.controlRack("extend")}
              onRetract={() => blynkService.controlRack("retract")}
              position={deviceData?.rackPosition || "retracted"}
              autoMode={deviceData?.autoMode || false}
              onToggleAutoMode={(enabled) =>
                blynkService.toggleAutoMode(enabled)
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
