// Helper functions for video handling

// YouTube URL detection and handling
export const isYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
  return youtubeRegex.test(url);
};

export const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string => {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault', 
    high: 'hqdefault',
    maxres: 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

export const getYouTubeEmbedUrl = (url: string): string => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return url;
  
  // Add parameters for better embed experience
  const params = new URLSearchParams({
    enablejsapi: '1',
    autoplay: '0',
    controls: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1'
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

// Check if URL is a YouTube embed
export const isYouTubeEmbed = (url: string): boolean => {
  return url.includes('youtube.com/embed/') || url.includes('youtu.be/');
};

// Thumbnail generation from video
export const generateThumbnailFromVideo = (videoUrl: string, timeInSeconds: number = 1): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.crossOrigin = 'anonymous';
    video.currentTime = timeInSeconds;

    video.onloadeddata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnail);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };

    video.onerror = () => reject(new Error('Could not load video'));
    video.src = videoUrl;
  });
};

// Format duration in seconds to MM:SS format
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Validate video URL format
export const isValidVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for YouTube URLs
  if (isYouTubeUrl(url)) return true;
  
  // Check for common video file extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv'];
  const urlLower = url.toLowerCase();
  
  return videoExtensions.some(ext => urlLower.includes(ext)) || 
         urlLower.includes('video') || 
         urlLower.includes('.m3u8'); // HLS streams
}; 