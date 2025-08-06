import { db } from './firebase.js';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. Agregar nuevo horario
document.getElementById('addScheduleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const newSchedule = {
    day: document.getElementById('scheduleDay').value,
    time: document.getElementById('scheduleTime').value,
    className: document.getElementById('scheduleClass').value,
    capacity: parseInt(document.getElementById('scheduleCapacity').value),
    attendees: []
  };
  
  await addDoc(collection(db, "schedules"), newSchedule);
  e.target.reset();
});

// 2. Mostrar horarios existentes
onSnapshot(collection(db, "schedules"), (snapshot) => {
  const schedulesList = document.getElementById('schedulesList');
  schedulesList.innerHTML = '';
  
  snapshot.forEach((doc) => {
    const schedule = doc.data();
    const scheduleElement = document.createElement('div');
    scheduleElement.className = 'schedule-item';
    scheduleElement.innerHTML = `
      <p>Día: ${schedule.day}</p>
      <p>Hora: ${schedule.time}</p>
      <p>Clase: ${schedule.className}</p>
      <button class="btn delete-btn" data-id="${doc.id}">Eliminar</button>
    `;
    schedulesList.appendChild(scheduleElement);
  });
  
  // 3. Eliminar horarios
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteDoc(doc(db, "schedules", btn.dataset.id));
    });
  });
});