import { initAuthListener, getUserProfile, getUserOrders, saveUserProfile, auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    
    initAuthListener(async (user) => {
        if (!user) {
            // Si no está logueado, fuera de aquí
            window.location.href = 'login.html';
            return;
        }
        currentUser = user;
        renderUserProfile(user);
        loadOrders(user.uid);
        loadAddressData(user.uid);
    });
});

// Mostrar datos básicos
function renderUserProfile(user) {
    document.getElementById('display-name').innerText = user.displayName || 'Usuario';
    document.getElementById('display-email').innerText = user.email;
    document.getElementById('prof-name').value = user.displayName || '';
}

// Cargar dirección guardada
async function loadAddressData(userId) {
    const profile = await getUserProfile(userId);
    if (profile) {
        if(profile.phone) document.getElementById('prof-phone').value = profile.phone;
        if(profile.address) document.getElementById('prof-address').value = profile.address;
        if(profile.city) document.getElementById('prof-city').value = profile.city;
    }
}

// Cargar Pedidos
async function loadOrders(userId) {
    const container = document.getElementById('orders-list');
    const orders = await getUserOrders(userId);

    if (orders.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">Aún no has realizado ningún pedido. <br><br> <a href="productos.html" style="color:var(--teal)">Ir a la tienda</a></div>';
        return;
    }

    container.innerHTML = ''; // Limpiar
    
    orders.forEach(order => {
        // Calcular total visualmente si no está guardado, o usar el guardado
        const total = order.total || 0; 
        const date = new Date(order.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Generar HTML de imágenes de productos
        let productsHtml = '';
        if(order.items && order.items.length > 0) {
            order.items.forEach(item => {
                let src = item.image;
                if (!src.includes('img/') && !src.startsWith('http')) src = 'img/' + src;
                productsHtml += `<img src="${src}" class="order-thumb" title="${item.title}">`;
            });
        }

        const html = `
        <div class="order-item">
            <div class="order-header-row">
                <div>
                    <span class="order-id">Pedido #${order.id.slice(0,8).toUpperCase()}</span>
                    <div style="font-size:12px; margin-top:4px;">${date}</div>
                </div>
                <span class="order-status status-completed">${order.status || 'Completado'}</span>
            </div>
            
            <div class="order-products-preview">
                ${productsHtml}
            </div>
            
            <div class="order-footer-row">
                <span>${order.items ? order.items.length : 0} artículos</span>
                <span class="order-total-price">${total.toFixed(2)}€</span>
            </div>
        </div>
        `;
        container.innerHTML += html;
    });
}

// Funciones Globales para el HTML
window.showSection = function(sectionId) {
    document.querySelectorAll('.profile-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.profile-menu-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById('section-' + sectionId).classList.add('active');
    // Activar botón correspondiente (simple hack visual)
    const btns = document.querySelectorAll('.profile-menu-btn');
    if(sectionId === 'pedidos') btns[0].classList.add('active');
    if(sectionId === 'datos') btns[1].classList.add('active');
}

window.logout = function() {
    signOut(auth).then(() => window.location.href = 'index.html');
}

window.updateUserData = async function() {
    const btn = document.querySelector('#section-datos button');
    btn.innerText = "Guardando...";
    
    const data = {
        phone: document.getElementById('prof-phone').value,
        address: document.getElementById('prof-address').value,
        city: document.getElementById('prof-city').value
    };
    
    await saveUserProfile(currentUser.uid, data);
    
    btn.innerText = "¡Guardado!";
    setTimeout(() => btn.innerText = "Guardar Cambios", 2000);
}