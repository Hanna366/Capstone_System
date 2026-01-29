import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import UnauthorizedPage from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import GoogleCallbackPage from "./pages/GoogleCallback";
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
      path: "/",
      element: (
        <ProtectedRoute>
          <Index />
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
