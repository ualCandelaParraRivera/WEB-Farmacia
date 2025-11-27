import { initAuthListener, saveCartToCloud, getCartFromCloud } from './firebase.js';

let currentUser = null;

// Al cargar la página, comprobamos quién es el usuario
initAuthListener(async (user) => {
    currentUser = user;
    // Una vez sabemos si hay usuario o no, cargamos el carrito correspondiente
    await loadCart();
});

async function loadCart() {
    let cart = [];

    if (currentUser) {
        // Cargar desde FIREBASE
        cart = await getCartFromCloud(currentUser.uid);
    } else {
        // Cargar desde LOCALSTORAGE
        cart = JSON.parse(localStorage.getItem('farmaciaCart')) || [];
    }

    renderCart(cart);
}

function renderCart(cart) {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío.<br><br><a href="productos.html" style="color:var(--teal)">Ir a productos</a></div>';
        if(subtotalEl) subtotalEl.innerText = '0.00€';
        if(totalEl) totalEl.innerText = '0.00€';
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            let imgSrc = item.image;
            if (!imgSrc.includes('img/') && !imgSrc.startsWith('http')) { imgSrc = 'img/' + imgSrc; }

            const html = `
            <div class="cart-item">
                <div class="item-info">
                    <img src="${imgSrc}" alt="${item.title}">
                    <h4>${item.title}</h4>
                </div>
                <div class="item-quantity">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                </div>
                <div class="item-price" style="text-align: right;">${itemTotal.toFixed(2)}€</div>
                <button class="remove-btn" onclick="removeItem(${index})" style="text-align: right;">&times;</button>
            </div>
            `;
            container.innerHTML += html;
        });
    }

    if(subtotalEl) subtotalEl.innerText = total.toFixed(2) + '€';
    if(totalEl) totalEl.innerText = total.toFixed(2) + '€';
}

// Hacemos las funciones globales (window) porque el HTML las llama con onclick="..."
window.updateQty = async function(index, change) {
    let cart = [];
    if (currentUser) { cart = await getCartFromCloud(currentUser.uid); } 
    else { cart = JSON.parse(localStorage.getItem('farmaciaCart')) || []; }

    cart[index].quantity += change;
    if (cart[index].quantity <= 0) { cart.splice(index, 1); }

    if (currentUser) { await saveCartToCloud(currentUser.uid, cart); } 
    else { localStorage.setItem('farmaciaCart', JSON.stringify(cart)); }
    
    loadCart(); // Recargar vista
}

window.removeItem = async function(index) {
    let cart = [];
    if (currentUser) { cart = await getCartFromCloud(currentUser.uid); } 
    else { cart = JSON.parse(localStorage.getItem('farmaciaCart')) || []; }

    cart.splice(index, 1);

    if (currentUser) { await saveCartToCloud(currentUser.uid, cart); } 
    else { localStorage.setItem('farmaciaCart', JSON.stringify(cart)); }
    
    loadCart();
}