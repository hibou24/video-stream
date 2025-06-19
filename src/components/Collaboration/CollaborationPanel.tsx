import React, { useState } from 'react';
import { Users, Share2, Copy, UserPlus, Crown, Eye } from 'lucide-react';
import { useCollaborationStore } from '../../store/collaborationStore';
import { useAuthStore } from '../../store/authStore';

interface CollaborationPanelProps {
  videoId: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ videoId }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  
  const { currentSession, isHost, createSession, leaveSession } = useCollaborationStore();
  const { user } = useAuthStore();

  const handleCreateSession = () => {
    if (user) {
      createSession(videoId, user);
      const sessionLink = `${window.location.origin}/collaborate/${Date.now()}`;
      setShareLink(sessionLink);
      setShowShareModal(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Collaboration</span>
        </h3>
      </div>

      {!currentSession ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Share2 className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-gray-300 mb-4">Start a collaboration session to watch together</p>
          <button
            onClick={handleCreateSession}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Start Session</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">Session Active</span>
            </div>
            {isHost && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <Crown className="w-4 h-4" />
                <span className="text-xs">Host</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Participants ({currentSession.participants.length})
            </h4>
            <div className="space-y-2">
              {currentSession.participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3 p-2 bg-gray-700/50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{participant.name}</p>
                    <p className="text-gray-400 text-xs">{participant.email}</p>
                  </div>
                  {participant.id === currentSession.host && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={leaveSession}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Leave
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Share Collaboration Session</h3>
            <p className="text-gray-300 text-sm mb-4">
              Share this link with others to join your collaboration session:
            </p>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};