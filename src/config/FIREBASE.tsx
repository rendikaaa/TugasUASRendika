import {initializeApp, FirebaseApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
// import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA-vFK0o21-RbOyilr9Zg1eRNzgcFqs49Y',
  authDomain: 'tugasakhiruasppm.firebaseapp.com',
  projectId: 'tugasakhiruasppm',
  storageBucket: 'tugasakhiruasppm.firebasestorage.app',
  messagingSenderId: '661501948509',
  appId: '1:661501948509:web:1a4520753f150860ced3b4',
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
export const firestore = getFirestore(app);
