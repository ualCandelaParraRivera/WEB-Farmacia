import { initAuthListener, saveCartToCloud, getCartFromCloud } from './firebase.js';

let currentUser = null;

// Inicialización segura
try {
    initAuthListener((user) => {
        currentUser = user;
        console.log("Usuario:", user ? user.displayName : "Invitado (Local)");
    });
} catch (e) {
    console.warn("Sistema de usuarios no disponible. Usando modo invitado.");
}

document.addEventListener('DOMContentLoaded', () => {
  /* --- BUSCADOR --- */
  const searchInput = document.querySelector('.search-bar input');
  const searchButton = document.querySelector('.search-bar button');
  const allProducts = document.querySelectorAll('.product-card');

  function filterProducts() {
    const searchText = searchInput.value.toLowerCase().trim();
    allProducts.forEach(card => {
        const productName = card.querySelector('.name').innerText.toLowerCase();
        if (productName.includes(searchText)) {
            card.style.display = "flex"; 
        } else {
            card.style.display = "none";
        }
    });
  }

  if(searchInput) searchInput.addEventListener('input', filterProducts);
  if(searchButton) searchButton.addEventListener('click', filterProducts);

  /* --- BOTONES AÑADIR --- */
  const addButtons = document.querySelectorAll('.add-btn');
  addButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });
});

async function addToCart(event) {
    const button = event.target;
    const card = button.closest('.product-card');

    const title = card.querySelector('.name').innerText;
    const priceText = card.querySelector('.price').innerText;
    const price = parseFloat(priceText.replace('€', '').replace(',', '.'));
    
    // Obtener imagen de forma segura
    let imageSrc = "img/placeholder.png";
    const imgTag = card.querySelector('img');
    if(imgTag) {
        imageSrc = imgTag.getAttribute('src'); // coge la ruta relativa exacta
    }

    const product = { title, price, image: imageSrc, quantity: 1 };

    // Feedback Visual Inmediato
    const originalText = button.innerText;
    button.innerText = "¡Añadido!";
    button.style.background = "#0b6a66"; 
    button.style.color = "white";
    button.style.borderColor = "#0b6a66";

    try {
        if (currentUser) {
            // Intentar guardar en nube
            await addItemToCloudCart(product);
        } else {
            // Guardar en local
            addItemToLocalStorage(product);
        }
    } catch (error) {
        // Si falla la nube, fallback a local
        console.error("Error guardando (fallback local):", error);
        addItemToLocalStorage(product);
    }
    
    setTimeout(() => {
        button.innerText = "Añadir"; // Restaurar texto original
        button.style.background = ""; 
        button.style.color = "";
        button.style.borderColor = "";
    }, 1000);
}

// Lógica Local
function addItemToLocalStorage(product) {
    let cart = JSON.parse(localStorage.getItem('farmaciaCart')) || [];
    const existing = cart.find(item => item.title === product.title);
    if (existing) { existing.quantity += 1; } else { cart.push(product); }
    localStorage.setItem('farmaciaCart', JSON.stringify(cart));
}

// Lógica Nube
async function addItemToCloudCart(product) {
    let cart = await getCartFromCloud(currentUser.uid);
    const existing = cart.find(item => item.title === product.title);
    if (existing) { existing.quantity += 1; } else { cart.push(product); }
    await saveCartToCloud(currentUser.uid, cart);
}