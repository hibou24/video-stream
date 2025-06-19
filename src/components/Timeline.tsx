import React, { useState, useRef } from 'react';
import { Annotation } from '../types';

interface TimelineProps {
  currentTime: number;
  duration: number;
  annotations: Annotation[];
  onSeek: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  currentTime,
  duration,
  annotations,
  onSeek
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    onSeek(Math.max(0, Math.min(duration, newTime)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const time = (hoverX / rect.width) * duration;
    setHoverTime(Math.max(0, Math.min(duration, time)));

    if (isDragging) {
      onSeek(Math.max(0, Math.min(duration, time)));
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      <div
        ref={timelineRef}
        className="relative h-2 bg-gray-700 rounded-full cursor-pointer group"
        onClick={handleTimelineClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setHoverTime(null)}
      >
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
        
        {/* Playhead */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500 transition-all duration-150"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
        
        {/* Annotations */}
        {annotations.map((annotation) => {
          const annotationPosition = (annotation.time / duration) * 100;
          return (
            <div
              key={annotation.id}
              className="absolute top-0 w-1 h-full bg-yellow-400 rounded-full"
              style={{ left: `${annotationPosition}%` }}
              title={`${annotation.type}: ${annotation.title || annotation.content}`}
            />
          );
        })}
        
        {/* Hover time indicator */}
        {hoverTime !== null && (
          <div
            className="absolute -top-8 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded pointer-events-none"
            style={{ left: `${(hoverTime / duration) * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>
    </div>
  );
};