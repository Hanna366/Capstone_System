import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Cloud, Sun, Moon, Clock, Settings } from "lucide-react";
import { StatusBanner } from "@/components/StatusBanner";
import { SolarPowerCard } from "@/components/SolarPowerCard";
import { WeatherCard } from "@/components/WeatherCard";
import { WeatherAnalysisCard } from "@/components/WeatherAnalysisCard";
import { RackControlCard } from "@/components/RackControlCard";
import { NotificationHistory } from "@/components/NotificationHistory";
import { NotificationCenter } from "@/components/NotificationCenter";
import { CoverStatusCard } from "@/components/CoverStatusCard";
import { smartDryingService, type DeviceData } from "@/services/smartDryingService";
import { authService } from "@/services/authService";
import { weatherService, type WeatherData } from "@/services/weatherService";
import { toast } from "sonner";
import { ThemeProvider } from "@/context/ThemeProvider";

// Function to determine time-based theme
const getTimeBasedTheme = (): 'light' | 'dark' => {
  const hour = new Date().getHours();
  // Daytime: 6 AM - 6 PM
  return (hour >= 6 && hour < 18) ? 'light' : 'dark';
};

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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    localStorage.setItem('themeMode', themeMode);
  }, [theme, themeMode]); // Ensure theme and themeMode changes are applied immediately

  // Auto theme switching based on time
  useEffect(() => {
    if (themeMode === 'auto') {
      const updateTheme = () => {
        const newTheme = getTimeBasedTheme();
        setTheme(newTheme); // Update theme immediately
        document.documentElement.setAttribute('data-theme', newTheme); // Apply theme immediately
      };

      updateTheme(); // Ensure the theme is updated immediately on mount
      const now = new Date();
      const timeToNextMinute = (60 - now.getSeconds()) * 1000;

      const timeout = setTimeout(() => {
        updateTheme();

        const interval = setInterval(updateTheme, 60000); // Check every minute

        return () => clearInterval(interval); // Cleanup on unmount
      }, timeToNextMinute);

      return () => clearTimeout(timeout); // Cleanup on unmount
    }
  }, [themeMode]); // Ensure auto mode works correctly

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

  // Rain sensor connection status
  const [isRainSensorConnected, setIsRainSensorConnected] = useState(false);
  const [rainDetected, setRainDetected] = useState(false); // Define rainDetected state

  // Check rain sensor connection status and update rainDetected
  useEffect(() => {
    const checkRainSensorConnection = async () => {
      try {
        // For now, assume rain sensor is connected when ESP32 is online
        const isConnected = deviceData?.esp32Connected || false;
        setIsRainSensorConnected(isConnected);

        if (isConnected) {
          // Simulate rain detection based on humidity (you can replace with actual sensor logic)
          const rainStatus = (deviceData?.humidity || 0) > 70;
          setRainDetected(rainStatus);
        } else {
          setRainDetected(false); // Default to no rain if sensor is disconnected
        }
      } catch (error) {
        console.error("Error checking rain sensor connection:", error);
        setIsRainSensorConnected(false);
        setRainDetected(false);
      }
    };

    checkRainSensorConnection();

    const interval = setInterval(checkRainSensorConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [deviceData]);

  // Updated system decision logic based on rain sensor
  useEffect(() => {
    const handleSystemActions = () => {
      if (isRainSensorConnected) {
        if (rainDetected) {
          console.log("Rain detected: Retracting rack cover.");
          smartDryingService.controlRack("retract"); // Retract the rack cover immediately
        } else {
          console.log("No rain detected: Allowing normal drying operations.");
          // Allow normal drying operations (rack remains extended)
        }
      } else {
        console.warn("Rain sensor not connected: System operating without rain sensor.");
      }
    };

    handleSystemActions(); // Check rain sensor status on mount

    const rainSensorInterval = setInterval(handleSystemActions, 5000); // Check every 5 seconds

    return () => clearInterval(rainSensorInterval); // Cleanup on unmount
  }, [rainDetected, isRainSensorConnected]);

  // Manual user control logic (if enabled)
  const handleManualControl = (action: "extend" | "retract") => {
    console.log(`Manual control: ${action} rack.`);
    smartDryingService.controlRack(action);
  };

  // Fail-safe behavior for Weather API
  useEffect(() => {
    if (!weatherData) {
      console.warn("Weather API disconnected. System operating with rain sensor only.");
    }
  }, [weatherData]);

  // Note: rackAutoMode is now handled by deviceData.autoMode from smartDryingService

  const [dataSource, setDataSource] = useState<'sensor' | 'api'>('sensor');

  const handleDataSourceChange = (newSource: 'sensor' | 'api') => {
    setDataSource(newSource);
  };

  const weatherDataToDisplay = isRainSensorConnected && dataSource === 'sensor'
    ? {
        temperature: deviceData?.temperature ?? null,
        humidity: deviceData?.humidity ?? null,
        uvIndex: deviceData?.uvIndex ?? null,
        windSpeed: deviceData?.windSpeed ?? null,
        rainDetected: rainDetected,
      }
    : dataSource === 'api'
    ? weatherData || {
        temperature: weatherData?.temperature ?? null,
        humidity: weatherData?.humidity ?? null,
        uvIndex: weatherData?.uvIndex ?? null,
        windSpeed: weatherData?.windSpeed ?? null,
      }
    : {
        temperature: null,
        humidity: null,
        uvIndex: null,
        windSpeed: null,
      };

  const isLiveWeatherData = true; // Defined the missing variable

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await weatherService.getCurrentWeather();
        setWeatherData(data);
        setWeatherLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setWeatherError("Failed to fetch weather data.");
        setWeatherLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // Initialize SmartDryingService for ESP32 integration
  useEffect(() => {
    const initService = async () => {
      const success = await smartDryingService.initialize();
      if (success) {
        const unsubscribe = smartDryingService.subscribe(setDeviceData);
        return () => {
          unsubscribe();
        };
      }
    };

    initService();

    return () => {
      smartDryingService.disconnect();
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
                smartDryingService.disconnect();
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
                temperature={typeof weatherData?.temperature === "number" ? weatherData.temperature : null}
                humidity={typeof weatherData?.humidity === "number" ? weatherData.humidity : null}
                uvIndex={typeof weatherData?.uvIndex === "number" ? weatherData.uvIndex : null}
                windSpeed={typeof weatherData?.windSpeed === "number" ? weatherData.windSpeed : null}
                isLiveWeatherData={isLiveWeatherData}
                dataSource={dataSource}
                onDataSourceChange={handleDataSourceChange}
              />
            </div>

            {/* First Row - Status and Weather */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <StatusBanner 
                title="System Status" 
                message="Operating Normally" 
              />
              <WeatherCard 
                temperature={weatherData?.temperature || deviceData?.temperature || 25}
                humidity={weatherData?.humidity || deviceData?.humidity || 60}
                uvIndex={weatherData?.uvIndex || deviceData?.uvIndex || 5}
                windSpeed={weatherData?.windSpeed || deviceData?.windSpeed || 10}
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
                  onExtend={() => smartDryingService.controlRack("extend")}
                  onRetract={() => smartDryingService.controlRack("retract")}
                  position={deviceData?.rackPosition || "retracted"}
                  autoMode={deviceData?.autoMode || false}
                  onToggleAutoMode={(enabled) => smartDryingService.toggleAutoMode(enabled)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export { Index };

const App = () => {
  return (
    <ThemeProvider>
      <Index />
    </ThemeProvider>
  );
};

export default App;
