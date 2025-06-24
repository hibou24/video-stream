import { create } from 'zustand';
import { VideoData, Annotation, VideoClip, Playlist, Chapter, VideoSegment } from '../types';
import { videoService } from '../services/videoService';
import { annotationService } from '../services/annotationService';

interface VideoState {
  videos: VideoData[];
  annotations: Annotation[];
  clips: VideoClip[];
  playlists: Playlist[];
  chapters: Chapter[];
  segments: VideoSegment[];
  currentVideo: VideoData | null;
  currentPlaylist: Playlist | null;
  isLoading: boolean;
  error: string | null;
  // Video operations
  loadUserVideos: (userId: string) => Promise<void>;
  loadPublicVideos: () => Promise<void>;
  loadAllVideos: (userId: string) => Promise<void>;
  addVideo: (video: Omit<VideoData, 'id' | 'uploadDate' | 'viewCount'>) => Promise<string>;
  updateVideo: (id: string, updates: Partial<VideoData>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  // Annotation operations
  loadVideoAnnotations: (videoId: string) => Promise<void>;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
  // Local operations
  createClip: (clip: Omit<VideoClip, 'id'>) => void;
  createPlaylist: (playlist: Omit<Playlist, 'id' | 'createdAt'>) => void;
  setCurrentVideo: (video: VideoData | null) => void;
  getVideosByUser: (userId: string) => VideoData[];
  getAnnotationsByVideo: (videoId: string) => Annotation[];
  // Chapter and segment operations
  setVideoChapters: (videoId: string, chapters: Chapter[]) => void;
  setVideoSegments: (videoId: string, segments: VideoSegment[]) => void;
  getVideoChapters: (videoId: string) => Chapter[];
  getVideoSegments: (videoId: string) => VideoSegment[];
  clearError: () => void;
}

// Sample data - replace with your own videos
const initialVideos: VideoData[] = [
  {
    id: '1',
    title: 'Welcome to StreamEdit Pro',
    description: 'Get started by uploading your first video! Click the upload button to add your content.',
    url: '', // Empty URL - will show placeholder
    thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?w=400',
    duration: 0,
    tags: ['Welcome', 'Getting Started', 'Tutorial'],
    uploadDate: new Date('2024-01-15'),
    author: 'StreamEdit Pro',
    authorId: 'system',
    isPublic: true,
    collaborators: [],
    viewCount: 0
  }
];

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: initialVideos,
  annotations: [],
  clips: [],
  playlists: [],
  chapters: [],
  segments: [],
  currentVideo: null,
  currentPlaylist: null,
  isLoading: false,
  error: null,

  // Load user videos from Firebase
  loadUserVideos: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const videos = await videoService.getUserVideos(userId);
      set({ videos, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de chargement des vidéos' 
      });
    }
  },

  // Load public videos from Firebase
  loadPublicVideos: async () => {
    try {
      set({ isLoading: true, error: null });
      const videos = await videoService.getPublicVideos();
      set({ videos, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de chargement des vidéos publiques' 
      });
    }
  },

  // Load all videos (public + user's private videos)
  loadAllVideos: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const videos = await videoService.getAllVideos(userId);
      set({ videos, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de chargement de toutes les vidéos' 
      });
    }
  },

  addVideo: async (videoData) => {
    try {
      set({ isLoading: true, error: null });
      const videoToCreate = { ...videoData, viewCount: 0 };
      const videoId = await videoService.createVideo(videoToCreate);
      const newVideo = await videoService.getVideo(videoId);
      if (newVideo) {
        set(state => ({ videos: [...state.videos, newVideo], isLoading: false }));
        
        // Reload all videos to ensure consistency (especially for public video visibility)
        const currentUser = videoData.authorId;
        if (currentUser) {
          setTimeout(async () => {
            try {
              const allVideos = await videoService.getAllVideos(currentUser);
              set({ videos: allVideos });
            } catch (error) {
              console.warn('Could not reload videos after adding:', error);
            }
          }, 1000); // Small delay to ensure Firebase has processed the new video
        }
      }
      return videoId;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur d\'ajout de vidéo' 
      });
      throw error;
    }
  },

  updateVideo: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      await videoService.updateVideo(id, updates);
      set(state => ({
        videos: state.videos.map(video =>
          video.id === id ? { ...video, ...updates } : video
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de mise à jour de vidéo' 
      });
      throw error;
    }
  },

  deleteVideo: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await videoService.deleteVideo(id);
      set(state => ({
        videos: state.videos.filter(video => video.id !== id),
        annotations: state.annotations.filter(annotation => annotation.videoId !== id),
        clips: state.clips.filter(clip => clip.videoId !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de suppression de vidéo' 
      });
      throw error;
    }
  },

  // Load annotations for a video from Firebase
  loadVideoAnnotations: async (videoId: string) => {
    try {
      set({ isLoading: true, error: null });
      const annotations = await annotationService.getVideoAnnotations(videoId);
      set({ annotations, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de chargement des annotations' 
      });
    }
  },

  addAnnotation: async (annotationData) => {
    try {
      set({ isLoading: true, error: null });
      const annotationId = await annotationService.createAnnotation(annotationData);
      const newAnnotation = await annotationService.getAnnotation(annotationId);
      if (newAnnotation) {
        set(state => ({ annotations: [...state.annotations, newAnnotation], isLoading: false }));
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur d\'ajout d\'annotation' 
      });
      throw error;
    }
  },

  updateAnnotation: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      await annotationService.updateAnnotation(id, updates);
      set(state => ({
        annotations: state.annotations.map(annotation =>
          annotation.id === id ? { ...annotation, ...updates } : annotation
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de mise à jour d\'annotation' 
      });
      throw error;
    }
  },

  deleteAnnotation: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await annotationService.deleteAnnotation(id);
      set(state => ({
        annotations: state.annotations.filter(annotation => annotation.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de suppression d\'annotation' 
      });
      throw error;
    }
  },

  createClip: (clipData) => {
    const newClip: VideoClip = {
      ...clipData,
      id: Date.now().toString()
    };
    set(state => ({ clips: [...state.clips, newClip] }));
  },

  createPlaylist: (playlistData) => {
    const newPlaylist: Playlist = {
      ...playlistData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    set(state => ({ playlists: [...state.playlists, newPlaylist] }));
  },

  setCurrentVideo: (video) => {
    set({ currentVideo: video });
  },

  getVideosByUser: (userId) => {
    return get().videos.filter(video => video.authorId === userId);
  },

  getAnnotationsByVideo: (videoId) => {
    return get().annotations.filter(annotation => annotation.videoId === videoId);
  },

  // Chapter and segment operations
  setVideoChapters: (videoId, chapters) => {
    // For now, store chapters locally. In a real app, you'd save to Firebase
    set(state => ({
      chapters: [
        ...state.chapters.filter(c => !c.id.startsWith(`${videoId}-`)),
        ...chapters.map(c => ({ ...c, id: `${videoId}-${c.id}` }))
      ]
    }));
  },

  setVideoSegments: (videoId, segments) => {
    // For now, store segments locally. In a real app, you'd save to Firebase
    set(state => ({
      segments: [
        ...state.segments.filter(s => !s.id.startsWith(`${videoId}-`)),
        ...segments.map(s => ({ ...s, id: `${videoId}-${s.id}` }))
      ]
    }));
  },

  getVideoChapters: (videoId) => {
    return get().chapters
      .filter(chapter => chapter.id.startsWith(`${videoId}-`))
      .map(chapter => ({ ...chapter, id: chapter.id.replace(`${videoId}-`, '') }));
  },

  getVideoSegments: (videoId) => {
    return get().segments
      .filter(segment => segment.id.startsWith(`${videoId}-`))
      .map(segment => ({ ...segment, id: segment.id.replace(`${videoId}-`, '') }));
  },

  clearError: () => {
    set({ error: null });
  }
}));