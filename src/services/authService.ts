import { toast } from "sonner";

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user'; // admin and maintainer are the same
  password: string;
}

// Interface for pending users awaiting approval
export interface PendingUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'user';
  password: string;
  createdAt: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private readonly STORAGE_KEY = "user_session";
  private readonly USERS_KEY = "registered_users";
  private readonly PENDING_USERS_KEY = "pending_users";

  private constructor() {
    // Check for existing session on initialization
    this.loadSession();
    // Initialize with default admin account
    this.initializeDefaultAccounts();
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

  private initializeDefaultAccounts(): void {
    const existingUsers = localStorage.getItem(this.USERS_KEY);
    if (!existingUsers) {
      // Create default admin account
      const defaultAdmin: User = {
        id: "admin-001",
        username: "admin",
        name: "System Administrator",
        role: "admin",
        password: "admin123"
      };
      
      localStorage.setItem(this.USERS_KEY, JSON.stringify([defaultAdmin]));
    }
  }

  private getRegisteredUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private saveRegisteredUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private getPendingUsers(): PendingUser[] {
    const pendingUsers = localStorage.getItem(this.PENDING_USERS_KEY);
    return pendingUsers ? JSON.parse(pendingUsers) : [];
  }

  private savePendingUsers(users: PendingUser[]): void {
    localStorage.setItem(this.PENDING_USERS_KEY, JSON.stringify(users));
  }

  private saveSession(): void {
    console.log('saveSession() called with currentUser:', this.currentUser);
    if (this.currentUser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
      console.log('Saved to localStorage with key:', this.STORAGE_KEY);
    } else {
      console.log('currentUser is null, not saving to localStorage');
    }
  }

  public async login(credentials: LoginCredentials, recaptchaToken?: string): Promise<User | null> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify reCAPTCHA token if provided
      if (recaptchaToken) {
        const isValidRecaptcha = await this.verifyRecaptchaToken(recaptchaToken);
        if (!isValidRecaptcha) {
          toast.error("reCAPTCHA verification failed. Please try again.");
          return null;
        }
      }

      // Check if user exists in registered users
      const registeredUsers = this.getRegisteredUsers();
      const user = registeredUsers.find(u => 
        u.username === credentials.username && u.password === credentials.password
      );

      if (!user) {
        toast.error("Invalid username or password. Please check your credentials.");
        return null;
      }

      // Verify that this user is not still in pending state
      const pendingUsers = this.getPendingUsers();
      const pendingUser = pendingUsers.find(u => u.username === credentials.username);
      
      // If user exists in both registered and pending lists, check if still pending
      if (pendingUser && !pendingUser.approved) {
        toast.error("Your account is still pending admin approval. Please wait for approval.");
        return null;
      }

      this.currentUser = user;
      this.saveSession();
      toast.success(`Welcome back, ${this.currentUser.name}!`);
      return this.currentUser;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return null;
    }
  }

  private async verifyRecaptchaToken(token: string): Promise<boolean> {
    try {
      console.log('reCAPTCHA token received:', token.substring(0, 10) + '...');
      
      // For development: accept any valid-looking reCAPTCHA token
      // In production, you would verify with Google's API on your backend
      // Frontend should NOT contain the secret key for security reasons
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo: accept tokens that look like reCAPTCHA tokens (length > 30)
      const isValid = token && token.length > 30;
      
      if (!isValid) {
        console.error('Invalid reCAPTCHA token format');
      }
      
      return isValid;
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
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
  public async register(credentials: RegisterCredentials, role: 'admin' | 'user' = 'user'): Promise<User | null> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if username already exists in registered or pending users
      const registeredUsers = this.getRegisteredUsers();
      const existingUser = registeredUsers.find(u => u.username === credentials.username);
      const pendingUsers = this.getPendingUsers();
      const existingPendingUser = pendingUsers.find(u => u.username === credentials.username);
      
      if (existingUser || existingPendingUser) {
        toast.error("Username already exists. Please choose a different username.");
        return null;
      }

      // Create new user in pending state
      const newPendingUser: PendingUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: credentials.username,
        name: credentials.name,
        email: credentials.email,
        role: 'user',
        password: credentials.password,
        createdAt: new Date().toISOString(),
        approved: false
      };

      // Save to pending users
      pendingUsers.push(newPendingUser);
      this.savePendingUsers(pendingUsers);

      // Show a message indicating the account is pending approval
      toast.info("Your account has been created and is pending admin approval. You will be notified once approved.");
      return null; // Return null since the account isn't active yet
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      return null;
    }
  }

  // Method to approve a pending user
  public async approveUser(userId: string): Promise<boolean> {
    try {
      const pendingUsers = this.getPendingUsers();
      const userIndex = pendingUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        console.error("User not found in pending users");
        return false;
      }

      // Get the pending user
      const pendingUser = pendingUsers[userIndex];
      
      // Update the pending user with approval info
      const approvedUser: PendingUser = {
        ...pendingUser,
        approved: true,
        approvedBy: this.currentUser?.username || 'admin',
        approvedAt: new Date().toISOString()
      };

      // Replace the user in the pending list with the approved version
      pendingUsers[userIndex] = approvedUser;
      this.savePendingUsers(pendingUsers);

      // Convert to active user (remove approval-specific fields)
      const activeUser: User = {
        id: pendingUser.id,
        username: pendingUser.username,
        name: pendingUser.name,
        role: pendingUser.role,
        password: pendingUser.password
      };

      // Add to registered users
      const registeredUsers = this.getRegisteredUsers();
      // Check if user already exists to avoid duplicates
      const userExists = registeredUsers.some(u => u.id === activeUser.id);
      if (!userExists) {
        registeredUsers.push(activeUser);
      }
      this.saveRegisteredUsers(registeredUsers);

      console.log(`User ${userId} approved successfully`);
      return true;
    } catch (error) {
      console.error("Error approving user:", error);
      return false;
    }
  }

  // Method to reject a pending user
  public async rejectUser(userId: string): Promise<boolean> {
    try {
      const pendingUsers = this.getPendingUsers();
      const userIndex = pendingUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        console.error("User not found in pending users");
        return false;
      }

      // Remove from pending users
      pendingUsers.splice(userIndex, 1);
      this.savePendingUsers(pendingUsers);

      console.log(`User ${userId} rejected successfully`);
      return true;
    } catch (error) {
      console.error("Error rejecting user:", error);
      return false;
    }
  }

  // Method to get all pending users
  public getPendingUsersList(): PendingUser[] {
    return this.getPendingUsers();
  }

  // Method to handle the callback from Google OAuth
  public async handleGoogleCallback(code: string): Promise<User | null> {
    console.log('handleGoogleCallback called with code:', code);
    
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
      
      // For simulation purposes, we'll create a temporary user
      // In a real app, you'd create a user account in your database
      // and possibly check if the email already exists
      
      // Extract name from email (before @ symbol) or use default
      // Dynamic Google account names
      const accounts = ["rustycamuro07/16/05", "alicejohnson123", "bobsmith456"];
      const emailName = accounts[Math.floor(Math.random() * accounts.length)];
      
      const tempUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: emailName,
        name: emailName.charAt(0).toUpperCase() + emailName.slice(1),
        role: "user",
        password: "google_temp_password" // In a real app, you wouldn't store passwords for Google auth
      };
      
      // Save the user to localStorage
      this.currentUser = tempUser;
      this.saveSession();
      
      console.log('Google auth successful, user created:', tempUser);
      return tempUser;
    } catch (error) {
      console.error("Error in Google callback:", error);
      toast.error("Error processing Google authentication. Please try again.");
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
        
        // Additional check: verify this user is not still pending approval
        // Get all registered users to confirm the user is in the approved list
        const registeredUsers = this.getRegisteredUsers();
        const userExistsInRegistered = registeredUsers.some(registeredUser => 
          registeredUser.id === user.id
        );
        
        if (!userExistsInRegistered) {
          // User exists in session but not in registered users - might be pending
          // Check if they're still in pending state
          const pendingUsers = this.getPendingUsers();
          const pendingUser = pendingUsers.find(p => p.id === user.id);
          
          // If user is still pending, they shouldn't be authenticated
          if (pendingUser && !pendingUser.approved) {
            this.logout(); // Remove session for pending user
            return false;
          }
        }
        
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
        // Additional check: verify this user is not still pending approval
        const registeredUsers = this.getRegisteredUsers();
        const userExistsInRegistered = registeredUsers.some(registeredUser => 
          registeredUser.id === user.id
        );
        
        if (!userExistsInRegistered) {
          // User exists in session but not in registered users - might be pending
          const pendingUsers = this.getPendingUsers();
          const pendingUser = pendingUsers.find(p => p.id === user.id);
          
          // If user is still pending, clear session and return null
          if (pendingUser && !pendingUser.approved) {
            this.currentUser = null;
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('User still pending approval, clearing session');
            return;
          }
        }
        
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

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  name: string;
}

export const authService = AuthService.getInstance();