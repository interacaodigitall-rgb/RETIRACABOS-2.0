import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXTY6S1QGX0R2Yk1h63rRAzagR-_6lH1M",
  authDomain: "caboses-b679f.firebaseapp.com",
  projectId: "caboses-b679f",
  storageBucket: "caboses-b679f.appspot.com",
  messagingSenderId: "206350081703",
  appId: "1:206350081703:web:5cf337f25f9f29bcd44582"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
