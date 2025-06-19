import React, { useState } from 'react';
import { Scissors, Play, Save, Plus, Trash2, Clock } from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';
import { useAuthStore } from '../../store/authStore';
import { VideoClip } from '../../types';

interface ClipEditorProps {
  videoId: string;
  duration: number;
  currentTime: number;
}

export const ClipEditor: React.FC<ClipEditorProps> = ({ videoId, duration, currentTime }) => {
  const [clips, setClips] = useState<Omit<VideoClip, 'id'>[]>([]);
  const [newClip, setNewClip] = useState({
    title: '',
    startTime: currentTime,
    endTime: Math.min(currentTime + 30, duration)
  });
  const [isCreating, setIsCreating] = useState(false);

  const { createClip, createPlaylist } = useVideoStore();
  const { user } = useAuthStore();

  const handleCreateClip = () => {
    if (!newClip.title.trim() || !user) return;

    const clip: Omit<VideoClip, 'id'> = {
      videoId,
      title: newClip.title,
      startTime: newClip.startTime,
      endTime: newClip.endTime,
      order: clips.length,
      authorId: user.id
    };

    setClips(prev => [...prev, clip]);
    setNewClip({
      title: '',
      startTime: currentTime,
      endTime: Math.min(currentTime + 30, duration)
    });
    setIsCreating(false);
  };

  const handleRemoveClip = (index: number) => {
    setClips(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePlaylist = () => {
    if (clips.length === 0 || !user) return;

    const savedClips = clips.map(clip => {
      createClip(clip);
      return {
        ...clip,
        id: Date.now().toString() + Math.random()
      };
    });

    createPlaylist({
      title: `Playlist - ${new Date().toLocaleDateString()}`,
      clips: savedClips as VideoClip[],
      authorId: user.id,
      isPublic: true
    });

    setClips([]);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return clips.reduce((total, clip) => total + (clip.endTime - clip.startTime), 0);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Scissors className="w-5 h-5" />
          <span>Clip Editor</span>
        </h3>
        {clips.length > 0 && (
          <button
            onClick={handleSavePlaylist}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Playlist</span>
          </button>
        )}
      </div>

      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>Create Clip</span>
        </button>
      ) : (
        <div className="space-y-3 mb-4 p-3 bg-gray-700/50 rounded-lg">
          <input
            type="text"
            value={newClip.title}
            onChange={(e) => setNewClip(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Clip title"
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Start Time</label>
              <input
                type="number"
                value={newClip.startTime}
                onChange={(e) => setNewClip(prev => ({ ...prev, startTime: parseFloat(e.target.value) }))}
                step="0.1"
                min="0"
                max={duration}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">End Time</label>
              <input
                type="number"
                value={newClip.endTime}
                onChange={(e) => setNewClip(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                step="0.1"
                min={newClip.startTime}
                max={duration}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleCreateClip}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors"
            >
              Add Clip
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {clips.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>{clips.length} clips</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(getTotalDuration())}</span>
            </div>
          </div>
          
          {clips.map((clip, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-700/50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                <span className="text-blue-400 text-xs font-medium">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{clip.title}</p>
                <p className="text-gray-400 text-xs">
                  {formatTime(clip.startTime)} - {formatTime(clip.endTime)} 
                  <span className="ml-2">({formatTime(clip.endTime - clip.startTime)})</span>
                </p>
              </div>
              <button
                onClick={() => handleRemoveClip(index)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};