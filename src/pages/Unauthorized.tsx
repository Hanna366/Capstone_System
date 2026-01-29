import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ShieldAlert } from "lucide-react";

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
          <ShieldAlert className="h-10 w-10 text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-slate-400 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/login">
              Sign In Again
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;