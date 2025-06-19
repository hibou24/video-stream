import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';

export const FirebaseDebug: React.FC = () => {
    const [status, setStatus] = useState<{
        config: 'loading' | 'success' | 'error';
        connection: 'loading' | 'success' | 'error';
        auth: 'loading' | 'success' | 'error';
        firestore: 'loading' | 'success' | 'error';
        error?: string;
    }>({
        config: 'loading',
        connection: 'loading',
        auth: 'loading',
        firestore: 'loading'
    });

    useEffect(() => {
        const testFirebaseConnection = async () => {
            try {
                // Test 1: Configuration
                setStatus(prev => ({ ...prev, config: 'success' }));

                // Test 2: Connexion Firestore basique
                setStatus(prev => ({ ...prev, connection: 'loading' }));

                // Essayer de lire un document qui n'existe pas (pour tester la connexion)
                try {
                    await getDoc(doc(db, 'test', 'connection'));
                    setStatus(prev => ({ ...prev, connection: 'success', firestore: 'loading' }));
                } catch (err) {
                    console.error('Erreur de connexion Firestore:', err);
                    setStatus(prev => ({
                        ...prev,
                        connection: 'error',
                        error: err instanceof Error ? err.message : 'Erreur de connexion'
                    }));
                    return;
                }

                // Test 3: Test de lecture de collection
                try {
                    const testQuery = query(collection(db, 'users'), limit(1));
                    await getDocs(testQuery);
                    setStatus(prev => ({ ...prev, firestore: 'success' }));
                } catch (err) {
                    console.error('Erreur de lecture Firestore:', err);
                    setStatus(prev => ({
                        ...prev,
                        firestore: 'error',
                        error: err instanceof Error ? err.message : 'Erreur de lecture Firestore'
                    }));
                }

            } catch (err) {
                console.error('Erreur de configuration Firebase:', err);
                setStatus(prev => ({
                    ...prev,
                    config: 'error',
                    error: err instanceof Error ? err.message : 'Erreur de configuration'
                }));
            }
        };

        testFirebaseConnection();
    }, []);

    const getStatusIcon = (state: 'loading' | 'success' | 'error') => {
        switch (state) {
            case 'loading': return '⏳';
            case 'success': return '✅';
            case 'error': return '❌';
        }
    };

    const getStatusColor = (state: 'loading' | 'success' | 'error') => {
        switch (state) {
            case 'loading': return 'text-yellow-400';
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
        }
    };

    return (
        <div className="fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-sm z-50">
            <h3 className="text-white font-semibold mb-3 text-sm">🔧 Firebase Debug</h3>

            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Configuration:</span>
                    <span className={getStatusColor(status.config)}>
                        {getStatusIcon(status.config)} {status.config}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Connexion:</span>
                    <span className={getStatusColor(status.connection)}>
                        {getStatusIcon(status.connection)} {status.connection}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Firestore:</span>
                    <span className={getStatusColor(status.firestore)}>
                        {getStatusIcon(status.firestore)} {status.firestore}
                    </span>
                </div>
            </div>

            {status.error && (
                <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-xs">
                    <strong>Erreur:</strong> {status.error}
                </div>
            )}

            <div className="mt-3 text-xs text-gray-400">
                Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET'}
            </div>
        </div>
    );
}; 