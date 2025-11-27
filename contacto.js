document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('form');
    
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validación visual simple
            const inputs = contactForm.querySelectorAll('input, textarea');
            let valid = true;
            
            inputs.forEach(input => {
                if(!input.value.trim()) {
                    valid = false;
                    input.style.borderColor = '#ef4444'; // Rojo de error
                } else {
                    input.style.borderColor = '#c0d9fa'; // Azul original
                }
            });

            if(valid) {
                const btn = contactForm.querySelector('button');
                const originalText = btn.innerText;
                
                // Simular envío
                btn.innerText = "ENVIANDO...";
                btn.disabled = true;
                btn.style.opacity = "0.7";
                
                setTimeout(() => {
                    alert("¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.");
                    contactForm.reset(); // Limpiar formulario
                    
                    btn.innerText = "MENSAJE ENVIADO";
                    btn.style.backgroundColor = "#10b981"; // Verde éxito
                    btn.style.opacity = "1";
                    
                    // Volver al estado original después de 2 segundos
                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                        btn.style.backgroundColor = ""; // Volver al color CSS
                    }, 2000);
                }, 1500);
            } else {
                alert("Por favor, rellena todos los campos marcados en rojo.");
            }
        });
        
        // Quitar rojo al escribir
        contactForm.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                input.style.borderColor = '#c0d9fa';
            });
        });
    }
});