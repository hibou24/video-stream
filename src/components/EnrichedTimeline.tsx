import React, { useState, useRef, useMemo } from 'react';
import { Annotation, Chapter, VideoSegment, TimelineMarker } from '../types';
import { Play, Pause, BookOpen, Tag, MessageSquare, HelpCircle, Star } from 'lucide-react';

interface EnrichedTimelineProps {
    currentTime: number;
    duration: number;
    annotations: Annotation[];
    chapters?: Chapter[];
    segments?: VideoSegment[];
    onSeek: (time: number) => void;
    isPlaying?: boolean;
    onPlayPause?: () => void;
}

export const EnrichedTimeline: React.FC<EnrichedTimelineProps> = ({
    currentTime,
    duration,
    annotations,
    chapters = [],
    segments = [],
    onSeek,
    isPlaying = false,
    onPlayPause
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoveredMarker, setHoveredMarker] = useState<TimelineMarker | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Generate timeline markers from all data sources
    const timelineMarkers = useMemo(() => {
        const markers: TimelineMarker[] = [];

        // Add annotation markers
        annotations.forEach((annotation) => {
            markers.push({
                id: `annotation-${annotation.id}`,
                time: annotation.time,
                type: 'annotation',
                title: annotation.title || annotation.content,
                color: getAnnotationColor(annotation.type),
                data: annotation
            });
        });

        // Add chapter markers
        chapters.forEach((chapter) => {
            markers.push({
                id: `chapter-${chapter.id}`,
                time: chapter.time,
                type: 'chapter',
                title: chapter.title,
                color: chapter.color || '#3B82F6',
                data: chapter
            });
        });

        // Add segment start/end markers
        segments.forEach((segment) => {
            markers.push({
                id: `segment-start-${segment.id}`,
                time: segment.startTime,
                type: 'segment-start',
                title: `${segment.title} (début)`,
                color: getSegmentColor(segment.type),
                data: segment
            });
            markers.push({
                id: `segment-end-${segment.id}`,
                time: segment.endTime,
                type: 'segment-end',
                title: `${segment.title} (fin)`,
                color: getSegmentColor(segment.type),
                data: segment
            });
        });

        return markers.sort((a, b) => a.time - b.time);
    }, [annotations, chapters, segments]);

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

        // Check if hovering over a marker
        const tolerance = 10; // pixels
        const hoveredMarker = timelineMarkers.find(marker => {
            const markerX = (marker.time / duration) * rect.width;
            return Math.abs(hoverX - markerX) <= tolerance;
        });
        setHoveredMarker(hoveredMarker || null);

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

    const handleMarkerClick = (marker: TimelineMarker, e: React.MouseEvent) => {
        e.stopPropagation();
        onSeek(marker.time);
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Get current segment
    const currentSegment = segments.find(segment =>
        currentTime >= segment.startTime && currentTime <= segment.endTime
    );

    // Get current chapter
    const currentChapter = chapters
        .filter(chapter => chapter.time <= currentTime)
        .sort((a, b) => b.time - a.time)[0];

    return (
        <div className="space-y-4">
            {/* Current context info */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                    <span className="text-gray-400">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    {currentChapter && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                            <BookOpen className="w-3 h-3 text-blue-400" />
                            <span className="text-blue-300 text-xs">{currentChapter.title}</span>
                        </div>
                    )}
                    {currentSegment && (
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full border"
                            style={{
                                backgroundColor: `${getSegmentColor(currentSegment.type)}20`,
                                borderColor: `${getSegmentColor(currentSegment.type)}50`
                            }}>
                            <Tag className="w-3 h-3" style={{ color: getSegmentColor(currentSegment.type) }} />
                            <span className="text-xs" style={{ color: getSegmentColor(currentSegment.type) }}>
                                {currentSegment.title}
                            </span>
                        </div>
                    )}
                </div>

                {onPlayPause && (
                    <button
                        onClick={onPlayPause}
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                )}
            </div>

            {/* Segments background */}
            <div className="relative">
                <div
                    ref={timelineRef}
                    className="relative h-8 bg-gray-800 rounded-lg cursor-pointer group overflow-hidden"
                    onClick={handleTimelineClick}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => {
                        setHoverTime(null);
                        setHoveredMarker(null);
                    }}
                >
                    {/* Segment backgrounds */}
                    {segments.map((segment) => {
                        const startPercent = (segment.startTime / duration) * 100;
                        const widthPercent = ((segment.endTime - segment.startTime) / duration) * 100;
                        return (
                            <div
                                key={`segment-bg-${segment.id}`}
                                className="absolute top-0 h-full opacity-30 rounded"
                                style={{
                                    left: `${startPercent}%`,
                                    width: `${widthPercent}%`,
                                    backgroundColor: getSegmentColor(segment.type)
                                }}
                                title={`${segment.title}: ${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}`}
                            />
                        );
                    })}

                    {/* Progress bar */}
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-150 z-10"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Timeline markers */}
                    {timelineMarkers.map((marker) => {
                        const markerPosition = (marker.time / duration) * 100;
                        return (
                            <div
                                key={marker.id}
                                className="absolute top-0 w-1 h-full cursor-pointer hover:w-2 transition-all duration-150 z-20"
                                style={{
                                    left: `${markerPosition}%`,
                                    backgroundColor: marker.color,
                                    boxShadow: `0 0 4px ${marker.color}50`
                                }}
                                onClick={(e) => handleMarkerClick(marker, e)}
                                title={marker.title}
                            >
                                {/* Marker icon */}
                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {getMarkerIcon(marker.type)}
                                </div>
                            </div>
                        );
                    })}

                    {/* Playhead */}
                    <div
                        className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500 transition-all duration-150 z-30"
                        style={{ left: `calc(${progress}% - 8px)` }}
                    />

                    {/* Hover time indicator */}
                    {hoverTime !== null && !hoveredMarker && (
                        <div
                            className="absolute -top-10 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded pointer-events-none z-40"
                            style={{ left: `${(hoverTime / duration) * 100}%` }}
                        >
                            {formatTime(hoverTime)}
                        </div>
                    )}

                    {/* Marker tooltip */}
                    {hoveredMarker && (
                        <div
                            className="absolute -top-16 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg pointer-events-none z-40 max-w-48"
                            style={{ left: `${(hoveredMarker.time / duration) * 100}%` }}
                        >
                            <div className="flex items-center space-x-2 mb-1">
                                {getMarkerIcon(hoveredMarker.type)}
                                <span className="font-medium">{hoveredMarker.title}</span>
                            </div>
                            <div className="text-gray-300">{formatTime(hoveredMarker.time)}</div>
                            {hoveredMarker.data && 'description' in hoveredMarker.data && hoveredMarker.data.description && (
                                <div className="text-gray-400 mt-1 text-xs">{hoveredMarker.data.description}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chapter navigation */}
            {chapters.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    <span className="text-sm text-gray-400 whitespace-nowrap">Chapitres:</span>
                    {chapters.map((chapter, index) => (
                        <button
                            key={chapter.id}
                            onClick={() => onSeek(chapter.time)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${currentChapter?.id === chapter.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            <span>{index + 1}</span>
                            <span>{chapter.title}</span>
                            <span className="text-gray-400">({formatTime(chapter.time)})</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Quick stats */}
            <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                    <span>{annotations.length} annotations</span>
                    <span>{chapters.length} chapitres</span>
                    <span>{segments.length} segments</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Annotations</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Chapitres</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Segments</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper functions
function getAnnotationColor(type: string): string {
    switch (type) {
        case 'text': return '#FCD34D';
        case 'quiz': return '#F87171';
        case 'link': return '#60A5FA';
        case 'popup': return '#A78BFA';
        default: return '#FCD34D';
    }
}

function getSegmentColor(type: string): string {
    switch (type) {
        case 'intro': return '#10B981';
        case 'content': return '#3B82F6';
        case 'outro': return '#EF4444';
        case 'ad': return '#F59E0B';
        case 'transition': return '#8B5CF6';
        case 'highlight': return '#EC4899';
        default: return '#6B7280';
    }
}

function getMarkerIcon(type: string) {
    const iconClass = "w-3 h-3 text-white drop-shadow-sm";

    switch (type) {
        case 'annotation':
            return <MessageSquare className={iconClass} />;
        case 'chapter':
            return <BookOpen className={iconClass} />;
        case 'segment-start':
        case 'segment-end':
            return <Tag className={iconClass} />;
        case 'bookmark':
            return <Star className={iconClass} />;
        default:
            return <HelpCircle className={iconClass} />;
    }
} 