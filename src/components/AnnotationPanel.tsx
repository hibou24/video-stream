import React, { useState } from 'react';
import { Plus, MessageCircle, HelpCircle, Link, Info, Clock, Trash2, Users } from 'lucide-react';
import { Annotation } from '../types';
import { useAuthStore } from '../store/authStore';
import { useVideoStore } from '../store/videoStore';

interface AnnotationPanelProps {
  videoId: string;
  currentTime: number;
  onSeekTo: (time: number) => void;
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  videoId,
  currentTime,
  onSeekTo
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    type: 'text' as Annotation['type'],
    content: '',
    title: '',
    time: currentTime,
    duration: 5,
    quizOptions: ['', '', '', ''],
    correctAnswer: 0,
    link: '',
    position: { x: 50, y: 50 },
    isPublic: true
  });

  const { user } = useAuthStore();
  const { addAnnotation, deleteAnnotation, getAnnotationsByVideo } = useVideoStore();
  const annotations = getAnnotationsByVideo(videoId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.content.trim() || !user) return;

    const annotation: Omit<Annotation, 'id' | 'createdAt'> = {
      videoId,
      authorId: user.id,
      authorName: user.name,
      type: newAnnotation.type,
      content: newAnnotation.content,
      time: newAnnotation.time,
      duration: newAnnotation.duration,
      position: newAnnotation.position,
      isPublic: newAnnotation.isPublic
    };

    if (newAnnotation.title.trim()) {
      annotation.title = newAnnotation.title;
    }

    if (newAnnotation.type === 'quiz' && newAnnotation.quizOptions.some(opt => opt.trim())) {
      annotation.quizOptions = newAnnotation.quizOptions.filter(opt => opt.trim());
      annotation.correctAnswer = newAnnotation.correctAnswer;
    }

    if (newAnnotation.type === 'link' && newAnnotation.link.trim()) {
      annotation.link = newAnnotation.link;
    }

    addAnnotation(annotation);
    setIsAdding(false);
    setNewAnnotation({
      type: 'text',
      content: '',
      title: '',
      time: currentTime,
      duration: 5,
      quizOptions: ['', '', '', ''],
      correctAnswer: 0,
      link: '',
      position: { x: 50, y: 50 },
      isPublic: true
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageCircle className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      case 'link':
        return <Link className="w-4 h-4" />;
      case 'popup':
        return <Info className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'border-blue-500 bg-blue-500/10';
      case 'quiz':
        return 'border-green-500 bg-green-500/10';
      case 'link':
        return 'border-purple-500 bg-purple-500/10';
      case 'popup':
        return 'border-orange-500 bg-orange-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Annotations</h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-700/50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <select
                value={newAnnotation.type}
                onChange={(e) => setNewAnnotation(prev => ({ ...prev, type: e.target.value as Annotation['type'] }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text Note</option>
                <option value="quiz">Quiz</option>
                <option value="link">Link</option>
                <option value="popup">Popup Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
              <input
                type="number"
                value={newAnnotation.time}
                onChange={(e) => setNewAnnotation(prev => ({ ...prev, time: parseFloat(e.target.value) }))}
                step="0.1"
                min="0"
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {newAnnotation.type !== 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newAnnotation.title}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
              <textarea
                value={newAnnotation.content}
                onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {newAnnotation.type === 'quiz' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Quiz Options</label>
                {newAnnotation.quizOptions.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newAnnotation.quizOptions];
                      newOptions[index] = e.target.value;
                      setNewAnnotation(prev => ({ ...prev, quizOptions: newOptions }));
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="w-full mb-2 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            )}

            {newAnnotation.type === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={newAnnotation.link}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={newAnnotation.isPublic}
                onChange={(e) => setNewAnnotation(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-300">
                Make this annotation public
              </label>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Add Annotation
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {annotations.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No annotations yet</p>
            <p className="text-sm text-gray-500">Add your first annotation to get started</p>
          </div>
        ) : (
          annotations.map((annotation) => (
            <div
              key={annotation.id}
              className={`p-3 rounded-lg border ${getTypeColor(annotation.type)} cursor-pointer hover:bg-opacity-20 transition-colors`}
              onClick={() => onSeekTo(annotation.time)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 mb-2">
                  {getIcon(annotation.type)}
                  <span className="text-sm font-medium text-white capitalize">
                    {annotation.type}
                  </span>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(annotation.time)}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {annotation.isPublic && (
                    <Users className="w-3 h-3 text-green-400\" title="Public annotation" />
                  )}
                  {annotation.authorId === user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(annotation.id);
                      }}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {annotation.title && (
                <h4 className="font-medium text-white text-sm mb-1">{annotation.title}</h4>
              )}
              
              <p className="text-sm text-gray-300 mb-1">{annotation.content}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>by {annotation.authorName}</span>
                <span>{new Date(annotation.createdAt).toLocaleDateString()}</span>
              </div>
              
              {annotation.type === 'quiz' && annotation.quizOptions && (
                <div className="mt-2 space-y-1">
                  {annotation.quizOptions.map((option, index) => (
                    <div key={index} className="text-xs text-gray-400 pl-2">
                      • {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};