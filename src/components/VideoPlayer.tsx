import React, { useRef, useEffect, useState } from 'react';
import { VideoControls } from './VideoControls';
import { Timeline } from './Timeline';
import { AnnotationOverlay } from './AnnotationOverlay';
import { VideoData, Annotation } from '../types';
import { isYouTubeEmbed } from '../utils/videoUtils';

interface VideoPlayerProps {
  video: VideoData;
  annotations: Annotation[];
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayPause: (playing: boolean) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  annotations,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayPause
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);



  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(videoElement.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };

    const handlePlay = () => onPlayPause(true);
    const handlePause = () => onPlayPause(false);

    const handleError = (error: Event) => {
      console.error('Video error:', error);
      setVideoError('Unable to load video. Please check the video URL or try a different video.');
      onPlayPause(false);
    };

    const handleLoadStart = () => {
      setVideoError(null);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadstart', handleLoadStart);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadstart', handleLoadStart);
    };
  }, [onTimeUpdate, onPlayPause]);

  useEffect(() => {
    if (videoRef.current && video.url) {
      if (isPlaying) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
          setVideoError('Unable to play video. The video source may be invalid or unsupported.');
          onPlayPause(false); // Reset play state if video can't play
        });
      } else {
        videoRef.current.pause();
      }
    } else if (isPlaying && !video.url) {
      setVideoError('No video source provided.');
      onPlayPause(false);
    }
  }, [isPlaying, onPlayPause, video.url]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      onTimeUpdate(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const activeAnnotations = annotations.filter(annotation => {
    const endTime = annotation.time + (annotation.duration || 5);
    return currentTime >= annotation.time && currentTime <= endTime;
  });

  return (
    <div className="bg-black relative">
      <div className="relative group">
        {video.url && isYouTubeEmbed(video.url) ? (
          <iframe
            src={video.url}
            className="w-full h-auto max-h-[70vh] aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={video.title}
            frameBorder="0"
          />
        ) : (
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-auto max-h-[70vh] object-contain"
            poster={video.thumbnail}
          />
        )}

        {(videoError || !video.url) && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              {!video.url ? (
                <>
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-blue-400 text-3xl">📹</span>
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-3">No Video Available</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    This is a placeholder video. Upload your own videos to get started!
                  </p>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-xs">
                      💡 Tip: Use the upload button in the navigation to add your first video
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-400 text-2xl">⚠</span>
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">Video Error</h3>
                  <p className="text-gray-300 text-sm max-w-md">{videoError}</p>
                </>
              )}
            </div>
          </div>
        )}

        <AnnotationOverlay annotations={activeAnnotations} />

        {/* Only show custom controls for non-YouTube videos */}
        {!isYouTubeEmbed(video.url) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <VideoControls
              isPlaying={isPlaying}
              onPlayPause={() => onPlayPause(!isPlaying)}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              onFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
            />
          </div>
        )}
      </div>

      <div className="bg-gray-900 p-4">
        {/* Only show timeline for non-YouTube videos */}
        {!isYouTubeEmbed(video.url) && (
          <Timeline
            currentTime={currentTime}
            duration={duration}
            annotations={annotations}
            onSeek={handleSeek}
          />
        )}

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
          <div className="flex items-center space-x-4 text-gray-400">
            <span>{video.author}</span>
            <span>•</span>
            <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
            <span>•</span>
            <div className="flex space-x-2">
              {video.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-800 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Show helpful message for YouTube videos */}
          {isYouTubeEmbed(video.url) && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm flex items-center">
                <span className="mr-2">🔴</span>
                YouTube video - Use the YouTube player controls to play, pause, and adjust settings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};