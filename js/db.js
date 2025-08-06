import { db } from './firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs,
    getDoc, // Añadido
    doc, 
    updateDoc, 
    deleteDoc,
    onSnapshot,
    query,
    where,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Funciones reutilizables para la base de datos
export const addSchedule = async (scheduleData) => {
    return await addDoc(collection(db, "schedules"), scheduleData);
};

export const getSchedules = async () => {
    const snapshot = await getDocs(collection(db, "schedules"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserData = async (userId) => { // Nueva función añadida
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
};

export const updateSchedule = async (id, updates) => {
    await updateDoc(doc(db, "schedules", id), updates);
};

export const deleteSchedule = async (id) => {
    await deleteDoc(doc(db, "schedules", id));
};

export const listenToSchedules = (callback) => {
    return onSnapshot(collection(db, "schedules"), (snapshot) => {
        const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(schedules);
    });
};

export const listenToTodaySchedules = (day, callback) => {
    const q = query(collection(db, "schedules"), where("day", "==", day));
    return onSnapshot(q, (snapshot) => {
        const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(schedules);
    });
};