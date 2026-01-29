import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Sun, Chrome } from "lucide-react";
import { authService, type User } from "@/services/authService";
import { GoogleAccountSelector } from "@/components/GoogleAccountSelector";
import { toast } from "sonner";

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export const RegisterPage = () => {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleSelector, setShowGoogleSelector] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!credentials.username || !credentials.email || !credentials.password || !credentials.confirmPassword || !credentials.name) {
      toast.error("Please fill in all fields");
      return false;
    }

    if (credentials.password !== credentials.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (credentials.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit triggered"); // Debug log
    
    if (!validateForm()) {
      console.log("Form validation failed"); // Debug log
      return;
    }

    console.log("Form validation passed, proceeding with registration"); // Debug log
    setIsLoading(true);
    try {
      // In a real app, this would call your backend API to register the user
      // For now, we'll create a user account and auto-login
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: credentials.username,
        name: credentials.name,
        role: "user"
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set the current user (simulate login after registration)
      authService.setCurrentUser(newUser);
      
      toast.success(`Welcome, ${credentials.name}! Account created successfully.`);
      // Direct navigation instead of setTimeout
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-0 relative overflow-hidden">
      {/* Enhanced background with multiple gradient layers and animated particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_20%,rgba(251,146,60,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_90%_80%,rgba(59,130,246,0.15)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(251,146,60,0.05)_0deg,rgba(59,130,246,0.05)_120deg,rgba(16,185,129,0.05)_240deg,rgba(251,146,60,0.05)_360deg)] animate-spin-slow"></div>
      
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-500/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-500/30 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-amber-500/20 rounded-full animate-bounce"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center min-h-screen">
        {/* Left side - Logo and Title with enhanced styling */}
        <div className="flex-1 flex flex-col items-center justify-center p-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-blue-500/5 rounded-3xl blur-3xl"></div>
          <div className="relative text-center max-w-2xl">
            <div className="relative mb-12 group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-transparent to-blue-500/20 rounded-3xl blur-2xl animate-pulse-slow group-hover:animate-pulse"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Smart Drying Rack Logo"
                  className="h-64 w-auto mx-auto drop-shadow-2xl brightness-125 contrast-125 saturate-150 filter hover:scale-110 transition-all duration-700 group-hover:brightness-150 group-hover:contrast-150"
                />
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-blue-500/10 rounded-2xl blur-xl"></div>
              <h1 className="relative text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 via-orange-500 to-blue-500 mb-6 animate-fade-in">Smart Drying Rack</h1>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-x-6 -inset-y-3 bg-gradient-to-r from-slate-700/20 to-slate-800/20 rounded-xl blur"></div>
              <p className="relative text-2xl text-slate-300 font-light tracking-wide">Intelligent Solar-Powered Drying System</p>
            </div>
            
            <div className="mt-12 flex justify-center space-x-6">
              <div className="h-1.5 w-20 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-full animate-pulse"></div>
              <div className="h-1.5 w-12 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="h-1.5 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="mt-8 flex justify-center space-x-8 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                <span>Energy Efficient</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <span>Smart Control</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <span>Weather Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Register Card with glassmorphism */}
        <div className="flex-1 flex items-center justify-center p-16">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 via-amber-500/20 to-blue-500/30 rounded-3xl blur-xl animate-pulse"></div>
            <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-orange-500/40 hover:border-orange-500/60 transition-all duration-500 hover:shadow-orange-500/20 hover:shadow-3xl hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl translate-y-12 -translate-x-12"></div>
              
              <CardHeader className="space-y-3 pt-10 relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                <CardTitle className="text-4xl font-bold text-center text-white tracking-tight">Create Account</CardTitle>
                <CardDescription className="text-center text-slate-400 text-lg font-light">
                  Join our smart drying system today
                </CardDescription>
              </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2 relative z-10">
                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={credentials.name}
                  onChange={handleInputChange}
                  className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-orange-500/30 text-white placeholder:text-slate-400 focus:ring-orange-500 focus:border-orange-500 rounded-xl py-3"
                  required
                  autoComplete="name"
                />
              </div>
              
              <div className="space-y-2 relative z-10">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-orange-500/30 text-white placeholder:text-slate-400 focus:ring-orange-500 focus:border-orange-500 rounded-xl py-3"
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2 relative z-10">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-orange-500/30 text-white placeholder:text-slate-400 focus:ring-orange-500 focus:border-orange-500 rounded-xl py-3"
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2 relative z-10">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-orange-500/30 text-white placeholder:text-slate-400 focus:ring-orange-500 focus:border-orange-500 rounded-xl py-3 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 relative z-10">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={credentials.confirmPassword}
                    onChange={handleInputChange}
                    className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-orange-500/30 text-white placeholder:text-slate-400 focus:ring-orange-500 focus:border-orange-500 rounded-xl py-3 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pb-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-6 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/30 rounded-xl relative overflow-hidden group"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              <div className="text-center text-sm text-slate-400 pt-2">
                <p>Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-orange-400 hover:text-orange-300 transition-colors underline cursor-pointer z-50 relative">Sign in</button></p>
              </div>
              
              <div className="flex items-center gap-2 my-4">
                <div className="flex-grow border-t border-orange-500/30"></div>
                <span className="text-slate-400 text-sm px-2 bg-gradient-to-br from-slate-800/60 to-slate-900/60 px-3 py-1 rounded-full border border-orange-500/20">OR</span>
                <div className="flex-grow border-t border-orange-500/30"></div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:from-slate-700/60 hover:to-slate-800/60 text-white border border-orange-500/30 py-6 text-lg font-medium transition-all duration-300 flex items-center justify-center gap-3 rounded-xl relative overflow-hidden group"
                onClick={() => {
                  setShowGoogleSelector(true);
                }}
              >
                <Chrome className="h-5 w-5 text-orange-400" />
                <span className="relative z-10">Continue with Google</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              {showGoogleSelector && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                  <GoogleAccountSelector
                    onSelectAccount={async (account) => {
                      // This won't be called since we're redirecting to Google
                      // The actual login will happen after Google redirects back
                    }}
                    onCancel={() => {
                      setShowGoogleSelector(false);
                    }}
                  />
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  </div>
</div>
  );
};

export default RegisterPage;