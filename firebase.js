import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Intentar obtener configuración
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

/* --- FUNCIONES PROXY (SEGURAS) --- */

export async function saveCartToCloud(userId, cart) {
    if (!db) return; // Si no hay DB, no hacemos nada (el frontend usará localStorage)
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

// Listener de Auth seguro
export function initAuthListener(callback) {
    if (auth) {
        onAuthStateChanged(auth, (user) => handleUserUI(user, callback));
    } else {
        // Si no hay Firebase, simulamos que no hay usuario logueado
        handleUserUI(null, callback);
    }
}

// Lógica de UI para Header
function handleUserUI(user, callback) {
    const userActions = document.querySelector('.user-actions');
    const cta = document.querySelector('.cta');
    
    // Limpiar mensaje anterior si existe
    const oldMsg = document.getElementById('user-welcome');
    if(oldMsg) oldMsg.remove();

    if (user) {
        if(cta) cta.style.display = 'none';
        
        const welcomeMsg = document.createElement('div');
        welcomeMsg.id = 'user-welcome';
        welcomeMsg.innerHTML = `
            <span style="color:white; font-weight:600; margin-right:10px; font-size:14px;">Hola, ${user.displayName || 'Usuario'}</span>
            <button id="logout-btn" style="background:rgba(255,255,255,0.2); border:1px solid white; color:white; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Salir</button>
        `;
        if(userActions) userActions.appendChild(welcomeMsg);
        
        document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => window.location.reload());
        
        if (callback) callback(user);
    } else {
        if(cta) cta.style.display = 'flex';
        if (callback) callback(null);
    }
}

// Exportar servicios (pueden ser null) y funciones del SDK
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile };