# 🚨 Guide de Résolution de Problèmes Firebase

## Erreur "400 (Bad Request)" Firestore

### Symptômes
```
GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel 400 (Bad Request)
WebChannelConnection RPC 'Listen' stream transport errored
```

### Solutions Étape par Étape

#### 1. ✅ Vérifier les Variables d'Environnement

**Problème le plus fréquent** : Fichier `.env.local` manquant ou incorrect.

1. **Créez le fichier `.env.local`** à la racine du projet :
   ```bash
   touch .env.local
   ```

2. **Ajoutez vos clés Firebase** :
   ```env
   VITE_FIREBASE_API_KEY=votre_api_key_ici
   VITE_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=votre_project_id
   VITE_FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
   VITE_FIREBASE_APP_ID=votre_app_id
   ```

3. **Redémarrez le serveur de développement** :
   ```bash
   npm run dev
   ```

#### 2. 🔧 Obtenir les Clés Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet (ou créez-en un)
3. Cliquez sur l'icône ⚙️ > **Paramètres du projet**
4. Scrollez vers **Vos applications** > **SDK**
5. Copiez les valeurs de `firebaseConfig`

#### 3. 🗄️ Vérifier la Configuration Firestore

1. **Dans Firebase Console** :
   - Allez dans **Firestore Database**
   - Cliquez sur **Créer une base de données**
   - Choisissez **Commencer en mode test** (pour le développement)
   - Sélectionnez une région proche

2. **Vérifiez les règles de sécurité** :
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Permettre la lecture/écriture en mode test
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

#### 4. 🔐 Configurer Authentication

1. Dans Firebase Console, allez dans **Authentication**
2. Cliquez sur **Commencer**
3. Dans **Sign-in method**, activez **Email/Password**

#### 5. 🧪 Test de Diagnostic

L'application inclut maintenant un composant de debug en haut à droite qui affiche :
- ✅ Configuration : Variables d'environnement chargées
- ✅ Connexion : Firebase peut se connecter
- ✅ Firestore : Base de données accessible

### Erreurs Communes et Solutions

#### Erreur : "Project not found"
```
FirebaseError: Project 'your-project-id' not found
```
**Solution** : Vérifiez que `VITE_FIREBASE_PROJECT_ID` correspond exactement à votre Project ID dans Firebase Console.

#### Erreur : "API key not valid"
```
FirebaseError: API key not valid. Please pass a valid API key.
```
**Solution** : 
1. Vérifiez que `VITE_FIREBASE_API_KEY` est correct
2. Régénérez une nouvelle clé API dans Firebase Console si nécessaire

#### Erreur : "Permission denied"
```
FirebaseError: Missing or insufficient permissions
```
**Solutions** :
1. Vérifiez les règles Firestore (mode test recommandé pour le développement)
2. Assurez-vous que l'utilisateur est authentifié si les règles l'exigent

#### Erreur : "Network error"
```
FirebaseError: A network error occurred
```
**Solutions** :
1. Vérifiez votre connexion internet
2. Désactivez temporairement les bloqueurs de publicité
3. Essayez en navigation privée

### Commandes de Debug

```bash
# Vérifier les variables d'environnement
echo $VITE_FIREBASE_PROJECT_ID

# Nettoyer le cache et redémarrer
rm -rf node_modules/.vite
npm run dev

# Vérifier les logs de la console
# Ouvrez les DevTools (F12) > Console
```

### Configuration de Production

Pour la production, remplacez les règles Firestore par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Videos rules
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

### Support Supplémentaire

Si le problème persiste après ces étapes :

1. **Vérifiez la console** : Ouvrez les DevTools et regardez les messages dans la console
2. **Vérifiez le composant de debug** : Il affichera l'état exact de votre connexion Firebase
3. **Testez avec un nouveau projet** : Créez un nouveau projet Firebase pour éliminer les problèmes de configuration

### Liens Utiles

- [Documentation Firebase](https://firebase.google.com/docs)
- [Console Firebase](https://console.firebase.google.com/)
- [Règles de sécurité Firestore](https://firebase.google.com/docs/firestore/security/rules-overview) 