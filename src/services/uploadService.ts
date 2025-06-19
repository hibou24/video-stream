import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { storage, auth } from '../config/firebase';
import { generateThumbnailFromVideo } from '../utils/videoUtils';

export interface UploadProgress {
  progress: number;
  stage: 'uploading' | 'processing' | 'generating-thumbnail' | 'complete';
  url?: string;
  thumbnailUrl?: string;
  error?: string;
}

export const uploadService = {
  // Upload video file to Firebase Storage
  async uploadVideo(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    return new Promise((resolve, reject) => {
      try {
        // Check authentication first
        if (!auth.currentUser) {
          reject(new Error('User not authenticated. Please log in and try again.'));
          return;
        }

        console.log('🔐 User authenticated:', auth.currentUser.uid);
        console.log('📁 Upload path: videos/' + userId);

        // Validate file
        if (!this.isValidVideoFile(file)) {
          reject(new Error('Invalid video file. Please upload MP4, WebM, or MOV files.'));
          return;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
          reject(new Error('File too large. Please upload files smaller than 100MB.'));
          return;
        }

        // Create unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `videos/${userId}/${timestamp}_${sanitizedName}`;
        
        // Create storage reference
        const storageRef = ref(storage, fileName);
        
        // Start upload
        const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);
        
        onProgress?.({ 
          progress: 0, 
          stage: 'uploading'
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress tracking
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.({ 
              progress: Math.round(progress), 
              stage: 'uploading'
            });
          },
          (error) => {
            console.error('Upload error:', error);
            let errorMessage = error.message;
            
            // Provide specific guidance for common errors
            if (error.code === 'storage/unauthorized') {
              errorMessage = `Firebase Storage rules are blocking the upload. Please apply the correct security rules in Firebase Console.
              
Current user: ${auth.currentUser?.uid || 'Not authenticated'}
Upload path: videos/${userId}

Quick fix: Go to Firebase Console > Storage > Rules and use these rules:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;
            } else if (error.message.includes('CORS')) {
              errorMessage = 'CORS error - Firebase Storage not properly configured.';
            } else if (error.code === 'storage/unknown') {
              errorMessage = 'Firebase Storage not enabled. Please enable Storage in Firebase Console.';
            }
            
            onProgress?.({ 
              progress: 0, 
              stage: 'uploading', 
              error: errorMessage 
            });
            reject(new Error(errorMessage));
          },
          async () => {
            try {
              // Upload complete, get download URL
              onProgress?.({ 
                progress: 100, 
                stage: 'processing'
              });

              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Generate thumbnail
              onProgress?.({ 
                progress: 100, 
                stage: 'generating-thumbnail'
              });

              let thumbnailUrl: string | undefined;
              try {
                // Create a temporary video element to generate thumbnail
                const thumbnailDataUrl = await this.generateThumbnailFromUploadedVideo(downloadURL);
                
                if (thumbnailDataUrl) {
                  // Upload thumbnail to Storage
                  thumbnailUrl = await this.uploadThumbnail(thumbnailDataUrl, userId, timestamp);
                }
              } catch (thumbError) {
                console.warn('Could not generate thumbnail:', thumbError);
                // Continue without thumbnail
              }

              onProgress?.({ 
                progress: 100, 
                stage: 'complete', 
                url: downloadURL,
                thumbnailUrl 
              });

              resolve({ 
                url: downloadURL, 
                thumbnailUrl 
              });
            } catch (error) {
              console.error('Post-upload processing error:', error);
              reject(error);
            }
          }
        );
      } catch (error) {
        console.error('Upload initialization error:', error);
        reject(error);
      }
    });
  },

  // Generate thumbnail from uploaded video
  async generateThumbnailFromUploadedVideo(videoUrl: string): Promise<string | null> {
    try {
      return await generateThumbnailFromVideo(videoUrl, 2); // Capture at 2 seconds
    } catch (error) {
      console.warn('Thumbnail generation failed:', error);
      return null;
    }
  },

  // Upload thumbnail to Storage
  async uploadThumbnail(thumbnailDataUrl: string, userId: string, timestamp: number): Promise<string> {
    // Convert data URL to blob
    const response = await fetch(thumbnailDataUrl);
    const blob = await response.blob();
    
    // Create thumbnail filename
    const thumbnailFileName = `thumbnails/${userId}/${timestamp}_thumbnail.jpg`;
    const thumbnailRef = ref(storage, thumbnailFileName);
    
    // Upload thumbnail
    const uploadResult = await uploadBytesResumable(thumbnailRef, blob);
    return await getDownloadURL(uploadResult.ref);
  },

  // Validate video file type
  isValidVideoFile(file: File): boolean {
    const validTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/x-ms-wmv'   // .wmv
    ];
    
    return validTypes.includes(file.type);
  },

  // Get human-readable file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get video duration from file
  getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read video duration'));
      };
      
      video.src = url;
    });
  }
}; 