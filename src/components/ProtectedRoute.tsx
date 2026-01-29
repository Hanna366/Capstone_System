import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (requiredRole && !authService.hasRole(requiredRole)) {
        navigate("/unauthorized");
        return;
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  // Show loading state while checking authentication
  if (!authService.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (requiredRole && !authService.hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">
            You don't have permission to access this page. Please contact your administrator.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};