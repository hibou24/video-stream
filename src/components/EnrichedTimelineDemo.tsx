import React, { useState } from 'react';
import { EnrichedTimeline } from './EnrichedTimeline';
import { ChapterManager } from './ChapterManager';
import { Annotation, Chapter, VideoSegment } from '../types';
import { Play, Pause, Settings } from 'lucide-react';

export const EnrichedTimelineDemo: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(45);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showManager, setShowManager] = useState(false);
    const duration = 300; // 5 minutes

    // Sample annotations
    const [annotations] = useState<Annotation[]>([
        {
            id: '1',
            videoId: 'demo',
            authorId: 'user1',
            authorName: 'Demo User',
            time: 15,
            type: 'text',
            content: 'Point important à retenir',
            title: 'Note importante',
            createdAt: new Date(),
            isPublic: true
        },
        {
            id: '2',
            videoId: 'demo',
            authorId: 'user1',
            authorName: 'Demo User',
            time: 75,
            type: 'quiz',
            content: 'Quelle est la réponse correcte ?',
            title: 'Quiz interactif',
            quizOptions: ['Option A', 'Option B', 'Option C'],
            correctAnswer: 1,
            createdAt: new Date(),
            isPublic: true
        },
        {
            id: '3',
            videoId: 'demo',
            authorId: 'user1',
            authorName: 'Demo User',
            time: 150,
            type: 'link',
            content: 'Lien vers plus d\'informations',
            title: 'Ressource externe',
            link: 'https://example.com',
            createdAt: new Date(),
            isPublic: true
        },
        {
            id: '4',
            videoId: 'demo',
            authorId: 'user1',
            authorName: 'Demo User',
            time: 220,
            type: 'popup',
            content: 'Information contextuelle importante',
            title: 'Info-bulle',
            createdAt: new Date(),
            isPublic: true
        }
    ]);

    // Sample chapters
    const [chapters, setChapters] = useState<Chapter[]>([
        {
            id: '1',
            time: 0,
            title: 'Introduction',
            description: 'Présentation du sujet principal',
            color: '#10B981'
        },
        {
            id: '2',
            time: 60,
            title: 'Développement',
            description: 'Explication détaillée des concepts',
            color: '#3B82F6'
        },
        {
            id: '3',
            time: 180,
            title: 'Exemples pratiques',
            description: 'Démonstrations et cas d\'usage',
            color: '#F59E0B'
        },
        {
            id: '4',
            time: 240,
            title: 'Conclusion',
            description: 'Résumé et points clés',
            color: '#EF4444'
        }
    ]);

    // Sample segments
    const [segments, setSegments] = useState<VideoSegment[]>([
        {
            id: '1',
            startTime: 0,
            endTime: 30,
            title: 'Intro musicale',
            description: 'Générique d\'ouverture',
            type: 'intro',
            color: '#10B981'
        },
        {
            id: '2',
            startTime: 30,
            endTime: 90,
            title: 'Présentation',
            description: 'Introduction du présentateur',
            type: 'content',
            color: '#3B82F6'
        },
        {
            id: '3',
            startTime: 90,
            endTime: 120,
            title: 'Publicité',
            description: 'Message sponsorisé',
            type: 'ad',
            color: '#F59E0B'
        },
        {
            id: '4',
            startTime: 120,
            endTime: 200,
            title: 'Contenu principal',
            description: 'Développement du sujet',
            type: 'content',
            color: '#3B82F6'
        },
        {
            id: '5',
            startTime: 200,
            endTime: 230,
            title: 'Moment fort',
            description: 'Point culminant de la présentation',
            type: 'highlight',
            color: '#EC4899'
        },
        {
            id: '6',
            startTime: 230,
            endTime: 270,
            title: 'Questions-réponses',
            description: 'Session interactive',
            type: 'content',
            color: '#3B82F6'
        },
        {
            id: '7',
            startTime: 270,
            endTime: 300,
            title: 'Conclusion',
            description: 'Remerciements et au revoir',
            type: 'outro',
            color: '#EF4444'
        }
    ]);

    const handleSeek = (time: number) => {
        setCurrentTime(time);
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    // Simulate time progression when playing
    React.useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev >= duration) {
                        setIsPlaying(false);
                        return duration;
                    }
                    return prev + 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isPlaying, duration]);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Démonstration de la Timeline Enrichie
                        </h2>
                        <p className="text-gray-400">
                            Explorez les fonctionnalités avancées de navigation vidéo avec chapitres, segments et annotations
                        </p>
                    </div>
                    <button
                        onClick={() => setShowManager(!showManager)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showManager
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        <span>Gérer le contenu</span>
                    </button>
                </div>

                {/* Video Placeholder */}
                <div className="bg-black rounded-lg aspect-video mb-6 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center text-white">
                        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            {isPlaying ? (
                                <Pause className="w-8 h-8" />
                            ) : (
                                <Play className="w-8 h-8 ml-1" />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Vidéo de démonstration</h3>
                        <p className="text-gray-400">Utilisez la timeline ci-dessous pour naviguer</p>
                    </div>

                    {/* Progress overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                            className="h-full bg-blue-500 transition-all duration-1000"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Enriched Timeline */}
                <EnrichedTimeline
                    currentTime={currentTime}
                    duration={duration}
                    annotations={annotations}
                    chapters={chapters}
                    segments={segments}
                    onSeek={handleSeek}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                />

                {/* Features showcase */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2 flex items-center">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                            Annotations ({annotations.length})
                        </h4>
                        <p className="text-gray-300 text-sm">
                            Points d'intérêt avec différents types : texte, quiz, liens et info-bulles
                        </p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2 flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            Chapitres ({chapters.length})
                        </h4>
                        <p className="text-gray-300 text-sm">
                            Navigation rapide par sections principales avec navigation dédiée
                        </p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2 flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Segments ({segments.length})
                        </h4>
                        <p className="text-gray-300 text-sm">
                            Zones colorées indiquant le type de contenu : intro, contenu, pub, etc.
                        </p>
                    </div>
                </div>
            </div>

            {/* Chapter Manager */}
            {showManager && (
                <ChapterManager
                    chapters={chapters}
                    segments={segments}
                    duration={duration}
                    currentTime={currentTime}
                    onChaptersChange={setChapters}
                    onSegmentsChange={setSegments}
                />
            )}
        </div>
    );
}; 