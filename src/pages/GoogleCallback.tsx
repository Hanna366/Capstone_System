import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export const GoogleCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Extract the authorization code from the URL
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        toast.error(`Google login failed: ${error}`);
        navigate('/login');
        return;
      }

      if (code) {
        try {
          // In a real app, this would send the code to your backend
          // which would exchange it for tokens and return user info
          const user = await authService.handleGoogleCallback(code);
          
          if (user) {
            // Redirect to dashboard on successful authentication
            navigate('/');
          } else {
            toast.error('Failed to authenticate with Google');
            navigate('/login');
          }
        } catch (err) {
          console.error('Error handling Google callback:', err);
          toast.error('An error occurred during Google authentication');
          navigate('/login');
        }
      } else {
        // No code in the URL, probably direct access
        toast.error('Invalid authentication response');
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Completing Google Sign-In</h2>
        <p className="text-slate-400">Verifying your credentials...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;