# 🎥 Plateforme de Streaming Vidéo Interactive

Une plateforme moderne de streaming vidéo avec annotations interactives, collaboration en temps réel et fonctionnalités de montage léger, construite avec React, TypeScript, Firebase et Tailwind CSS.

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription et connexion sécurisées avec Firebase Auth
- Gestion des profils utilisateurs
- Sessions persistantes

### 📹 Gestion des Vidéos
- Upload et gestion de bibliothèque vidéo
- Métadonnées complètes (titre, description, tags)
- Recherche et filtrage par tags
- Contrôle de visibilité (public/privé)

### 📝 Annotations Interactives
- **Annotations texte** : Commentaires temporisés
- **Quiz interactifs** : Questions à choix multiples
- **Liens contextuels** : Redirections vers des ressources
- **Pop-ups d'information** : Affichage d'informations additionnelles
- Synchronisation en temps réel entre utilisateurs

### 👥 Collaboration en Temps Réel
- Sessions de visionnage partagées
- Synchronisation de la lecture (play/pause/temps)
- Annotations collaboratives
- Gestion des participants

### ✂️ Montage Léger
- Création de clips avec points de début/fin
- Enchaînement de clips en playlists
- Timeline interactive

## 🚀 Installation

### Prérequis
- Node.js 16+ 
- Compte Firebase
- Git

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd project
npm install
```

### 2. Configuration Firebase

1. **Créer un projet Firebase**
   - Allez sur [Firebase Console](https://console.firebase.google.com/)
   - Créez un nouveau projet
   - Activez Authentication (Email/Password)
   - Activez Firestore Database

2. **Obtenir les clés de configuration**
   - Dans les paramètres du projet > Applications Web
   - Copiez les clés de configuration

3. **Configurer les variables d'environnement**
   - Créez un fichier `.env.local` à la racine :
   ```env
   VITE_FIREBASE_API_KEY=votre_api_key
   VITE_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=votre_project_id
   VITE_FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
   VITE_FIREBASE_APP_ID=votre_app_id
   ```

### 3. Démarrer l'application
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 📁 Structure du Projet

```
src/
├── components/              # Composants React
│   ├── Auth/               # Authentification
│   ├── Collaboration/      # Fonctionnalités collaboratives
│   ├── VideoEditor/        # Outils de montage
│   └── VideoUpload/        # Upload de vidéos
├── config/                 # Configuration
│   └── firebase.ts         # Config Firebase
├── services/               # Services Firebase
│   ├── authService.ts      # Service d'authentification
│   ├── videoService.ts     # Service de gestion vidéos
│   ├── annotationService.ts # Service d'annotations
│   └── collaborationService.ts # Service de collaboration
├── store/                  # État global (Zustand)
│   ├── authStore.ts        # Store d'authentification
│   ├── videoStore.ts       # Store de vidéos
│   └── collaborationStore.ts # Store de collaboration
├── hooks/                  # Hooks personnalisés
│   └── useAnnotations.ts   # Hook pour annotations
└── types/                  # Types TypeScript
    └── index.ts            # Définitions de types
```

## 🛠️ Technologies Utilisées

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **État Global** : Zustand
- **Base de Données** : Firebase Firestore
- **Authentification** : Firebase Auth
- **Lecteur Vidéo** : react-player
- **Build Tool** : Vite
- **Icons** : Lucide React

## 🎯 Utilisation

### Créer un Compte
1. Lancez l'application
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire avec votre email et mot de passe

### Ajouter une Vidéo
1. Connectez-vous à votre compte
2. Cliquez sur le bouton "+" dans la navigation
3. Remplissez les métadonnées de la vidéo
4. Ajoutez l'URL de votre vidéo (YouTube, Vimeo, etc.)

### Créer des Annotations
1. Sélectionnez une vidéo dans votre bibliothèque
2. Pendant la lecture, cliquez sur "Ajouter une annotation"
3. Choisissez le type d'annotation :
   - **Texte** : Simple commentaire
   - **Quiz** : Question avec réponses multiples
   - **Lien** : Redirection vers une URL
   - **Pop-up** : Information contextuelle

### Collaboration en Temps Réel
1. Depuis une vidéo, cliquez sur "Partager"
2. Envoyez le lien de session aux collaborateurs
3. Tous les participants verront les annotations en temps réel
4. L'hôte contrôle la lecture pour tous

### Créer des Clips
1. Dans le lecteur vidéo, utilisez l'éditeur de clips
2. Définissez les points de début et de fin
3. Sauvegardez votre clip
4. Créez des playlists en enchaînant plusieurs clips

## 🔧 Configuration Avancée

### Règles de Sécurité Firestore
Ajoutez ces règles dans la console Firebase :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Videos visibility rules
    match /videos/{videoId} {
      allow read: if resource.data.isPublic == true || 
                     (request.auth != null && request.auth.uid == resource.data.authorId);
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
    
    // Annotations rules
    match /annotations/{annotationId} {
      allow read: if resource.data.isPublic == true || 
                     (request.auth != null && request.auth.uid == resource.data.authorId);
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
    
    // Collaboration sessions
    match /collaborationSessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run preview` - Prévisualise la build de production
- `npm run lint` - Vérifie le code avec ESLint

## 🐛 Résolution de Problèmes

### Erreur "ERR_BLOCKED_BY_CLIENT"
- Désactivez les bloqueurs de publicité
- Essayez en navigation privée
- Changez de navigateur

### Problèmes de Connexion Firebase
- Vérifiez vos variables d'environnement
- Assurez-vous que Firebase Auth est activé
- Contrôlez les règles de sécurité Firestore

### Vidéos qui ne se chargent pas
- Vérifiez que l'URL de la vidéo est accessible
- Contrôlez les paramètres CORS du serveur vidéo
- Testez avec des vidéos publiques (YouTube, Vimeo)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Firebase](https://firebase.google.com/) pour les services backend
- [React](https://reactjs.org/) pour le framework frontend
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Zustand](https://github.com/pmndrs/zustand) pour la gestion d'état
- [Lucide](https://lucide.dev/) pour les icônes

---

Développé avec ❤️ pour créer une expérience de streaming vidéo interactive et collaborative. 