import { useEffect, useState } from 'react';
import { Annotation } from '../types';
import { annotationService } from '../services/annotationService';

export const useAnnotations = (videoId: string) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load annotations when videoId changes
  useEffect(() => {
    if (!videoId) return;

    const loadAnnotations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const videoAnnotations = await annotationService.getVideoAnnotations(videoId);
        setAnnotations(videoAnnotations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement des annotations');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnotations();
  }, [videoId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!videoId) return;

    const unsubscribe = annotationService.onVideoAnnotationsChange(videoId, (updatedAnnotations) => {
      setAnnotations(updatedAnnotations);
    });

    return unsubscribe;
  }, [videoId]);

  // Add annotation
  const addAnnotation = async (annotationData: Omit<Annotation, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const annotationId = await annotationService.createAnnotation(annotationData);
      const newAnnotation = await annotationService.getAnnotation(annotationId);
      if (newAnnotation) {
        setAnnotations(prev => [...prev, newAnnotation]);
      }
      return annotationId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'ajout d\'annotation');
      throw err;
    }
  };

  // Update annotation
  const updateAnnotation = async (id: string, updates: Partial<Annotation>) => {
    try {
      setError(null);
      await annotationService.updateAnnotation(id, updates);
      setAnnotations(prev => 
        prev.map(annotation => 
          annotation.id === id ? { ...annotation, ...updates } : annotation
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour d\'annotation');
      throw err;
    }
  };

  // Delete annotation
  const deleteAnnotation = async (id: string) => {
    try {
      setError(null);
      await annotationService.deleteAnnotation(id);
      setAnnotations(prev => prev.filter(annotation => annotation.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression d\'annotation');
      throw err;
    }
  };

  // Get annotations at specific time
  const getAnnotationsAtTime = (time: number, tolerance = 1) => {
    return annotations.filter(annotation => 
      Math.abs(annotation.time - time) <= tolerance
    );
  };

  const clearError = () => setError(null);

  return {
    annotations,
    isLoading,
    error,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    getAnnotationsAtTime,
    clearError
  };
}; 