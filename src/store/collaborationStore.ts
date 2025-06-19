import { create } from 'zustand';
import { CollaborationSession, User } from '../types';
import { collaborationService } from '../services/collaborationService';

interface CollaborationState {
  currentSession: CollaborationSession | null;
  isHost: boolean;
  isLoading: boolean;
  error: string | null;
  createSession: (videoId: string, hostId: string) => Promise<void>;
  joinSession: (sessionId: string, user: User) => Promise<void>;
  leaveSession: () => Promise<void>;
  updatePlayback: (currentTime: number, isPlaying: boolean) => Promise<void>;
  subscribeToSession: (sessionId: string) => () => void;
  clearError: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  currentSession: null,
  isHost: false,
  isLoading: false,
  error: null,

  createSession: async (videoId, hostId) => {
    try {
      set({ isLoading: true, error: null });
      const sessionId = await collaborationService.createSession(videoId, hostId);
      const session = await collaborationService.getSession(sessionId);
      set({ currentSession: session, isHost: true, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de création de session' 
      });
      throw error;
    }
  },

  joinSession: async (sessionId, user) => {
    try {
      set({ isLoading: true, error: null });
      await collaborationService.joinSession(sessionId, user);
      const session = await collaborationService.getSession(sessionId);
      set({ currentSession: session, isHost: false, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de participation à la session' 
      });
      throw error;
    }
  },

  leaveSession: async () => {
    try {
      const { currentSession } = get();
      if (currentSession) {
        set({ isLoading: true, error: null });
        // Note: We'd need to get the current user ID from auth store
        // For now, we'll just clear the local session
        set({ currentSession: null, isHost: false, isLoading: false });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de sortie de session' 
      });
      throw error;
    }
  },

  updatePlayback: async (currentTime, isPlaying) => {
    try {
      const { currentSession, isHost } = get();
      if (currentSession && isHost) {
        await collaborationService.syncPlaybackState(currentSession.id, currentTime, isPlaying);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur de synchronisation' 
      });
    }
  },

  subscribeToSession: (sessionId) => {
    return collaborationService.onSessionChange(sessionId, (session) => {
      set({ currentSession: session });
    });
  },

  clearError: () => {
    set({ error: null });
  }
}));