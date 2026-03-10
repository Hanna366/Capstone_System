import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Cloud, Sun, Moon, Clock, Settings } from "lucide-react";
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
import { weatherService, type WeatherData } from "@/services/weatherService";
import { toast } from "sonner";

const Index = () => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [themeMode, setThemeMode] = useState<'manual' | 'auto'>(() => localStorage.getItem('themeMode') as 'manual' | 'auto' || 'manual');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedMode = localStorage.getItem('themeMode') || 'manual';
    
    // If auto mode, calculate time-based theme
    if (savedMode === 'auto') {
      return getTimeBasedTheme();
    }
    
    return savedTheme;
  });

  // Function to determine time-based theme
  const getTimeBasedTheme = (): 'light' | 'dark' => {
    const hour = new Date().getHours();
    // Daytime: 6 AM - 6 PM
    return (hour >= 6 && hour < 18) ? 'light' : 'dark';
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    localStorage.setItem('themeMode', themeMode);
  }, [theme, themeMode]);

  // Auto theme switching based on time
  useEffect(() => {
    if (themeMode === 'auto') {
      const checkTimeBasedTheme = () => {
        const timeBasedTheme = getTimeBasedTheme();
        if (timeBasedTheme !== theme) {
          setTheme(timeBasedTheme);
        }
      };

      // Check immediately
      checkTimeBasedTheme();

      // Check every minute
      const interval = setInterval(checkTimeBasedTheme, 60000);
      
      return () => clearInterval(interval);
    }
  }, [themeMode, theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleThemeMode = () => {
    const newMode = themeMode === 'manual' ? 'auto' : 'manual';
    setThemeMode(newMode);
    
    // If switching to auto, immediately apply time-based theme
    if (newMode === 'auto') {
      setTheme(getTimeBasedTheme());
    }
  };
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ensure auth state is loaded from localStorage
  useEffect(() => {
    authService.refreshAuthState();
  }, []);
  
  const currentUser = authService.getCurrentUser();

  // Fetch weather data on component mount
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setWeatherLoading(true);
        setWeatherError(null);
        
        // First test the API key
        const isApiKeyValid = await weatherService.testApiKey();
        if (!isApiKeyValid) {
          setWeatherError('Invalid API key. Please get a free key from OpenWeatherMap');
          setWeatherLoading(false);
          return;
        }
        
        let weatherData;
        
        // Try to get user's location first
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              console.log('Got user location:', position.coords.latitude, position.coords.longitude);
              weatherData = await weatherService.getCurrentWeatherByLocation(
                position.coords.latitude, 
                position.coords.longitude
              );
              if (weatherData) {
                setWeatherData(weatherData);
                console.log('Weather data fetched by location:', weatherData);
              }
              setWeatherLoading(false);
            },
            async (error) => {
              console.warn('Geolocation error:', error);
              // Fallback to Manila if geolocation fails
              weatherData = await weatherService.getCurrentWeather();
              if (weatherData) {
                setWeatherData(weatherData);
                console.log('Weather data fetched by city:', weatherData);
              }
              setWeatherLoading(false);
            }
          );
        } else {
          // Fallback to city-based weather if geolocation not supported
          weatherData = await weatherService.getCurrentWeather();
          if (weatherData) {
            setWeatherData(weatherData);
            console.log('Weather data fetched by city:', weatherData);
          }
          setWeatherLoading(false);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setWeatherError('Failed to fetch weather data');
        setWeatherLoading(false);
      }
    };

    fetchWeatherData();
    
    // Refresh weather data every 5 minutes
    const weatherInterval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    
    return () => clearInterval(weatherInterval);
  }, []);

  useEffect(() => {
    console.log('Index page loaded, checking for Google OAuth callback');
    console.log('Current URL search params:', window.location.search);
        
    // Handle OAuth callback when Google redirects back to the root URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
        
    console.log('Code param:', code);
    console.log('Error param:', error);
    
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
          
          console.log('Processing Google OAuth callback with code:', code);
          
          // Handle the Google callback using the auth service
          const user = await authService.handleGoogleCallback(code);
          
          console.log('Google auth result:', user);
          console.log('Current auth state after Google login:', {
            isAuthenticated: authService.isAuthenticated(),
            currentUser: authService.getCurrentUser(),
            localStorageUser: localStorage.getItem('user_session')
          });
          
          if (user) {
            toast.success(`Welcome, ${user.name}! Signed in with Google.`);
            // Force refresh auth state and navigate
            authService.refreshAuthState();
            console.log('Auth state after refresh:', {
              isAuthenticated: authService.isAuthenticated(),
              currentUser: authService.getCurrentUser()
            });
            // Navigate to dashboard
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
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-[radial-gradient(ellipse_at_top_left,rgba(251,146,60,0.15)_0%,transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.15)_0%,transparent_40%)]'
            : 'bg-[radial-gradient(ellipse_at_top_left,rgba(251,146,60,0.08)_0%,transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.08)_0%,transparent_40%)]'
        }`}></div>
        <div className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/30'
            : 'bg-gradient-to-t from-white/30 via-transparent to-slate-50/20'
        }`}></div>
        {/* Animated particles */}
        <div className={`absolute top-20 left-10 w-2 h-2 rounded-full animate-pulse ${
          theme === 'dark' ? 'bg-orange-400/30' : 'bg-orange-500/20'
        }`}></div>
        <div className={`absolute top-40 right-20 w-3 h-3 rounded-full animate-pulse delay-75 ${
          theme === 'dark' ? 'bg-blue-400/30' : 'bg-blue-500/20'
        }`}></div>
        <div className={`absolute bottom-30 left-30 w-2 h-2 rounded-full animate-pulse delay-150 ${
          theme === 'dark' ? 'bg-amber-400/30' : 'bg-amber-500/20'
        }`}></div>
        <div className={`absolute top-60 left-60 w-1 h-1 rounded-full animate-pulse delay-300 ${
          theme === 'dark' ? 'bg-cyan-400/30' : 'bg-cyan-500/20'
        }`}></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* ENHANCED HEADER */}
        <header className={`flex items-center justify-between gap-6 mb-8 backdrop-blur-sm rounded-3xl p-6 border shadow-2xl transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-slate-900/30 border-slate-800/50'
            : 'bg-white/80 border-slate-200/50'
        }`}>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Smart Drying Rack Logo"
                  className="h-16 w-auto drop-shadow-xl brightness-110 contrast-110 saturate-130 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold leading-tight ${
                theme === 'dark'
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-blue-500'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-blue-600'
              }`}>
                Smart Drying
              </h1>
              <p className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>Intelligent Weather-Based Rack Control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Enhanced Theme Toggle with Manual/Auto Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                disabled={themeMode === 'auto'}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border backdrop-blur-sm transition-all duration-300 group shadow-lg ${
                  theme === 'dark'
                    ? 'border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/60'
                    : 'border-slate-300/50 bg-slate-100/60 hover:bg-slate-200/60'
                } ${
                  themeMode === 'auto' ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-blue-400 transition-transform duration-300 group-hover:rotate-12" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />
                )}
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
              </button>

              {/* Auto/Manual Mode Toggle */}
              <button
                onClick={toggleThemeMode}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border backdrop-blur-sm transition-all duration-300 group shadow-lg ${
                  themeMode === 'auto'
                    ? theme === 'dark'
                      ? 'border-blue-500/50 bg-blue-600/30 text-blue-400'
                      : 'border-blue-400/50 bg-blue-100/60 text-blue-600'
                    : theme === 'dark'
                      ? 'border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300'
                      : 'border-slate-300/50 bg-slate-100/60 hover:bg-slate-200/60 text-slate-700'
                }`}
                aria-label="Toggle theme mode"
              >
                {themeMode === 'auto' ? (
                  <>
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Auto</span>
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Manual</span>
                  </>
                )}
              </button>
            </div>

            {/* Time Display in Auto Mode */}
            {themeMode === 'auto' && (
              <div className={`text-sm px-3 py-1.5 rounded-xl backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
                  : 'bg-slate-100/60 text-slate-600 border border-slate-300/50'
              }`}>
                <span className="font-medium">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </span>
                <span className="ml-1 text-xs opacity-75">
                  {getTimeBasedTheme() === 'light' ? '☀️' : '🌙'}
                </span>
              </div>
            )}

            {/* User Section */}
            <div className="hidden md:flex items-center gap-4 mr-2">
              <div className="text-right">
                <p className={`font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>{currentUser?.name}</p>
                <p className={`text-sm capitalize ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>{currentUser?.role}</p>
              </div>
              
              {/* Admin Button */}
              <button 
                onClick={() => {
                  if (authService.hasRole('admin')) {
                    navigate('/admin');
                  } else {
                    toast.error('Admin access required for admin dashboard');
                  }
                }}
                className={`p-3 rounded-2xl backdrop-blur-md border shadow-xl transition-all duration-500 ease-out flex items-center justify-center w-12 h-12 group relative ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-600/30 via-emerald-500/20 to-teal-600/30 hover:from-emerald-600/40 hover:via-emerald-500/30 hover:to-teal-600/40 border-emerald-500/30'
                    : 'bg-gradient-to-r from-emerald-500/30 via-emerald-400/20 to-teal-500/30 hover:from-emerald-500/40 hover:via-emerald-400/30 hover:to-teal-500/40 border-emerald-400/30'
                }`}
                title="Admin Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-400/10 to-teal-400/10'
                    : 'bg-gradient-to-r from-emerald-300/10 to-teal-300/10'
                }`}></div>
              </button>
            </div>
            
            {/* Notification Center - Aligned with logout button */}
            <div className="hidden md:block">
              <NotificationCenter />
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={() => {
                authService.logout();
                navigate('/login');
              }}
              className={`p-3 rounded-2xl backdrop-blur-md border shadow-xl transition-all duration-500 ease-out flex items-center justify-center w-12 h-12 group ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-rose-600/30 via-rose-500/20 to-pink-600/30 hover:from-rose-600/40 hover:via-rose-500/30 hover:to-pink-600/40 border-rose-500/30'
                  : 'bg-gradient-to-r from-rose-500/30 via-rose-400/20 to-pink-500/30 hover:from-rose-500/40 hover:via-rose-400/30 hover:to-pink-500/40 border-rose-400/30'
              }`}
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-rose-400/10 to-pink-400/10'
                  : 'bg-gradient-to-r from-rose-300/10 to-pink-300/10'
              }`}></div>
            </button>
          </div>
        </header>

        {/* ENHANCED MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

          {/* MAIN CONTENT AREA */}
          <div className="xl:col-span-3 space-y-6">
            {/* Weather Analysis Card - Full Width */}
            <div className={`backdrop-blur-sm rounded-3xl p-1 border transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-slate-900/20 border-slate-800/30'
                : 'bg-white/60 border-slate-200/30'
            }`}>
              <WeatherAnalysisCard
                temperature={weatherData?.temperature || deviceData?.temperature || 51}
                humidity={weatherData?.humidity || deviceData?.humidity || 0}
                uvIndex={weatherData?.uvIndex || deviceData?.uvIndex || 7}
                windSpeed={weatherData?.windSpeed || deviceData?.windSpeed || 38}
                isLiveWeatherData={!!weatherData}
              />
            </div>

            {/* Bottom Row - Two Cards Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cover Status Card */}
              <div className={`backdrop-blur-sm rounded-3xl p-1 border transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-slate-900/20 border-slate-800/30'
                  : 'bg-white/60 border-slate-200/30'
              }`}>
                <CoverStatusCard
                  windSpeed={weatherData?.windSpeed || deviceData?.windSpeed || 38}
                  humidity={weatherData?.humidity || deviceData?.humidity || 0}
                  temperature={weatherData?.temperature || deviceData?.temperature || 51}
                />
              </div>

              {/* Rack Control Card */}
              <div className={`backdrop-blur-sm rounded-3xl p-1 border transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-slate-900/20 border-slate-800/30'
                  : 'bg-white/60 border-slate-200/30'
              }`}>
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
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="xl:col-span-1 space-y-6">
            {/* System Status */}
            <div className={`backdrop-blur-sm rounded-3xl p-1 border transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-slate-900/20 border-slate-800/30'
                : 'bg-white/60 border-slate-200/30'
            }`}>
              <StatusBanner
                title="System Status"
                message="Not Connected"
                variant="warning"
                isCharging={false}
                isBlynkConnected={false}
              />
            </div>

            {/* Solar Power Card */}
            <div className={`backdrop-blur-sm rounded-3xl p-1 border transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-slate-900/20 border-slate-800/30'
                : 'bg-white/60 border-slate-200/30'
            }`}>
              <SolarPowerCard
                batteryLevel={0}
                isCharging={false}
                currentOutput={0}
                isConnected={false}
              />
            </div>

            {/* Quick Actions Card */}
            <div className={`p-6 backdrop-blur-sm rounded-3xl shadow-2xl border transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700/50'
                : 'bg-white/80 border-slate-300/50'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 bg-gradient-to-r bg-clip-text ${
                theme === 'dark'
                  ? 'text-transparent from-purple-400 to-pink-400'
                  : 'text-transparent from-purple-600 to-pink-600'
              }`}>Quick Actions</h3>
              <div className="space-y-3">
                <button className={`w-full p-3 rounded-2xl border transition-all duration-300 text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/20 hover:from-blue-600/40 hover:to-blue-500/30 text-white border-blue-500/30'
                    : 'bg-gradient-to-r from-blue-500/30 to-blue-400/20 hover:from-blue-500/40 hover:to-blue-400/30 text-slate-800 border-blue-400/30'
                }`}>
                  Refresh Weather Data
                </button>
                <button className={`w-full p-3 rounded-2xl border transition-all duration-300 text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-green-600/30 to-green-500/20 hover:from-green-600/40 hover:to-green-500/30 text-white border-green-500/30'
                    : 'bg-gradient-to-r from-green-500/30 to-green-400/20 hover:from-green-500/40 hover:to-green-400/30 text-slate-800 border-green-400/30'
                }`}>
                  Test Connection
                </button>
                <button className={`w-full p-3 rounded-2xl border transition-all duration-300 text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 text-white border-amber-500/30'
                    : 'bg-gradient-to-r from-amber-500/30 to-amber-400/20 hover:from-amber-500/40 hover:to-amber-400/30 text-slate-800 border-amber-400/30'
                }`}>
                  View Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
