#!/bin/bash

# Check Firestore index status for StreamEdit Pro
echo "🔍 Checking Firestore index status..."

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

echo "📊 Fetching index status from Firebase..."
echo ""

# Get project ID from firebase config
PROJECT_ID=$(firebase use --current 2>/dev/null | grep "Now using project" | cut -d' ' -f4 | tr -d '()')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Could not determine Firebase project ID. Make sure you're in the correct directory and have initialized Firebase."
    exit 1
fi

echo "🏗️  Project: $PROJECT_ID"
echo ""
echo "📋 Required indexes for public video visibility:"
echo "   • videos: isPublic + uploadDate"
echo "   • videos: authorId + uploadDate"
echo "   • videos: tags + uploadDate"
echo "   • annotations: videoId + createdAt"
echo ""
echo "🌐 Check index status here:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/firestore/indexes"
echo ""
echo "⏳ Index building typically takes 5-15 minutes depending on data size."
echo ""
echo "✅ Once all indexes show 'Enabled' status:"
echo "   1. Uncomment the orderBy clauses in src/services/videoService.ts"
echo "   2. Remove the manual sorting fallbacks"
echo "   3. Restart your dev server: npm run dev"
echo ""
echo "🔄 Current status: Check the Firebase Console link above for real-time status." 