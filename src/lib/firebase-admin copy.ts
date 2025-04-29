// src/lib/firebase-admin.ts

import admin from "firebase-admin";

// Check if Firebase Admin SDK has already been initialized
// This prevents re-initialization errors if the module is hot-reloaded.
if (!admin.apps.length) {
  console.log("Initializing Firebase Admin SDK.");
  // Initialize the app.
  // By default, if GOOGLE_APPLICATION_CREDENTIALS environment variable is set,
  // the SDK will automatically pick up the service account credentials from that file.
  admin.initializeApp({
    // No explicit credential needed if GOOGLE_APPLICATION_CREDENTIALS is set
    // If you needed to specify other options like databaseURL or storageBucket:
    // databaseURL: process.env.FIREBASE_DATABASE_URL,
    // storageBucket: process.env.GCP_IMAGE_BUCKET_NAME, // Example: if you set the default bucket here
  });
   console.log("Firebase Admin SDK initialized.");
} else {
  console.log("Firebase Admin SDK already initialized.");
}

// Export the initialized admin app instance and specific services
export default admin; // Export the entire admin namespace
export const adminFirestore = admin.firestore(); // Export Firestore service
export const adminStorage = admin.storage(); // Export Storage service

// We no longer export 'serviceAccount' from this file as it's used internally by initializeApp
// export const serviceAccount = { ... }; // Removed
