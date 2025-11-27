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
  
  /* --- 1. BUSCADOR MEJORADO --- */
  const searchInput = document.querySelector('.search-bar input');
  const allProducts = document.querySelectorAll('.product-card');

  // Función para quitar tildes (normalizar)
  function normalizeText(text) {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function filterProducts() {
    const searchText = normalizeText(searchInput.value.trim());

    allProducts.forEach(card => {
        const productName = normalizeText(card.querySelector('.name').innerText);
        
        // Búsqueda flexible (si incluye el texto)
        if (productName.includes(searchText)) {
            card.style.display = "flex"; 
        } else {
            card.style.display = "none";
        }
    });
  }

  // Buscar al escribir (sin necesidad de botón)
  if(searchInput) {
      searchInput.addEventListener('input', filterProducts);
  }

  /* --- 2. BOTONES AÑADIR --- */
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
    
    let imageSrc = "img/placeholder.png";
    const imgTag = card.querySelector('img');
    if(imgTag) {
        imageSrc = imgTag.getAttribute('src');
    }

    const product = { title, price, image: imageSrc, quantity: 1 };

    // Feedback Visual
    const originalText = button.innerText;
    button.innerText = "¡Añadido!";
    button.style.background = "#0b6a66"; 
    button.style.color = "white";
    button.style.borderColor = "#0b6a66";

    try {
        if (currentUser) {
            await addItemToCloudCart(product);
        } else {
            addItemToLocalStorage(product);
        }
    } catch (error) {
        console.error("Error guardando:", error);
        addItemToLocalStorage(product);
    }
    
    setTimeout(() => {
        button.innerText = "Añadir";
        button.style.background = ""; 
        button.style.color = "";
        button.style.borderColor = "";
    }, 1000);
}

function addItemToLocalStorage(product) {
    let cart = JSON.parse(localStorage.getItem('farmaciaCart')) || [];
    const existing = cart.find(item => item.title === product.title);
    if (existing) { existing.quantity += 1; } else { cart.push(product); }
    localStorage.setItem('farmaciaCart', JSON.stringify(cart));
}

async function addItemToCloudCart(product) {
    let cart = await getCartFromCloud(currentUser.uid);
    const existing = cart.find(item => item.title === product.title);
    if (existing) { existing.quantity += 1; } else { cart.push(product); }
    await saveCartToCloud(currentUser.uid, cart);
}