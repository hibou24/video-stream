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
        // orderBy('uploadDate', 'desc') // Temporarily disabled while index is building
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

      // Manual sorting while index is building
      return videos.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
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

  // Obtenir toutes les vidéos publiques
  async getPublicVideos(): Promise<VideoData[]> {
    try {
      const q = query(
        collection(db, 'videos'),
        where('isPublic', '==', true)
        // orderBy('uploadDate', 'desc') // Temporarily disabled while index is building
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

      // Manual sorting while index is building
      return videos.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    } catch (error) {
      console.error('Erreur lors de la récupération des vidéos publiques:', error);
      throw error;
    }
  },

  // Obtenir toutes les vidéos (publiques + utilisateur connecté)
  async getAllVideos(userId: string): Promise<VideoData[]> {
    try {
      const [publicVideos, userVideos] = await Promise.all([
        this.getPublicVideos(),
        this.getUserVideos(userId)
      ]);

      // Combine and deduplicate (in case user's public videos are in both arrays)
      const allVideos = [...publicVideos];
      
      // Add user's private videos
      userVideos.forEach(userVideo => {
        if (!userVideo.isPublic) {
          allVideos.push(userVideo);
        }
      });

      // Sort by upload date
      return allVideos.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les vidéos:', error);
      throw error;
    }
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