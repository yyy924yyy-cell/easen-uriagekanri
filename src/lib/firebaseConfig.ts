import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// easen-uriagekanri Firebase プロジェクトの設定値
const firebaseConfig = {
  apiKey: 'AIzaSyBhg-R7XdCuhjk0uSdQz6IbpqaTcqToX3I',
  authDomain: 'easen-uriagekanri.firebaseapp.com',
  projectId: 'easen-uriagekanri',
  storageBucket: 'easen-uriagekanri.firebasestorage.app',
  messagingSenderId: '727587317159',
  appId: '1:727587317159:web:a58bc71b207c62a7390282',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
