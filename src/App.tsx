import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import Index from "./pages/Index";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import UnauthorizedPage from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import GoogleCallbackPage from "./pages/GoogleCallback";
import { AdminDashboard } from "./admin/AdminDashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <LoginPage />
    },
    {
      path: "/register",
      element: <RegisterPage />
    },
    {
      path: "/unauthorized",
      element: <UnauthorizedPage />
    },
    {
      path: "/auth/google/callback",
      element: <GoogleCallbackPage />
    },
    {
      path: "/",
      element: <Index />
    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      )
    },

    {
      path: "*",
      element: <NotFound />
    }
  ]
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;