import React, { useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { useVideoStore } from '../store/videoStore';

interface FirebaseProviderProps {
    children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
    const { user } = useAuthStore();
    const { loadUserVideos } = useVideoStore();

    // Note: Firebase Auth initialization is now handled in authStore.ts

    useEffect(() => {
        // Load user videos when user is authenticated
        if (user?.id) {
            loadUserVideos(user.id);
        }
    }, [user?.id, loadUserVideos]);

    return <>{children}</>;
}; 