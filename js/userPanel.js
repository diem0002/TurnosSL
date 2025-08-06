import { auth, db, storage } from './firebase.js';
import { 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getUserData } from './db.js';

// Días de la semana
const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const today = days[new Date().getDay()];

// 1. Cargar datos del usuario
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const userData = await getUserData(user.uid);
      if (userData) {
        document.getElementById('userName').textContent = userData.name || 'Usuario';
        document.getElementById('profileImage').src = userData.profileImage || 'img/default-profile.png';
      }
    } catch (error) {
      console.error("Error cargando datos de usuario:", error);
    }
  } else {
    window.location.href = 'login.html';
  }
});

// 2. Cambiar foto de perfil
document.getElementById('changeProfileBtn').addEventListener('click', () => {
  document.getElementById('profileUpload').click();
});

document.getElementById('profileUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const user = auth.currentUser;
    if (!user) return;

    const storageRef = ref(storage, `profiles/${user.uid}`);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    
    await updateDoc(doc(db, "users", user.uid), {
      profileImage: photoURL
    });
    
    document.getElementById('profileImage').src = photoURL;
  } catch (error) {
    console.error("Error al cambiar foto:", error);
  }
});

// 3. Listener de horarios con manejo de errores
const unsubscribeSchedules = onSnapshot(
  collection(db, "schedules"),
  (snapshot) => {
    const todaySchedules = document.getElementById('todaySchedules');
    todaySchedules.innerHTML = '';
    
    const user = auth.currentUser;
    if (!user) return;

    snapshot.forEach((doc) => {
      const schedule = doc.data();
      if (schedule.day === today) {
        const isRegistered = schedule.attendees?.includes(user.uid) || false;
        const scheduleElement = document.createElement('div');
        scheduleElement.className = 'schedule-item';
        scheduleElement.innerHTML = `
          <p>Hora: ${schedule.time}</p>
          <p>Clase: ${schedule.className}</p>
          <button class="btn ${isRegistered ? 'unregister-btn' : 'register-btn'}" 
                  data-id="${doc.id}">
            ${isRegistered ? 'Cancelar' : 'Registrarme'}
          </button>
        `;
        todaySchedules.appendChild(scheduleElement);
      }
    });

    // Manejar clicks después de actualizar el DOM
    setTimeout(() => {
      document.querySelectorAll('.register-btn, .unregister-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            const scheduleRef = doc(db, "schedules", btn.dataset.id);
            const isRegistered = btn.classList.contains('unregister-btn');
            
            await updateDoc(scheduleRef, {
              attendees: isRegistered ? 
                arrayRemove(user.uid) : 
                arrayUnion(user.uid)
            });
          } catch (error) {
            console.error("Error al actualizar registro:", error);
          }
        });
      });
    }, 0);
  },
  (error) => {
    console.error("Error en listener de horarios:", error);
  }
);

// 4. Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await auth.signOut();
    window.location.href = 'index.html';
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

// Limpiar listeners al salir
window.addEventListener('beforeunload', () => {
  unsubscribeSchedules();
});