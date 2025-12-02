import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Configuración
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;

let app = null;
let auth = null;
let db = null;

// Inicialización Segura
if (firebaseConfig) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e) {
        console.error("Error inicializando Firebase (Modo Offline activo):", e);
    }
} else {
    console.log("%cModo Local Activo: Firebase no configurado.", "color: orange; font-weight: bold;");
}

/* --- FUNCIONES PROXY --- */

export async function saveCartToCloud(userId, cart) {
    if (!db) return;
    try {
        const cartRef = doc(db, 'artifacts', 'farmacia-los-llanos', 'users', userId, 'data', 'cart');
        await setDoc(cartRef, { items: cart }, { merge: true });
    } catch (e) { console.error(e); }
}

export async function getCartFromCloud(userId) {
    if (!db) return [];
    try {
        const cartRef = doc(db, 'artifacts', 'farmacia-los-llanos', 'users', userId, 'data', 'cart');
        const docSnap = await getDoc(cartRef);
        return docSnap.exists() ? docSnap.data().items || [] : [];
    } catch (e) { 
        console.error(e); 
        return []; 
    }
}

export async function saveUserProfile(userId, data) {
    if (!db) return;
    try {
        const profileRef = doc(db, 'artifacts', 'farmacia-los-llanos', 'users', userId, 'data', 'profile');
        await setDoc(profileRef, data, { merge: true });
    } catch (e) { console.error(e); }
}

export async function getUserProfile(userId) {
    if (!db) return null;
    try {
        const profileRef = doc(db, 'artifacts', 'farmacia-los-llanos', 'users', userId, 'data', 'profile');
        const docSnap = await getDoc(profileRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) { return null; }
}

// NUEVO: Guardar un pedido en el historial
export async function saveOrderToCloud(userId, orderData) {
    if (!db) return;
    try {
        // Guardamos en una subcolección 'orders' dentro del usuario
        const ordersRef = collection(db, 'artifacts', 'farmacia-los-llanos', 'users', userId, 'orders');
        // Añadimos fecha automática
        orderData.date = new Date().toISOString();
        orderData.status = 'Completado'; // Estado inicial
        await addDoc(ordersRef, orderData);
    } catch (e) { console.error("Error guardando pedido:", e); }
}

// NUEVO: Obtener historial de pedidos
export async function getUserOrders(userId) {
    if (!db) return [];
    try {
        const ordersRef = collection(db, 'artifacts', 'farmacia-los-llanos', 'users', userId, 'orders');
        const q = query(ordersRef);
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        // Ordenar por fecha (el más reciente primero)
        return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) { 
        console.error("Error leyendo pedidos:", e); 
        return [];
    }
}

// Listener de Auth
export function initAuthListener(callback) {
    if (auth) {
        onAuthStateChanged(auth, (user) => handleUserUI(user, callback));
    } else {
        handleUserUI(null, callback);
    }
}

function handleUserUI(user, callback) {
    const userActions = document.querySelector('.user-actions');
    const cta = document.querySelector('.cta');
    const oldMsg = document.getElementById('user-welcome');
    if(oldMsg) oldMsg.remove();

    if (user) {
        if(cta) cta.style.display = 'none';
        
        const welcomeMsg = document.createElement('div');
        welcomeMsg.id = 'user-welcome';
        // AHORA EL NOMBRE ES UN ENLACE A MI PERFIL
        welcomeMsg.innerHTML = `
            <a href="perfil.html" style="color:white; font-weight:600; margin-right:10px; font-size:14px; text-decoration:none; display:flex; align-items:center; gap:5px;">
                <span>👤</span> Hola, ${user.displayName || 'Usuario'}
            </a>
            <button id="logout-btn" style="background:rgba(255,255,255,0.2); border:1px solid white; color:white; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Salir</button>
        `;
        if(userActions) userActions.appendChild(welcomeMsg);
        
        document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => window.location.href = "index.html");
        
        if (callback) callback(user);
    } else {
        if(cta) cta.style.display = 'flex';
        if (callback) callback(null);
    }
}

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile };

/* FIREBASE
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuKMRyW9J3KUyjhSEh8Ov-h_m8VyUFdOg",
  authDomain: "web-farmacia-40221.firebaseapp.com",
  projectId: "web-farmacia-40221",
  storageBucket: "web-farmacia-40221.firebasestorage.app",
  messagingSenderId: "396311608032",
  appId: "1:396311608032:web:2a148cee68cecfcbe2ae85",
  measurementId: "G-B43N2DGCD0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
} */