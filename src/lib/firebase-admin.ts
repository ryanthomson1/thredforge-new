// src/lib/firebase-admin.ts

import admin from "firebase-admin";

// Check if Firebase Admin SDK has already been initialized
if (!admin.apps.length) {
  // Get the service account key from environment variable
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firestore = admin.firestore();
