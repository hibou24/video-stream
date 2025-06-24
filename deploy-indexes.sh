#!/bin/bash

# Deploy Firestore indexes for StreamEdit Pro
echo "Deploying Firestore indexes..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ You're not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Deploy indexes
echo "📄 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore indexes deployed successfully!"
    echo ""
    echo "📝 Available indexes:"
    echo "  • videos by authorId + uploadDate (for user videos)"
    echo "  • videos by isPublic + uploadDate (for public videos)"
    echo "  • videos by tags + uploadDate (for tag searches)"
    echo "  • annotations by videoId + createdAt (for video annotations)"
    echo ""
    echo "🔄 Note: It may take a few minutes for the indexes to be fully ready."
else
    echo "❌ Failed to deploy indexes. Please check your Firebase project configuration."
    exit 1
fi 