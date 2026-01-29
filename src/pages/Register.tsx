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
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would call your backend API to register the user
      // For now, we'll simulate registration and auto-login
        toast.success("Account created successfully! You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mb-4">
            <Sun className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Smart Drying Rack</h1>
          <p className="text-slate-400">Create your account to get started</p>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center text-white">Create Account</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={credentials.name}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  autoComplete="name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={credentials.confirmPassword}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg font-medium transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
              
              <div className="text-center text-sm text-slate-400">
                <p>Already have an account? <a href="/login" className="text-emerald-400 hover:underline">Sign in</a></p>
              </div>
              
              <div className="flex items-center gap-2 my-4">
                <div className="flex-grow border-t border-slate-600"></div>
                <span className="text-slate-400 text-sm px-2">OR</span>
                <div className="flex-grow border-t border-slate-600"></div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full bg-white hover:bg-gray-100 text-gray-800 py-6 text-lg font-medium transition-all duration-300 flex items-center justify-center gap-3"
                onClick={() => {
                  setShowGoogleSelector(true);
                }}
              >
                <Chrome className="h-5 w-5" />
                Continue with Google
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
  );
};

export default RegisterPage;