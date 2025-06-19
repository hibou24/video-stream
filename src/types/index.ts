export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface VideoData {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail: string;
  duration: number;
  tags: string[];
  uploadDate: Date;
  author: string;
  authorId: string;
  isPublic: boolean;
  collaborators: string[];
  viewCount: number;
}

export interface Annotation {
  id: string;
  videoId: string;
  authorId: string;
  authorName: string;
  time: number;
  type: 'text' | 'quiz' | 'link' | 'popup';
  content: string;
  title?: string;
  position?: { x: number; y: number };
  duration?: number;
  quizOptions?: string[];
  correctAnswer?: number;
  link?: string;
  createdAt: Date;
  isPublic: boolean;
}

export interface VideoClip {
  id: string;
  videoId: string;
  title: string;
  startTime: number;
  endTime: number;
  order: number;
  authorId: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  clips: VideoClip[];
  authorId: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface CollaborationSession {
  id: string;
  videoId: string;
  participants: User[];
  currentTime: number;
  isPlaying: boolean;
  host: string;
  createdAt: Date;
}

export interface Chapter {
  time: number;
  title: string;
  thumbnail?: string;
}