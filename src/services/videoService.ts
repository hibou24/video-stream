import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { VideoData } from '../types';

export const videoService = {
  // Créer une nouvelle vidéo
  async createVideo(video: Omit<VideoData, 'id' | 'uploadDate'>): Promise<string> {
    try {
      const videoData = {
        ...video,
        uploadDate: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'videos'), videoData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la vidéo:', error);
      throw error;
    }
  },

  // Obtenir une vidéo par ID
  async getVideo(videoId: string): Promise<VideoData | null> {
    try {
      const docRef = doc(db, 'videos', videoId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          uploadDate: data.uploadDate.toDate(),
        } as VideoData;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la vidéo:', error);
      throw error;
    }
  },

  // Obtenir toutes les vidéos d'un utilisateur
  async getUserVideos(userId: string): Promise<VideoData[]> {
    try {
      const q = query(
        collection(db, 'videos'),
        where('authorId', '==', userId)
        // orderBy('uploadDate', 'desc') // Temporarily removed - add back when index is ready
      );

      const querySnapshot = await getDocs(q);
      const videos: VideoData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        videos.push({
          id: doc.id,
          ...data,
          uploadDate: data.uploadDate.toDate(),
        } as VideoData);
      });

      return videos;
    } catch (error) {
      console.error('Erreur lors de la récupération des vidéos:', error);
      throw error;
    }
  },

  // Mettre à jour une vidéo
  async updateVideo(videoId: string, updates: Partial<VideoData>): Promise<void> {
    try {
      const docRef = doc(db, 'videos', videoId);
      await updateDoc(docRef, {
        ...updates,
        uploadDate: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la vidéo:', error);
      throw error;
    }
  },

  // Supprimer une vidéo
  async deleteVideo(videoId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'videos', videoId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la vidéo:', error);
      throw error;
    }
  },

  // Écouter les changements en temps réel sur une vidéo
  onVideoChange(videoId: string, callback: (video: VideoData | null) => void) {
    const docRef = doc(db, 'videos', videoId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          id: doc.id,
          ...data,
          uploadDate: data.uploadDate.toDate(),
        } as VideoData);
      } else {
        callback(null);
      }
    });
  },

  // Rechercher des vidéos par tags
  async searchVideosByTags(tags: string[]): Promise<VideoData[]> {
    try {
      const q = query(
        collection(db, 'videos'),
        where('tags', 'array-contains-any', tags),
        orderBy('uploadDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const videos: VideoData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        videos.push({
          id: doc.id,
          ...data,
          uploadDate: data.uploadDate.toDate(),
        } as VideoData);
      });

      return videos;
    } catch (error) {
      console.error('Erreur lors de la recherche par tags:', error);
      throw error;
    }
  },
}; 