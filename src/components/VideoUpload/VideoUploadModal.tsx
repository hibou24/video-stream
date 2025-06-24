import React, { useState } from 'react';
import { X, Upload, Link, Plus, Tag, File, Video, Clock, BookOpen } from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';
import { useAuthStore } from '../../store/authStore';
import { ChapterManager } from '../ChapterManager';
import { Chapter, VideoSegment } from '../../types';
import {
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
  generateThumbnailFromVideo
} from '../../utils/videoUtils';
import { uploadService, UploadProgress } from '../../services/uploadService';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'timeline'>('upload');
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    duration: 0,
    tags: [] as string[],
    isPublic: true
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // Timeline data
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [skipTimeline, setSkipTimeline] = useState(false);

  const { addVideo, setVideoChapters, setVideoSegments } = useVideoStore();
  const { user } = useAuthStore();

  const handleClose = () => {
    onClose();
    // Reset all form data
    setCurrentStep('upload');
    setUploadedVideoId(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      thumbnail: '',
      duration: 0,
      tags: [],
      isPublic: true
    });
    setSelectedFile(null);
    setUploadProgress(null);
    setChapters([]);
    setSegments([]);
    setSkipTimeline(false);
  };

  const handleTimelineComplete = () => {
    if (uploadedVideoId) {
      // Save timeline data
      setVideoChapters(uploadedVideoId, chapters);
      setVideoSegments(uploadedVideoId, segments);
    }
    handleClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleFileUpload = async (): Promise<{ url: string; thumbnailUrl?: string; duration: number }> => {
    if (!selectedFile || !user) {
      throw new Error('No file selected or user not authenticated');
    }

    // Get video duration
    let duration = 0;
    try {
      duration = await uploadService.getVideoDuration(selectedFile);
    } catch (error) {
      console.warn('Could not get video duration:', error);
    }

    // Upload video with progress tracking
    const result = await uploadService.uploadVideo(
      selectedFile,
      user.id,
      setUploadProgress
    );

    return {
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      duration: Math.round(duration)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setUploadProgress(null);

    try {
      const finalVideoData = { ...formData };

      // Handle file upload
      if (uploadMethod === 'file' && selectedFile) {
        const uploadResult = await handleFileUpload();
        finalVideoData.url = uploadResult.url;
        finalVideoData.duration = uploadResult.duration;

        // Use uploaded thumbnail if available, otherwise use provided thumbnail
        if (uploadResult.thumbnailUrl) {
          finalVideoData.thumbnail = uploadResult.thumbnailUrl;
        }
      }
      // Handle YouTube URLs
      else if (uploadMethod === 'url' && isYouTubeUrl(formData.url)) {
        const videoId = getYouTubeVideoId(formData.url);
        if (videoId) {
          finalVideoData.url = getYouTubeEmbedUrl(formData.url);

          // Auto-generate YouTube thumbnail if not provided
          if (!formData.thumbnail) {
            finalVideoData.thumbnail = getYouTubeThumbnail(videoId);
          }

          // Set default duration for YouTube videos (will be updated when video loads)
          if (!formData.duration) {
            finalVideoData.duration = 180; // 3 minutes default
          }
        }
      }
      // Handle regular video URLs
      else if (uploadMethod === 'url' && !formData.thumbnail && formData.url) {
        try {
          setIsGeneratingThumbnail(true);
          const generatedThumbnail = await generateThumbnailFromVideo(formData.url);
          finalVideoData.thumbnail = generatedThumbnail;
        } catch (error) {
          console.warn('Could not generate thumbnail:', error);
          // Continue without thumbnail
        } finally {
          setIsGeneratingThumbnail(false);
        }
      }

      const videoId = await addVideo({
        ...finalVideoData,
        author: user.name,
        authorId: user.id,
        collaborators: []
      });

      // For file uploads, offer timeline configuration
      if (uploadMethod === 'file' && !skipTimeline) {
        setUploadedVideoId(videoId);
        setCurrentStep('timeline');
        setIsSubmitting(false);
        return; // Don't close modal yet
      }

      // For URL uploads or if timeline is skipped, close immediately
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsSubmitting(false);
      setIsGeneratingThumbnail(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-white">
              {currentStep === 'upload' ? 'Upload Video' : 'Configure Timeline'}
            </h2>
            {currentStep === 'timeline' && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-300">Upload Complete</span>
                </div>
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300">Timeline Setup</span>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {currentStep === 'upload' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Upload Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Upload Method *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`p-3 rounded-lg border text-sm transition-all ${uploadMethod === 'url'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  <Link className="w-5 h-5 mx-auto mb-1" />
                  <div>URL / YouTube</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`p-3 rounded-lg border text-sm transition-all ${uploadMethod === 'file'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  <Video className="w-5 h-5 mx-auto mb-1" />
                  <div>Upload File</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your video"
              />
            </div>

            {/* Video Source Input */}
            {uploadMethod === 'url' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video URL *
                  <span className="text-gray-500 text-xs ml-2">(supports YouTube, MP4, etc.)</span>
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                    required
                  />
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  💡 YouTube videos will automatically get thumbnails and embed support
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video File *
                  <span className="text-gray-500 text-xs ml-2">(MP4, WebM, MOV - max 100MB)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-file-input"
                    required
                  />
                  <label
                    htmlFor="video-file-input"
                    className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors bg-gray-700/30"
                  >
                    {selectedFile ? (
                      <div className="text-center">
                        <File className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-gray-400 text-sm">{uploadService.formatFileSize(selectedFile.size)}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300">Click to upload video file</p>
                        <p className="text-gray-500 text-sm mt-1">MP4, WebM, MOV up to 100MB</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Upload Progress */}
                {uploadProgress && (
                  <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300 capitalize">
                        {uploadProgress.stage.replace('-', ' ')}...
                      </span>
                      <span className="text-sm text-gray-400">{uploadProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.progress}%` }}
                      ></div>
                    </div>
                    {uploadProgress.error && (
                      <p className="text-red-400 text-sm mt-2">{uploadProgress.error}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thumbnail URL
                <span className="text-gray-500 text-xs ml-2">(optional - will auto-generate if empty)</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/thumbnail.jpg (or leave empty for auto-generation)"
                />
                {isGeneratingThumbnail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-300 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-300">
                Make this video public
              </label>
            </div>

            {/* Timeline Option for File Uploads */}
            {uploadMethod === 'file' && (
              <div className="flex items-center space-x-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <input
                  type="checkbox"
                  id="skipTimeline"
                  checked={skipTimeline}
                  onChange={(e) => setSkipTimeline(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="skipTimeline" className="text-sm text-blue-300 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Skip timeline configuration (you can add it later)</span>
                </label>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'url' && !formData.url)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {uploadMethod === 'file' && uploadProgress
                        ? `${uploadProgress.stage.replace('-', ' ')}...`
                        : 'Processing...'
                      }
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploadMethod === 'file'
                        ? (skipTimeline ? 'Upload Video File' : 'Upload & Configure Timeline')
                        : 'Add Video URL'
                      }
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Timeline Configuration Step */
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Configure Video Timeline</h3>
              <p className="text-gray-400 text-sm">
                Add chapters and segments to make your video more navigable and engaging.
                You can always modify these later in the video player.
              </p>
            </div>

            <ChapterManager
              chapters={chapters}
              segments={segments}
              duration={formData.duration}
              currentTime={0}
              onChaptersChange={setChapters}
              onSegmentsChange={setSegments}
            />

            <div className="flex justify-between pt-6 border-t border-gray-700 mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep('upload')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>← Back to Upload</span>
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Skip Timeline
                </button>
                <button
                  type="button"
                  onClick={handleTimelineComplete}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Save Timeline</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};