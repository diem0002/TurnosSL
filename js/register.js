import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById('password').addEventListener('input', validatePassword);
document.getElementById('confirmPassword').addEventListener('input', validatePassword);

function validatePassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordError = document.getElementById('passwordError');
    const confirmError = document.getElementById('confirmError');
    const registerBtn = document.getElementById('registerBtn');

    passwordError.style.display = 'none';
    confirmError.style.display = 'none';
    document.getElementById('password').classList.remove('password-mismatch');
    document.getElementById('confirmPassword').classList.remove('password-mismatch');

    if (password.length > 0 && password.length < 6) {
        passwordError.textContent = "Mínimo 6 caracteres";
        passwordError.style.display = 'block';
        registerBtn.disabled = true;
        return;
    }

    if (confirmPassword.length > 0 && password !== confirmPassword) {
        confirmError.textContent = "Las contraseñas no coinciden";
        confirmError.style.display = 'block';
        document.getElementById('password').classList.add('password-mismatch');
        document.getElementById('confirmPassword').classList.add('password-mismatch');
        registerBtn.disabled = true;
        return;
    }

    registerBtn.disabled = false;
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const registerBtn = document.getElementById('registerBtn');
        registerBtn.disabled = true;
        registerBtn.textContent = "Registrando...";

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            isAdmin: false, // ← Valor FIJO, nadie puede auto-promocionarse
            profileImage: '',
            createdAt: new Date()
        });
        
        window.location.href = 'user.html';
    } catch (error) {
        alert("Error al registrarse: " + error.message);
        document.getElementById('registerBtn').disabled = false;
        document.getElementById('registerBtn').textContent = "Registrarse";
    }
});