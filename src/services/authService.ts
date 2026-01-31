// Authentication service for handling login/logout functionality
import { toast } from "sonner";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private readonly STORAGE_KEY = "user_session";

  private constructor() {
    // Check for existing session on initialization
    this.loadSession();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadSession(): void {
    try {
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      this.logout();
    }
  }

  private saveSession(): void {
    if (this.currentUser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
    }
  }

  public async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would call your backend API for authentication
      // For development purposes, we'll allow any username/password combination
      // but in production, this should connect to your backend authentication system
      this.currentUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: credentials.username,
        name: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
        role: "user"
      };
      
      this.saveSession();
      toast.success(`Welcome back, ${this.currentUser.name}!`);
      return this.currentUser;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return null;
    }
  }

  public async getGoogleAccounts(): Promise<Array<{id: string, name: string, email: string, photo?: string}>> {
    try {
      // In a real app, this would use the Google Identity Services API
      // to fetch the user's actual Google accounts
      // This would require implementing the Google Identity Services library
      // and proper OAuth2 setup
      
      // For now, we'll return an empty array to simulate
      // the scenario where we redirect directly to Google's OAuth flow
      // instead of showing account selection
      return [];
    } catch (error) {
      console.error("Error fetching Google accounts:", error);
      return [];
    }
  }

  public async loginWithGoogle(): Promise<User | null> {
    try {
      // In a real app, this would initiate the Google OAuth flow
      // by redirecting to Google's authentication endpoint
      // For now, we'll simulate this by showing a loading state
      
      // This function would typically:
      // 1. Redirect to Google's OAuth URL
      // 2. Google would show the account selection UI
      // 3. After user selects account, Google would redirect back to our app
      // 4. Our app would exchange the authorization code for tokens
      // 5. We would get user info from Google's API
      
      // For simulation purposes, we'll return null to indicate
      // that the actual authentication happens externally
      return null;
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
      return null;
    }
  }

  // Method to handle the callback from Google OAuth
  public async handleGoogleCallback(code: string): Promise<User | null> {
    try {
      // In a real app, this would be called after Google redirects back to our app
      // We would exchange the authorization code for access tokens
      // and then use those to fetch user info from Google's API
      
      // This is where you would make a backend call to exchange the code
      // for tokens and get user info from Google's People API
      // For now, we'll simulate this process
      
      // In a real implementation:
      // 1. Send code to your backend
      // 2. Backend exchanges code for tokens using client_id and client_secret
      // 3. Backend gets user info from Google's People API
      // 4. Backend creates/updates user in your database
      // 5. Backend returns user info to frontend
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const googleUser = {
        id: `google_${Math.random().toString(36).substr(2, 9)}`,
        username: `google_user_${Math.random().toString(36).substr(2, 5)}`,
        name: "Google User", // In real app, this would come from Google's API
        role: "user"
      };
      
      this.currentUser = googleUser;
      this.saveSession();
      
      // Double-check the session is saved
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      console.log('Google auth - Stored user in localStorage:', storedUser);
      console.log('Google auth - Current user in memory:', this.currentUser);
      
      toast.success(`Welcome, ${googleUser.name}! Signed in with Google.`);
      return this.currentUser;
    } catch (error) {
      console.error("Google callback error:", error);
      toast.error("Google authentication failed. Please try again.");
      return null;
    }
  }

  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
    toast.info("You have been logged out");
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    this.saveSession();
  }

  public isAuthenticated(): boolean {
    // Always check localStorage directly - this is the source of truth
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Always sync in-memory state with localStorage
        this.currentUser = user;
        return user !== null && user.id !== undefined;
      } catch (e) {
        console.error('Error parsing stored user:', e);
        this.currentUser = null;
        localStorage.removeItem(this.STORAGE_KEY);
        return false;
      }
    }
    this.currentUser = null;
    return false;
  }

  public hasRole(requiredRole: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === requiredRole;
  }

  public refreshAuthState(): void {
    // Force reload from localStorage to ensure fresh state
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUser = user;
        console.log('Auth state refreshed from localStorage:', user);
      } catch (e) {
        console.error('Error refreshing auth state:', e);
        this.currentUser = null;
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } else {
      this.currentUser = null;
      console.log('No stored auth state found');
    }
  }
}

export const authService = AuthService.getInstance();