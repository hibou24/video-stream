import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const authService = {
  // S'inscrire avec email et mot de passe
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mettre à jour le profil utilisateur
      await updateProfile(user, { displayName });

      // Créer le profil utilisateur dans Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      return user;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  // Se connecter avec email et mot de passe
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Se déconnecter
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // Obtenir le profil utilisateur depuis Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  },

  // Observer les changements d'état d'authentification
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
}; 