import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  onPlayPause,
  volume,
  onVolumeChange,
  onFullscreen,
  isFullscreen
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onPlayPause}
          className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </button>

        <div 
          className="relative"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 1)}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {volume > 0 ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white" />
            )}
          </button>
          
          {showVolumeSlider && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-2 bg-gray-600 rounded-lg appearance-none slider"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume * 100}%, #4B5563 ${volume * 100}%, #4B5563 100%)`
                }}
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onFullscreen}
        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5 text-white" />
        ) : (
          <Maximize className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
};