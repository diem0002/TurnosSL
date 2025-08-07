import { auth, db } from './firebase.js';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Días de la semana
const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const todayName = DAYS[new Date().getDay()];

// Mostrar notificaciones
const showAlert = (message, type = 'success') => {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  document.body.prepend(alert);
  setTimeout(() => alert.remove(), 3000);
};

// Cargar datos del usuario y horarios
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    // Cargar datos del usuario
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      document.getElementById('userName').textContent = userDoc.data().name || 'Usuario';
      if (userDoc.data().profileImage) {
        document.getElementById('profileImage').src = userDoc.data().profileImage;
      }
    }
    
    // Cargar horarios del día
    const unsubscribe = onSnapshot(
      query(collection(db, "schedules"), where("day", "==", todayName)),
      (snapshot) => {
        const container = document.getElementById('todaySchedules');
        container.innerHTML = '';
        
        if (snapshot.empty) {
          container.innerHTML = '<p class="no-schedules">No hay clases hoy</p>';
          return;
        }
        
        // Mostrar horarios ordenados
        snapshot.docs
          .sort((a, b) => a.data().time.localeCompare(b.data().time))
          .forEach(doc => {
            const schedule = doc.data();
            const isRegistered = schedule.attendees.includes(user.uid);
            const isFull = schedule.attendees.length >= schedule.capacity;
            
            const scheduleElement = document.createElement('div');
            scheduleElement.className = `schedule-item ${isRegistered ? 'registered' : ''}`;
            scheduleElement.innerHTML = `
              <div class="schedule-info">
                <h3>${schedule.className}</h3>
                <p>Hora: ${schedule.time}</p>
                <p>Entrenador: ${schedule.trainer}</p>
                <p>Cupos: ${schedule.attendees.length}/${schedule.capacity}</p>
              </div>
              <button class="btn ${isRegistered ? 'btn-cancel' : 'btn-register'}" 
                      data-id="${doc.id}"
                      ${!isRegistered && isFull ? 'disabled' : ''}>
                ${isRegistered ? 'Cancelar' : 'Inscribirme'}
              </button>
            `;
            
            container.appendChild(scheduleElement);
          });
        
        // Configurar eventos de botones
        setupScheduleButtons(user.uid);
      },
      (error) => {
        console.error("Error en horarios:", error);
        showAlert('Error al cargar horarios', 'error');
      }
    );

    // Limpiar al salir
    window.addEventListener('beforeunload', () => unsubscribe());
    
  } catch (error) {
    console.error("Error inicial:", error);
    showAlert('Error al cargar datos', 'error');
  }
});

// Configurar botones de inscripción
function setupScheduleButtons(userId) {
  document.querySelectorAll('.btn-register, .btn-cancel').forEach(btn => {
    btn.addEventListener('click', async () => {
      const scheduleId = btn.dataset.id;
      const isRegistering = btn.classList.contains('btn-register');
      
      try {
        // Actualizar solo el campo attendees
        await updateDoc(doc(db, "schedules", scheduleId), {
          attendees: isRegistering ? arrayUnion(userId) : arrayRemove(userId)
        });
        showAlert(isRegistering ? '¡Inscripción exitosa!' : 'Inscripción cancelada');
      } catch (error) {
        console.error("Error al actualizar:", error);
        showAlert('Error: ' + error.message, 'error');
      }
    });
  });
}

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    showAlert('Error al cerrar sesión', 'error');
  }
});