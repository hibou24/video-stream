# Configuration Firebase pour la Plateforme de Streaming Vidéo Interactive

## 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Donnez un nom à votre projet (ex: "iris-video-platform")
4. Activez Google Analytics (optionnel)
5. Créez le projet

## 2. Configurer l'authentification

1. Dans votre projet Firebase, allez dans "Authentication"
2. Cliquez sur "Commencer"
3. Dans l'onglet "Sign-in method", activez :
   - **Email/Password** (obligatoire)
   - Google (optionnel)
   - Autres providers selon vos besoins

## 3. Configurer Firestore Database

1. Allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Sélectionnez "Commencer en mode test" (pour le développement)
4. Choisissez une localisation proche de vos utilisateurs

### Structure des Collections Firestore

Votre base de données aura ces collections principales :

```
- users/
  - {userId}/
    - uid: string
    - email: string
    - displayName: string
    - photoURL?: string
    - createdAt: timestamp
    - updatedAt: timestamp

- videos/
  - {videoId}/
    - title: string
    - description?: string
    - url: string
    - thumbnail: string
    - duration: number
    - tags: string[]
    - uploadDate: timestamp
    - author: string
    - authorId: string
    - isPublic: boolean
    - collaborators: string[]
    - viewCount: number

- annotations/
  - {annotationId}/
    - videoId: string
    - authorId: string
    - authorName: string
    - time: number
    - type: 'text' | 'quiz' | 'link' | 'popup'
    - content: string
    - title?: string
    - position?: { x: number; y: number }
    - duration?: number
    - quizOptions?: string[]
    - correctAnswer?: number
    - link?: string
    - createdAt: timestamp
    - isPublic: boolean

- collaborationSessions/
  - {sessionId}/
    - videoId: string
    - participants: User[]
    - currentTime: number
    - isPlaying: boolean
    - host: string
    - createdAt: timestamp
```

## 4. Configurer Storage (optionnel)

Si vous voulez permettre l'upload de vidéos :

1. Allez dans "Storage"
2. Cliquez sur "Commencer"
3. Utilisez les règles par défaut pour commencer

## 5. Obtenir les clés de configuration

1. Dans "Paramètres du projet" > "Général"
2. Scrollez vers le bas jusqu'à "Vos applications"
3. Cliquez sur "Ajouter une application" > Web
4. Donnez un nom à votre app
5. Copiez les clés de configuration

## 6. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine de votre projet :

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

## 7. Règles de sécurité Firestore

Pour le développement, vous pouvez utiliser ces règles de base :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les vidéos
    match /videos/{videoId} {
      allow read: if resource.data.isPublic == true || 
                     (request.auth != null && request.auth.uid == resource.data.authorId);
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
    
    // Règles pour les annotations
    match /annotations/{annotationId} {
      allow read: if resource.data.isPublic == true || 
                     (request.auth != null && request.auth.uid == resource.data.authorId);
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
    
    // Règles pour les sessions de collaboration
    match /collaborationSessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 8. Tester la configuration

Une fois tout configuré, démarrez votre application :

```bash
npm run dev
```

Vous devriez pouvoir :
- Créer un compte utilisateur
- Se connecter/déconnecter
- Les données devraient être sauvegardées dans Firestore

## 9. Production

Pour la production :
1. Changez les règles Firestore pour être plus restrictives
2. Configurez les variables d'environnement de production
3. Activez les quotas et la facturation si nécessaire

## Services Firebase Utilisés

- **Authentication** : Gestion des utilisateurs
- **Firestore** : Base de données NoSQL pour stocker les vidéos, annotations, sessions
- **Storage** : Stockage de fichiers (optionnel pour les vidéos)
- **Realtime Updates** : Synchronisation en temps réel pour la collaboration

Le projet utilise les services Firebase suivants via les fichiers :
- `src/config/firebase.ts` : Configuration de base
- `src/services/authService.ts` : Service d'authentification
- `src/services/videoService.ts` : Gestion des vidéos
- `src/services/annotationService.ts` : Gestion des annotations
- `src/services/collaborationService.ts` : Collaboration en temps réel 