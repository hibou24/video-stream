import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CollaborationSession, User } from '../types';

export const collaborationService = {
  // Créer une nouvelle session de collaboration
  async createSession(videoId: string, hostId: string): Promise<string> {
    try {
      const sessionData = {
        videoId,
        participants: [{ id: hostId }],
        currentTime: 0,
        isPlaying: false,
        host: hostId,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'collaborationSessions'), sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      throw error;
    }
  },

  // Rejoindre une session de collaboration
  async joinSession(sessionId: string, user: User): Promise<void> {
    try {
      const sessionRef = doc(db, 'collaborationSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data();
        const participants = sessionData.participants || [];
        
        // Vérifier si l'utilisateur n'est pas déjà dans la session
        const isAlreadyParticipant = participants.some((p: User) => p.id === user.id);
        
        if (!isAlreadyParticipant) {
          await updateDoc(sessionRef, {
            participants: [...participants, user],
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la participation à la session:', error);
      throw error;
    }
  },

  // Quitter une session de collaboration
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'collaborationSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data();
        const participants = sessionData.participants || [];
        
        const updatedParticipants = participants.filter((p: User) => p.id !== userId);
        
        if (updatedParticipants.length === 0) {
          // Si plus de participants, supprimer la session
          await deleteDoc(sessionRef);
        } else {
          // Mettre à jour la liste des participants
          const updates: Record<string, any> = { participants: updatedParticipants };
          
          // Si l'hôte quitte, désigner un nouvel hôte
          if (sessionData.host === userId && updatedParticipants.length > 0) {
            updates.host = updatedParticipants[0].id;
          }
          
          await updateDoc(sessionRef, updates);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sortie de la session:', error);
      throw error;
    }
  },

  // Synchroniser l'état de lecture (temps et play/pause)
  async syncPlaybackState(sessionId: string, currentTime: number, isPlaying: boolean): Promise<void> {
    try {
      const sessionRef = doc(db, 'collaborationSessions', sessionId);
      await updateDoc(sessionRef, {
        currentTime,
        isPlaying,
      });
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      throw error;
    }
  },

  // Obtenir une session de collaboration
  async getSession(sessionId: string): Promise<CollaborationSession | null> {
    try {
      const docRef = doc(db, 'collaborationSessions', sessionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as CollaborationSession;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      throw error;
    }
  },

  // Obtenir toutes les sessions actives pour une vidéo
  async getVideoSessions(videoId: string): Promise<CollaborationSession[]> {
    try {
      const q = query(
        collection(db, 'collaborationSessions'),
        where('videoId', '==', videoId)
      );

      const querySnapshot = await getDocs(q);
      const sessions: CollaborationSession[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as CollaborationSession);
      });

      return sessions;
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      throw error;
    }
  },

  // Écouter les changements en temps réel sur une session
  onSessionChange(sessionId: string, callback: (session: CollaborationSession | null) => void) {
    const docRef = doc(db, 'collaborationSessions', sessionId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as CollaborationSession);
      } else {
        callback(null);
      }
    });
  },

  // Écouter les changements sur toutes les sessions d'une vidéo
  onVideoSessionsChange(videoId: string, callback: (sessions: CollaborationSession[]) => void) {
    const q = query(
      collection(db, 'collaborationSessions'),
      where('videoId', '==', videoId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const sessions: CollaborationSession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as CollaborationSession);
      });
      callback(sessions);
    });
  },
}; 