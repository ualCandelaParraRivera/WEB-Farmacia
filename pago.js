import { initAuthListener, getCartFromCloud, saveCartToCloud, saveUserProfile, getUserProfile } from './firebase.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Escuchar cambios en inputs para quitar el rojo cuando escribes
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });

    // 2. Iniciar sistema de usuarios
    initAuthListener(async (user) => {
        currentUser = user;
        await loadCheckoutData();
    });
});

async function loadCheckoutData() {
    let cart = [];
    
    if (currentUser) {
        // Si hay usuario, cargamos carrito de nube y rellenamos datos
        cart = await getCartFromCloud(currentUser.uid);
        
        // Autorrellenar formulario con datos guardados
        const profile = await getUserProfile(currentUser.uid);
        if(profile) {
            if(profile.name) document.getElementById('input-name').value = profile.name;
            // Buscamos inputs por placeholder o tipo si no tienen ID
            const addressInput = document.querySelector('input[placeholder*="Calle"]');
            if(addressInput && profile.address) addressInput.value = profile.address;
            
            const cityInput = document.querySelector('input[placeholder*="Almería"]');
            if(cityInput && profile.city) cityInput.value = profile.city;
            
            const phoneInput = document.querySelector('input[type="tel"]');
            if(phoneInput && profile.phone) phoneInput.value = profile.phone;
        }
    } else {
        // Si es invitado, cargamos de local
        cart = JSON.parse(localStorage.getItem('farmaciaCart')) || [];
    }

    // Renderizar resumen
    const itemsList = document.getElementById('checkout-items-list');
    let subtotal = 0;

    if (cart.length === 0) {
        itemsList.innerHTML = "No hay productos.";
        document.getElementById('checkout-total').innerText = "0.00€";
    } else {
        itemsList.innerHTML = "";
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            itemsList.innerHTML += `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span>${item.quantity}x ${item.title}</span>
                    <span>${itemTotal.toFixed(2)}€</span>
                </div>
            `;
        });
        document.getElementById('checkout-subtotal').innerText = subtotal.toFixed(2) + "€";
        document.getElementById('checkout-total').innerText = subtotal.toFixed(2) + "€";
    }
}

// --- FUNCIÓN DE VALIDACIÓN (RECUPERADA) ---
function validateStep(stepNumber) {
    let isValid = true;

    // PASO 1: Validar Envío
    if (stepNumber === 1) {
        const inputs = document.querySelectorAll('#step-1 input');
        inputs.forEach(input => {
            if (input.value.trim() === '') {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
    }

    // PASO 2: Validar Pago
    if (stepNumber === 2) {
        // Solo validamos el método de pago VISIBLE
        const visibleMethod = document.querySelector('.payment-details-box.visible');
        if (visibleMethod) {
            const inputs = visibleMethod.querySelectorAll('input');
            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });
        }
    }

    return isValid;
}

// --- NAVEGACIÓN ENTRE PASOS ---
window.goToStep = function(targetStep) {
    // Saber en qué paso estamos
    let currentStep = 1;
    if (document.getElementById('step-2').classList.contains('active')) currentStep = 2;
    if (document.getElementById('step-3').classList.contains('active')) currentStep = 3;

    // Si intentamos AVANZAR, validar primero
    if (targetStep > currentStep) {
        if (!validateStep(currentStep)) {
            // Si falla la validación, paramos aquí (se verán los bordes rojos)
            return; 
        }
    }

    // Cambio de paso visual
    document.querySelectorAll('.step-content').forEach(div => div.classList.remove('active'));
    document.getElementById('step-' + targetStep).classList.add('active');

    // Actualizar barra superior
    document.querySelectorAll('.step').forEach(i => i.classList.remove('active'));
    for(let i = 1; i <= targetStep; i++) {
        document.getElementById('progress-' + i).classList.add('active');
    }

    // Gestión del botón final
    const payBtn = document.getElementById('final-pay-btn');
    if(targetStep === 3) {
        payBtn.classList.remove('hidden');
        
        // Copiar nombre al resumen final para confirmar
        const nameInput = document.getElementById('input-name').value;
        if(nameInput) {
            const summaryName = document.getElementById('summary-name');
            if(summaryName) summaryName.innerText = nameInput;
        }
    } else {
        payBtn.classList.add('hidden');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SELECCIÓN DE PAGO ---
window.selectPayment = function(element, method) {
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');

    document.querySelectorAll('.payment-details-box').forEach(box => box.classList.remove('visible'));
    const selectedForm = document.getElementById('payment-' + method);
    if(selectedForm) {
        selectedForm.classList.add('visible');
    }
}

// --- PROCESAR PAGO FINAL ---
window.processPayment = function() {
    const btn = document.getElementById('final-pay-btn');
    btn.innerHTML = "Procesando...";
    btn.disabled = true;
    btn.style.opacity = "0.8";
    
    // Guardar dirección en la nube si hay usuario
    if(currentUser) {
        const addressData = {
            name: document.getElementById('input-name').value,
            address: document.querySelector('input[placeholder*="Calle"]').value,
            city: document.querySelector('input[placeholder*="Almería"]').value,
            phone: document.querySelector('input[type="tel"]').value
        };
        saveUserProfile(currentUser.uid, addressData);
    }

    setTimeout(async () => {
        alert("¡Pago realizado con éxito! Gracias por confiar en Farmacia Los Llanos.");
        
        if(currentUser) {
            await saveCartToCloud(currentUser.uid, []); // Vaciar nube
        } else {
            localStorage.removeItem('farmaciaCart'); // Vaciar local
        }
        
        window.location.href = "index.html";
    }, 2000);
}