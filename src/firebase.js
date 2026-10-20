// Firebase Configuration and Service Initializer (firebase.js)
// Re-exports all initialized Firebase services, Auth methods, and Firestore connectors.
import { 
  app, 
  auth, 
  db, 
  googleProvider, 
  firebaseConfig,
  getFirebaseDomainInfo,
  testFirestoreConnection,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  firebaseSignOut,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType
} from './lib/firebase';

export { 
  app, 
  auth, 
  db, 
  googleProvider, 
  firebaseConfig,
  getFirebaseDomainInfo,
  testFirestoreConnection,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  firebaseSignOut,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType
};

export default {
  app,
  auth,
  db,
  googleProvider,
  firebaseConfig,
  getFirebaseDomainInfo
};
