
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { userService } from '@/services/userService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isDevelopmentLogin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthState: () => void;
  setUser: (user: User) => void;
}

let authStateListenerSetup = false;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,
      isDevelopmentLogin: false,
      
      setUser: (user: User) => {
        console.log('Setting user in auth store:', user);
        const isDev = user.email.includes('@dev.com');
        set({ 
          user, 
          isAuthenticated: true, 
          loading: false, 
          isDevelopmentLogin: isDev 
        });
        console.log('Auth state after setUser:', get());
        
        // Dispatch auth success event for post-login registration flow
        window.dispatchEvent(new CustomEvent('authSuccess'));
      },
      
      loginWithGoogle: async () => {
        try {
          console.log('Attempting Google login...');
          set({ loading: true });
          const result = await signInWithPopup(auth, googleProvider);
          const firebaseUser = result.user;
          
          if (firebaseUser) {
            // Check if user exists in our database
            let user = await userService.getUserByEmail(firebaseUser.email!);
            
            if (!user) {
              // Create new user in our database
              const newUserId = await userService.registerUser({
                name: firebaseUser.displayName || 'Unknown User',
                email: firebaseUser.email!,
                role: 'user',
                isActive: true
              });
              
              user = {
                id: newUserId,
                name: firebaseUser.displayName || 'Unknown User',
                email: firebaseUser.email!,
                role: 'user',
                isActive: true
              };
            }
            
            set({ user, isAuthenticated: true, loading: false, isDevelopmentLogin: false });
            console.log('Google login successful for user:', user);
            // Dispatch auth success event
            window.dispatchEvent(new CustomEvent('authSuccess'));
          }
        } catch (error) {
          console.error('Google login error:', error);
          set({ loading: false });
          throw error;
        }
      },

      loginWithPassword: async (email: string, password: string) => {
        try {
          console.log('Attempting password login for:', email);
          set({ loading: true });
          const user = await userService.loginUser(email, password);
          
          if (user) {
            set({ user, isAuthenticated: true, loading: false, isDevelopmentLogin: false });
            console.log('Password login successful for user:', user);
            // Dispatch auth success event
            window.dispatchEvent(new CustomEvent('authSuccess'));
          } else {
            set({ loading: false });
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          console.error('Password login error:', error);
          set({ loading: false });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          console.log('Logging out user...');
          const { isDevelopmentLogin } = get();
          
          // Only sign out from Firebase if it's not a development login
          if (!isDevelopmentLogin) {
            await signOut(auth);
          }
          
          set({ user: null, isAuthenticated: false, isDevelopmentLogin: false, loading: false });
          console.log('User logged out successfully');
        } catch (error) {
          console.error('Logout error:', error);
          set({ loading: false });
        }
      },
      
      checkAuthState: () => {
        const currentState = get();
        console.log('Checking auth state. Current state:', { 
          isAuthenticated: currentState.isAuthenticated, 
          isDevelopmentLogin: currentState.isDevelopmentLogin,
          user: currentState.user?.email 
        });
        
        // Skip Firebase auth check for development logins
        if (currentState.isDevelopmentLogin && currentState.user) {
          console.log('Skipping Firebase auth check for development login');
          set({ loading: false });
          return;
        }
        
        // Only set up the auth state listener once
        if (!authStateListenerSetup) {
          authStateListenerSetup = true;
          onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('Firebase auth state changed:', firebaseUser ? 'User found' : 'No user');
            
            if (firebaseUser) {
              try {
                const user = await userService.getUserByEmail(firebaseUser.email!);
                if (user) {
                  set({ user, isAuthenticated: true, loading: false, isDevelopmentLogin: false });
                  console.log('Auth state validated with Firebase user');
                } else {
                  console.log('User not found in database, clearing auth state');
                  set({ user: null, isAuthenticated: false, loading: false, isDevelopmentLogin: false });
                }
              } catch (error) {
                console.error('Error checking auth state:', error);
                set({ user: null, isAuthenticated: false, loading: false, isDevelopmentLogin: false });
              }
            } else {
              // Only clear state if we don't have a persisted development login
              const currentState = get();
              if (!currentState.isDevelopmentLogin) {
                console.log('No Firebase user found, clearing auth state');
                set({ user: null, isAuthenticated: false, loading: false, isDevelopmentLogin: false });
              } else {
                console.log('Preserving development login despite no Firebase user');
                set({ loading: false });
              }
            }
          });
        } else {
          // Just set loading to false if listener is already set up
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isDevelopmentLogin: state.isDevelopmentLogin,
      }),
    }
  )
);
