import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXTY6S1QGX0R2Yk1h63rRAzagR-_6lH1M",
  authDomain: "caboses-b679f.firebaseapp.com",
  projectId: "caboses-b679f",
  storageBucket: "caboses-b679f.appspot.com",
  messagingSenderId: "206350081703",
  appId: "1:206350081703:web:5cf337f25f9f29bcd44582"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
    // auth and db will be undefined, the app will show an error screen.
}

export { auth, db };
