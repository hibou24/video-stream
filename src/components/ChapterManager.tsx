import React, { useState } from 'react';
import { Chapter, VideoSegment } from '../types';
import { Plus, Edit, Trash2, BookOpen, Tag, Clock, Palette } from 'lucide-react';

interface ChapterManagerProps {
    chapters: Chapter[];
    segments: VideoSegment[];
    duration: number;
    currentTime: number;
    onChaptersChange: (chapters: Chapter[]) => void;
    onSegmentsChange: (segments: VideoSegment[]) => void;
}

export const ChapterManager: React.FC<ChapterManagerProps> = ({
    chapters,
    segments,
    duration,
    currentTime,
    onChaptersChange,
    onSegmentsChange
}) => {
    const [activeTab, setActiveTab] = useState<'chapters' | 'segments'>('chapters');
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [editingSegment, setEditingSegment] = useState<VideoSegment | null>(null);
    const [showChapterForm, setShowChapterForm] = useState(false);
    const [showSegmentForm, setShowSegmentForm] = useState(false);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAddChapter = (chapterData: Omit<Chapter, 'id'>) => {
        const newChapter: Chapter = {
            id: Date.now().toString(),
            ...chapterData
        };
        onChaptersChange([...chapters, newChapter].sort((a, b) => a.time - b.time));
        setShowChapterForm(false);
    };

    const handleEditChapter = (chapter: Chapter) => {
        setEditingChapter(chapter);
        setShowChapterForm(true);
    };

    const handleUpdateChapter = (updatedChapter: Chapter) => {
        onChaptersChange(chapters.map(c => c.id === updatedChapter.id ? updatedChapter : c));
        setEditingChapter(null);
        setShowChapterForm(false);
    };

    const handleDeleteChapter = (chapterId: string) => {
        onChaptersChange(chapters.filter(c => c.id !== chapterId));
    };

    const handleAddSegment = (segmentData: Omit<VideoSegment, 'id'>) => {
        const newSegment: VideoSegment = {
            id: Date.now().toString(),
            ...segmentData
        };
        onSegmentsChange([...segments, newSegment].sort((a, b) => a.startTime - b.startTime));
        setShowSegmentForm(false);
    };

    const handleEditSegment = (segment: VideoSegment) => {
        setEditingSegment(segment);
        setShowSegmentForm(true);
    };

    const handleUpdateSegment = (updatedSegment: VideoSegment) => {
        onSegmentsChange(segments.map(s => s.id === updatedSegment.id ? updatedSegment : s));
        setEditingSegment(null);
        setShowSegmentForm(false);
    };

    const handleDeleteSegment = (segmentId: string) => {
        onSegmentsChange(segments.filter(s => s.id !== segmentId));
    };

    const segmentTypes = [
        { value: 'intro', label: 'Introduction', color: '#10B981' },
        { value: 'content', label: 'Contenu', color: '#3B82F6' },
        { value: 'outro', label: 'Conclusion', color: '#EF4444' },
        { value: 'ad', label: 'Publicité', color: '#F59E0B' },
        { value: 'transition', label: 'Transition', color: '#8B5CF6' },
        { value: 'highlight', label: 'Point fort', color: '#EC4899' }
    ];

    return (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Organisation du contenu</h3>
                <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('chapters')}
                        className={`px-3 py-1 rounded text-sm transition-all ${activeTab === 'chapters'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        <BookOpen className="w-4 h-4 inline mr-1" />
                        Chapitres
                    </button>
                    <button
                        onClick={() => setActiveTab('segments')}
                        className={`px-3 py-1 rounded text-sm transition-all ${activeTab === 'segments'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        <Tag className="w-4 h-4 inline mr-1" />
                        Segments
                    </button>
                </div>
            </div>

            {activeTab === 'chapters' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{chapters.length} chapitres</span>
                        <button
                            onClick={() => setShowChapterForm(true)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Ajouter</span>
                        </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {chapters.map((chapter, index) => (
                            <div
                                key={chapter.id}
                                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: chapter.color }}
                                    />
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-white font-medium">{index + 1}. {chapter.title}</span>
                                            <span className="text-xs text-gray-400">({formatTime(chapter.time)})</span>
                                        </div>
                                        {chapter.description && (
                                            <p className="text-sm text-gray-400 mt-1">{chapter.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => handleEditChapter(chapter)}
                                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteChapter(chapter.id)}
                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'segments' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{segments.length} segments</span>
                        <button
                            onClick={() => setShowSegmentForm(true)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Ajouter</span>
                        </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {segments.map((segment) => {
                            const segmentType = segmentTypes.find(t => t.value === segment.type);
                            return (
                                <div
                                    key={segment.id}
                                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: segmentType?.color || segment.color }}
                                        />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-white font-medium">{segment.title}</span>
                                                <span className="text-xs px-2 py-1 bg-gray-600 rounded-full text-gray-300">
                                                    {segmentType?.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatTime(segment.startTime)} - {formatTime(segment.endTime)}</span>
                                                <span>({formatTime(segment.endTime - segment.startTime)})</span>
                                            </div>
                                            {segment.description && (
                                                <p className="text-sm text-gray-400 mt-1">{segment.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => handleEditSegment(segment)}
                                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSegment(segment.id)}
                                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Chapter Form Modal */}
            {showChapterForm && (
                <ChapterForm
                    chapter={editingChapter}
                    currentTime={currentTime}
                    onSave={editingChapter ? handleUpdateChapter : handleAddChapter}
                    onCancel={() => {
                        setShowChapterForm(false);
                        setEditingChapter(null);
                    }}
                />
            )}

            {/* Segment Form Modal */}
            {showSegmentForm && (
                <SegmentForm
                    segment={editingSegment}
                    currentTime={currentTime}
                    duration={duration}
                    segmentTypes={segmentTypes}
                    onSave={editingSegment ? handleUpdateSegment : handleAddSegment}
                    onCancel={() => {
                        setShowSegmentForm(false);
                        setEditingSegment(null);
                    }}
                />
            )}
        </div>
    );
};

interface ChapterFormProps {
    chapter: Chapter | null;
    currentTime: number;
    onSave: (chapter: Chapter) => void;
    onCancel: () => void;
}

const ChapterForm: React.FC<ChapterFormProps> = ({ chapter, currentTime, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: chapter?.title || `Chapitre ${Date.now()}`,
        description: chapter?.description || '',
        time: chapter?.time || Math.floor(currentTime),
        color: chapter?.color || '#3B82F6'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const chapterData: Chapter = {
            id: chapter?.id || Date.now().toString(),
            ...formData
        };
        onSave(chapterData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {chapter ? 'Modifier le chapitre' : 'Nouveau chapitre'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Temps (secondes)</label>
                        <input
                            type="number"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: parseInt(e.target.value) })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Couleur</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-12 h-8 rounded border border-gray-600"
                            />
                            <Palette className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            {chapter ? 'Modifier' : 'Ajouter'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface SegmentFormProps {
    segment: VideoSegment | null;
    currentTime: number;
    duration: number;
    segmentTypes: Array<{ value: string; label: string; color: string }>;
    onSave: (segment: VideoSegment) => void;
    onCancel: () => void;
}

const SegmentForm: React.FC<SegmentFormProps> = ({
    segment,
    currentTime,
    duration,
    segmentTypes,
    onSave,
    onCancel
}) => {
    const [formData, setFormData] = useState({
        title: segment?.title || `Segment ${Date.now()}`,
        description: segment?.description || '',
        startTime: segment?.startTime || Math.floor(currentTime),
        endTime: segment?.endTime || Math.min(Math.floor(currentTime) + 30, duration),
        type: segment?.type || 'content',
        color: segment?.color || '#3B82F6'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const segmentData: VideoSegment = {
            id: segment?.id || Date.now().toString(),
            ...formData,
            type: formData.type as VideoSegment['type']
        };
        onSave(segmentData);
    };

    const selectedType = segmentTypes.find(t => t.value === formData.type);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {segment ? 'Modifier le segment' : 'Nouveau segment'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as VideoSegment['type'], color: segmentTypes.find(t => t.value === e.target.value)?.color || formData.color })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                            {segmentTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Début (s)</label>
                            <input
                                type="number"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: parseInt(e.target.value) })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                min="0"
                                max={duration}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Fin (s)</label>
                            <input
                                type="number"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: parseInt(e.target.value) })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                min={formData.startTime + 1}
                                max={duration}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            rows={3}
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 text-white py-2 px-4 rounded-lg transition-colors"
                            style={{ backgroundColor: selectedType?.color || '#3B82F6' }}
                        >
                            {segment ? 'Modifier' : 'Ajouter'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 