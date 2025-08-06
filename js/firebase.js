// Importamos las herramientas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Tus credenciales de Firebase (las mismas que ya tenías)
const firebaseConfig = {
  apiKey: "AIzaSyBi6EG4QWdtu2f8U_4qFG8WrBLqUirPAwc",
  authDomain: "gym-attendance-16eea.firebaseapp.com",
  projectId: "gym-attendance-16eea",
  storageBucket: "gym-attendance-16eea.appspot.com",
  messagingSenderId: "898633432732",
  appId: "1:898633432732:web:f9ab03ccc069d533e8f759"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos los servicios que usaremos
export const auth = getAuth(app);         // Para autenticación
export const db = getFirestore(app);     // Para la base de datos
export const storage = getStorage(app);  // Para almacenar fotos