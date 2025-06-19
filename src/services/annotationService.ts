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
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Annotation } from '../types';

export const annotationService = {
  // Créer une nouvelle annotation
  async createAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt'>): Promise<string> {
    try {
      const annotationData = {
        ...annotation,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'annotations'), annotationData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'annotation:', error);
      throw error;
    }
  },

  // Obtenir une annotation par ID
  async getAnnotation(annotationId: string): Promise<Annotation | null> {
    try {
      const docRef = doc(db, 'annotations', annotationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Annotation;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'annotation:', error);
      throw error;
    }
  },

  // Obtenir toutes les annotations d'une vidéo
  async getVideoAnnotations(videoId: string): Promise<Annotation[]> {
    try {
      const q = query(
        collection(db, 'annotations'),
        where('videoId', '==', videoId),
        orderBy('time', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const annotations: Annotation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        annotations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Annotation);
      });

      return annotations;
    } catch (error) {
      console.error('Erreur lors de la récupération des annotations:', error);
      throw error;
    }
  },

  // Obtenir les annotations publiques d'une vidéo
  async getPublicVideoAnnotations(videoId: string): Promise<Annotation[]> {
    try {
      const q = query(
        collection(db, 'annotations'),
        where('videoId', '==', videoId),
        where('isPublic', '==', true),
        orderBy('time', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const annotations: Annotation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        annotations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Annotation);
      });

      return annotations;
    } catch (error) {
      console.error('Erreur lors de la récupération des annotations publiques:', error);
      throw error;
    }
  },

  // Obtenir les annotations d'un utilisateur pour une vidéo
  async getUserVideoAnnotations(videoId: string, userId: string): Promise<Annotation[]> {
    try {
      const q = query(
        collection(db, 'annotations'),
        where('videoId', '==', videoId),
        where('authorId', '==', userId),
        orderBy('time', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const annotations: Annotation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        annotations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Annotation);
      });

      return annotations;
    } catch (error) {
      console.error('Erreur lors de la récupération des annotations utilisateur:', error);
      throw error;
    }
  },

  // Mettre à jour une annotation
  async updateAnnotation(annotationId: string, updates: Partial<Annotation>): Promise<void> {
    try {
      const docRef = doc(db, 'annotations', annotationId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'annotation:', error);
      throw error;
    }
  },

  // Supprimer une annotation
  async deleteAnnotation(annotationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'annotations', annotationId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annotation:', error);
      throw error;
    }
  },

  // Écouter les changements en temps réel sur les annotations d'une vidéo
  onVideoAnnotationsChange(videoId: string, callback: (annotations: Annotation[]) => void) {
    const q = query(
      collection(db, 'annotations'),
      where('videoId', '==', videoId),
      where('isPublic', '==', true),
      orderBy('time', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const annotations: Annotation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        annotations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Annotation);
      });
      callback(annotations);
    });
  },

  // Obtenir les annotations à un moment précis de la vidéo
  async getAnnotationsAtTime(videoId: string, time: number, tolerance = 1): Promise<Annotation[]> {
    try {
      const q = query(
        collection(db, 'annotations'),
        where('videoId', '==', videoId),
        where('isPublic', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const annotations: Annotation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const annotation = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Annotation;

        // Vérifier si l'annotation est dans la tolérance de temps
        if (Math.abs(annotation.time - time) <= tolerance) {
          annotations.push(annotation);
        }
      });

      return annotations.sort((a, b) => a.time - b.time);
    } catch (error) {
      console.error('Erreur lors de la récupération des annotations par temps:', error);
      throw error;
    }
  },
}; 