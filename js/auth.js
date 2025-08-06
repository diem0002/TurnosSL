// Importamos lo que necesitamos
import { auth, db } from './firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. REGISTRO DE USUARIO (register.html)
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtenemos los datos del formulario
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const isAdmin = document.getElementById('isAdmin').checked;

  try {
    // Creamos el usuario
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Guardamos información adicional en la base de datos
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      isAdmin: isAdmin,
      profileImage: ''
    });
    
    // Redirigimos al panel correspondiente
    window.location.href = isAdmin ? 'admin.html' : 'user.html';
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// 2. INICIO DE SESIÓN (login.html)
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Verificamos si es admin
    const userDoc = await getDoc(doc(db, "users", user.uid));
    window.location.href = userDoc.data().isAdmin ? 'admin.html' : 'user.html';
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// 3. CERRAR SESIÓN (admin.html y user.html)
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

// 4. VERIFICAR SI EL USUARIO ESTÁ LOGUEADO (todas las páginas)
onAuthStateChanged(auth, (user) => {
  const currentPage = window.location.pathname.split('/').pop();
  
  if (user) {
    // Usuario logueado
    if (['index.html', 'login.html', 'register.html'].includes(currentPage)) {
      getDoc(doc(db, "users", user.uid)).then((doc) => {
        window.location.href = doc.data().isAdmin ? 'admin.html' : 'user.html';
      });
    }
  } else {
    // Usuario no logueado
    if (!['index.html', 'login.html', 'register.html'].includes(currentPage)) {
      window.location.href = 'login.html';
    }
  }
});