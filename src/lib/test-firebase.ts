// Temporary file to test Firebase configuration
import { storage, db, auth } from './firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Testing Firebase configuration...');
    console.log('📋 Firebase Config Check:', {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
    
    // Check authentication status
    console.log('🔐 Checking authentication status...');
    const user = auth.currentUser;
    console.log('👤 Current user:', {
      isAuthenticated: !!user,
      uid: user?.uid,
      email: user?.email
    });
    
    if (!user) {
      throw new Error('User is not authenticated. Please log in first.');
    }
    
    // Test Firestore connection with a simple read
    console.log('🗄️ Testing Firestore read access...');
    try {
      const testDoc = doc(db, 'test', 'connection-test');
      await getDoc(testDoc);
      console.log('✅ Firestore read access successful');
    } catch (firestoreError) {
      console.error('❌ Firestore access failed:', firestoreError);
      throw firestoreError;
    }
    
    // Test Storage connection with a simple upload
    console.log('📁 Testing Firebase Storage upload...');
    try {
      const testRef = ref(storage, `test/${user.uid}/connection-test-${Date.now()}.txt`);
      const testBlob = new Blob(['Firebase connection test'], { type: 'text/plain' });
      const uploadResult = await uploadBytes(testRef, testBlob);
      console.log('✅ Firebase Storage upload successful:', uploadResult.metadata.fullPath);
    } catch (storageError) {
      console.error('❌ Firebase Storage upload failed:', storageError);
      throw storageError;
    }
    
    return { success: true, message: 'Firebase is properly configured and accessible' };
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
};
