import React, { useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { useVideoStore } from '../store/videoStore';

interface FirebaseProviderProps {
    children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
    const { user } = useAuthStore();
    const { loadAllVideos } = useVideoStore();

    // Note: Firebase Auth initialization is now handled in authStore.ts

    useEffect(() => {
        // Load all videos (public + user's private) when user is authenticated
        if (user?.id) {
            loadAllVideos(user.id);
        }
    }, [user?.id, loadAllVideos]);

    return <>{children}</>;
}; 