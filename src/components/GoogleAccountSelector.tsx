import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { Chrome, User, Mail } from "lucide-react";

interface GoogleAccount {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface GoogleAccountSelectorProps {
  onSelectAccount: (account: GoogleAccount) => void;
  onCancel: () => void;
}

export const GoogleAccountSelector = ({ onSelectAccount, onCancel }: GoogleAccountSelectorProps) => {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initiateGoogleAuth = async () => {
      try {
        // In a real app, this would initiate the Google OAuth flow
        // which would show the user's actual Google accounts
        // For now, we'll simulate this by showing a loading state
        // and then immediately redirecting to Google's OAuth
        
        setLoading(true);
        
        // In a real app, we would redirect to Google's OAuth URL
        // For now, we'll simulate this by redirecting after a brief moment
        setTimeout(() => {
          // Use your actual Google OAuth credentials
          // Make sure this redirect URI matches what you configured in Google Cloud Console
          const clientId = '511789621559-tl7q4kuf9atekpl9ilhi6rcnoqbrq7qv.apps.googleusercontent.com';
          
          // IMPORTANT: Make sure this redirect URI matches exactly what you registered in Google Cloud Console
          // For Google OAuth, we use just the origin as redirect URI
          const redirectUri = window.location.origin;
          
          const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?
            client_id=${encodeURIComponent(clientId)}&
            redirect_uri=${encodeURIComponent(redirectUri)}&
            response_type=code&
            scope=${encodeURIComponent('openid email profile')}&
            prompt=select_account&
            access_type=offline&
            state=${encodeURIComponent('random_state_value')}`;
            
          // Redirect to Google OAuth
          window.location.href = googleAuthUrl.replace(/\s+/g, '');
        }, 1500);
      } catch (err) {
        setError("Failed to initiate Google authentication. Please try again.");
        console.error("Error initiating Google auth:", err);
        setLoading(false);
      }
    };

    initiateGoogleAuth();
  }, []);

  // Since we're redirecting to Google's actual account selection,
  // we don't need the handleAccountSelect function
  // The original function is commented out below:
  /*
  const handleAccountSelect = (account: GoogleAccount) => {
    onSelectAccount(account);
  };
  */

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-slate-400">Redirecting to Google...</p>
          <p className="text-slate-500 text-sm mt-2">Preparing to show your Google accounts</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl w-full max-w-md">
        <CardContent className="py-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
              <Chrome className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Google Sign-In Error</h3>
            <p className="text-slate-400">{error}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full py-5 text-base"
            >
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // This component now serves as a bridge to redirect to Google's actual account selection
  // In a real implementation, this would be replaced by Google's own account picker
  // that shows the user's actual Google accounts
  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl w-full max-w-md">
      <CardHeader className="text-center pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4">
          <Chrome className="h-8 w-8 text-gray-800" />
        </div>
        <CardTitle className="text-2xl font-semibold text-white">Google Sign-In</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-center py-6">
          <p className="text-slate-300 mb-4">You will be redirected to Google to select your account</p>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-6">
            <Chrome className="h-4 w-4" />
            <span>Secure authentication by Google</span>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full py-5 text-base border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};