import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { VideoPlayer } from './components/VideoPlayer';
import { VideoLibrary } from './components/VideoLibrary';
import { AnnotationPanel } from './components/AnnotationPanel';
import { AuthPage } from './components/Auth/AuthPage';
import { VideoUploadModal } from './components/VideoUpload/VideoUploadModal';
import { CollaborationPanel } from './components/Collaboration/CollaborationPanel';
import { ClipEditor } from './components/VideoEditor/ClipEditor';
import { FirebaseProvider } from './components/FirebaseProvider';

import { VideoData } from './types';
import { useAuthStore } from './store/authStore';
import { useVideoStore } from './store/videoStore';

function App() {
  const [currentView, setCurrentView] = useState<'library' | 'player'>('library');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { videos, setCurrentVideo } = useVideoStore();

  const handleVideoSelect = (video: VideoData) => {
    setSelectedVideo(video);
    setCurrentVideo(video);
    setCurrentView('player');
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleBack = () => {
    setCurrentView('library');
    setSelectedVideo(null);
    setCurrentVideo(null);
  };

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <FirebaseProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Navigation
            currentView={currentView}
            onViewChange={setCurrentView}
            onBack={handleBack}
            showBack={currentView === 'player'}
            onUpload={() => setShowUploadModal(true)}
          />

          <main className="pt-16">
            <Routes>
              <Route path="/" element={
                currentView === 'library' ? (
                  <VideoLibrary videos={videos} onVideoSelect={handleVideoSelect} />
                ) : selectedVideo ? (
                  <div className="flex flex-col lg:flex-row min-h-screen">
                    <div className="flex-1">
                      <VideoPlayer
                        video={selectedVideo}
                        annotations={[]}
                        currentTime={currentTime}
                        isPlaying={isPlaying}
                        onTimeUpdate={setCurrentTime}
                        onPlayPause={setIsPlaying}
                      />
                    </div>
                    <div className="w-full lg:w-96 bg-gray-800/50 backdrop-blur-sm border-l border-gray-700 flex flex-col">
                      <div className="flex-1">
                        <AnnotationPanel
                          videoId={selectedVideo.id}
                          currentTime={currentTime}
                          onSeekTo={setCurrentTime}
                        />
                      </div>
                      <div className="border-t border-gray-700">
                        <CollaborationPanel videoId={selectedVideo.id} />
                      </div>
                      <div className="border-t border-gray-700">
                        <ClipEditor
                          videoId={selectedVideo.id}
                          duration={selectedVideo.duration}
                          currentTime={currentTime}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/" replace />
                )
              } />
              <Route path="/collaborate/:sessionId" element={
                <div>Collaboration session page (to be implemented)</div>
              } />
            </Routes>
          </main>

          <VideoUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
          />


        </div>
      </Router>
    </FirebaseProvider>
  );
}

export default App;