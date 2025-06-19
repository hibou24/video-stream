import React, { useState } from 'react';
import { Search, Filter, Play, Clock, User, Tag, Eye, Edit, Trash2, Share2 } from 'lucide-react';
import { VideoData } from '../types';
import { useAuthStore } from '../store/authStore';
import { useVideoStore } from '../store/videoStore';

interface VideoLibraryProps {
  videos: VideoData[];
  onVideoSelect: (video: VideoData) => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos, onVideoSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [filterBy, setFilterBy] = useState<'all' | 'my' | 'public'>('all');

  const { user } = useAuthStore();
  const { deleteVideo, isLoading, error, clearError } = useVideoStore();

  const allTags = Array.from(new Set(videos.flatMap(video => video.tags)));

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || video.tags.includes(selectedTag);
    const matchesFilter = filterBy === 'all' ||
      (filterBy === 'my' && video.authorId === user?.id) ||
      (filterBy === 'public' && video.isPublic);
    return matchesSearch && matchesTag && matchesFilter;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleDeleteVideo = async (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      try {
        await deleteVideo(videoId);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Bibliothèque Vidéo</h2>
        <p className="text-gray-400">Découvrez et gérez votre contenu vidéo</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-300 hover:text-red-100 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="mb-6 flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="ml-3 text-white">Chargement...</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as 'all' | 'my' | 'public')}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="all">All Videos</option>
            <option value="my">My Videos</option>
            <option value="public">Public Videos</option>
          </select>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="group bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
            onClick={() => onVideoSelect(video)}
          >
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-sm text-white flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(video.duration)}</span>
              </div>

              {/* Action buttons */}
              {video.authorId === user?.id && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit
                    }}
                    className="p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteVideo(e, video.id)}
                    className="p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                {video.title}
              </h3>

              {video.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{video.description}</p>
              )}

              <div className="flex items-center text-sm text-gray-400 mb-3 space-x-4">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{video.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViews(video.viewCount)}</span>
                </div>
                <span>{formatDate(video.uploadDate)}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {video.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  >
                    <Tag className="w-2 h-2 mr-1" />
                    {tag}
                  </span>
                ))}
                {video.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{video.tags.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {video.isPublic ? (
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">Public</span>
                  ) : (
                    <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">Private</span>
                  )}
                </div>

                {video.authorId === user?.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle share
                    }}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};