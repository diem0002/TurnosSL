import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Verificar autenticación global
onAuthStateChanged(auth, (user) => {
    console.log(user ? 'Usuario autenticado' : 'Usuario no autenticado');
});

// Función global para mostrar mensajes
window.showAlert = (message, type = 'info') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.prepend(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
};