import { create } from 'zustand';
import { User } from '../types';
import { authService, UserProfile } from '../services/authService';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  initializeAuth: () => void;
  clearError: () => void;
}

// Helper function to convert Firebase user to app user
const convertFirebaseUserToAppUser = (firebaseUser: FirebaseUser, profile?: UserProfile): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    name: profile?.displayName || firebaseUser.displayName || 'Utilisateur',
    avatar: profile?.photoURL || firebaseUser.photoURL || undefined,
    createdAt: profile?.createdAt || new Date()
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const firebaseUser = await authService.signIn(email, password);
      const profile = await authService.getUserProfile(firebaseUser.uid);
      const user = convertFirebaseUserToAppUser(firebaseUser, profile || undefined);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const firebaseUser = await authService.signUp(email, password, name);
      const profile = await authService.getUserProfile(firebaseUser.uid);
      const user = convertFirebaseUserToAppUser(firebaseUser, profile || undefined);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur d\'inscription' 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de déconnexion' 
      });
      throw error;
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      try {
        set({ isLoading: true, error: null });
        const updatedUser = { ...user, ...updates };
        set({ user: updatedUser, isLoading: false });
        // Note: In a real implementation, you'd also update the Firebase profile
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Erreur de mise à jour' 
        });
        throw error;
      }
    }
  },

  initializeAuth: () => {
    try {
      set({ isLoading: true, error: null });
      
      const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const profile = await authService.getUserProfile(firebaseUser.uid);
            const user = convertFirebaseUserToAppUser(firebaseUser, profile || undefined);
            set({ user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
            set({ isLoading: false, error: 'Erreur de chargement du profil' });
          }
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      });

      // Timeout de sécurité pour éviter de rester bloqué en loading
      setTimeout(() => {
        const currentState = get();
        if (currentState.isLoading && !currentState.user) {
          console.warn('Timeout Firebase Auth - arrêt du loading');
          set({ isLoading: false });
        }
      }, 5000); // 5 secondes max

      return unsubscribe;
    } catch (error) {
      console.error('Erreur d\'initialisation Firebase Auth:', error);
      set({ 
        isLoading: false, 
        error: 'Erreur de configuration Firebase. Vérifiez vos variables d\'environnement.' 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));

// Initialize auth state from Firebase Auth only if Firebase is configured
const checkAndInitializeAuth = () => {
  try {
    // Vérifier si les variables d'environnement Firebase sont présentes
    if (import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_API_KEY) {
      console.log('🔥 Initialisation Firebase Auth...');
      useAuthStore.getState().initializeAuth();
    } else {
      console.warn('⚠️ Variables Firebase manquantes - Auth non initialisé');
      useAuthStore.setState({ 
        isLoading: false, 
        error: 'Configuration Firebase requise. Créez un fichier .env.local avec vos clés Firebase.' 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification Firebase:', error);
    useAuthStore.setState({ 
      isLoading: false, 
      error: 'Erreur de configuration Firebase' 
    });
  }
};

checkAndInitializeAuth();