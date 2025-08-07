import { auth, db } from './firebase.js';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  getDoc,
  updateDoc,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Orden de días
const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Verificar admin
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || !userDoc.data().isAdmin) {
        window.location.href = 'user.html';
      } else {
        document.getElementById('adminName').textContent = userDoc.data().name || 'Admin';
      }
    } catch (error) {
      console.error("Error verificando admin:", error);
      showAlert('Error de permisos', 'error');
    }
  } else {
    window.location.href = 'login.html';
  }
});

// Cargar nombres de usuarios (solo para admins)
const loadUserNames = async (uids) => {
  const users = [];
  for (const uid of uids) {
    try {
      // Verificar que el usuario actual es admin
      const currentUser = auth.currentUser;
      const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
      
      if (currentUserDoc.exists() && currentUserDoc.data().isAdmin) {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          users.push({
            uid,
            name: userDoc.data().name,
            email: userDoc.data().email
          });
        }
      }
    } catch (error) {
      console.error(`Error cargando usuario ${uid}:`, error);
    }
  }
  return users;
};

// Renderizar horarios
const renderSchedules = async (schedules) => {
  const schedulesList = document.getElementById('schedulesList');
  schedulesList.innerHTML = '';

  // Agrupar por día en orden fijo
  for (const day of DAYS_ORDER) {
    const daySchedules = schedules.filter(s => s.day === day);
    if (daySchedules.length === 0) continue;

    const daySection = document.createElement('div');
    daySection.className = 'day-section';
    daySection.innerHTML = `<h3>${day}</h3>`;
    
    const schedulesContainer = document.createElement('div');
    schedulesContainer.className = 'day-schedules';

    for (const schedule of daySchedules.sort((a, b) => a.time.localeCompare(b.time))) {
      const attendeesInfo = await loadUserNames(schedule.attendees);
      
      const scheduleElement = document.createElement('div');
      scheduleElement.className = 'schedule-item';
      scheduleElement.innerHTML = `
        <div class="schedule-info">
          <h4>${schedule.className} - ${schedule.time}</h4>
          <p>Entrenador: ${schedule.trainer}</p>
          <p>Inscritos: ${schedule.attendees.length}/${schedule.capacity}</p>
          
          ${attendeesInfo.length > 0 ? `
            <div class="attendees">
              <h5>Alumnos:</h5>
              <ul>
                ${attendeesInfo.map(user => `
                  <li>
                    ${user.name} (${user.email})
                    <button class="btn-remove" data-schedule="${schedule.id}" data-uid="${user.uid}">
                      Quitar
                    </button>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        <button class="btn-delete" data-id="${schedule.id}">Eliminar</button>
      `;
      
      schedulesContainer.appendChild(scheduleElement);
    }

    daySection.appendChild(schedulesContainer);
    schedulesList.appendChild(daySection);
  }

  // Configurar eventos
  setupScheduleButtons();
};

// Configurar botones
const setupScheduleButtons = () => {
  // Botones eliminar
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este horario?')) {
        try {
          await deleteDoc(doc(db, "schedules", btn.dataset.id));
          showAlert('Horario eliminado');
        } catch (error) {
          console.error("Error eliminando:", error);
          showAlert('Error al eliminar', 'error');
        }
      }
    });
  });

  // Botones quitar alumno
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { schedule, uid } = btn.dataset;
      if (confirm('¿Quitar a este alumno?')) {
        try {
          await updateDoc(doc(db, "schedules", schedule), {
            attendees: arrayRemove(uid)
          });
          showAlert('Alumno removido');
        } catch (error) {
          console.error("Error quitando alumno:", error);
          showAlert('Error al quitar alumno', 'error');
        }
      }
    });
  });
};

// Listener principal
const unsubscribe = onSnapshot(collection(db, "schedules"), async (snapshot) => {
  try {
    const schedules = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    await renderSchedules(schedules);
  } catch (error) {
    console.error("Error en listener:", error);
    showAlert('Error cargando horarios', 'error');
  }
});

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error("Error cerrando sesión:", error);
    showAlert('Error al cerrar sesión', 'error');
  }
});

// Limpieza
window.addEventListener('beforeunload', () => {
  unsubscribe();
});

// Notificaciones
function showAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  document.body.prepend(alert);
  setTimeout(() => alert.remove(), 3000);
}