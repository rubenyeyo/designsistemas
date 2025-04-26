// Form validation para Design Sistemas
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
      // Función para validar email
      function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      }
      
      // Función para validar teléfono (acepta formato internacional)
      function isValidPhone(phone) {
        if (!phone) return true; // Es opcional
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return phoneRegex.test(phone);
      }
      
      // Función para mostrar error
      function showError(input, message) {
        const formControl = input.parentElement;
        const errorDiv = document.createElement('div');
        
        // Eliminar mensaje de error previo si existe
        const existingError = formControl.querySelector('.error-message');
        if (existingError) {
          formControl.removeChild(existingError);
        }
        
        // Crear y añadir mensaje de error
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.3rem';
        errorDiv.innerText = message;
        
        formControl.appendChild(errorDiv);
        input.style.borderColor = '#e74c3c';
      }
      
      // Función para quitar error
      function removeError(input) {
        const formControl = input.parentElement;
        const existingError = formControl.querySelector('.error-message');
        
        if (existingError) {
          formControl.removeChild(existingError);
        }
        
        input.style.borderColor = '';
      }
      
      // Event listener para cuando se envía el formulario
      contactForm.addEventListener('submit', function(e) {
        let hasErrors = false;
        
        // Obtener valores
        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const telefono = document.getElementById('telefono');
        const servicio = document.getElementById('servicio');
        const mensaje = document.getElementById('mensaje');
        
        // Validar nombre
        if (nombre.value.trim() === '') {
          showError(nombre, 'Por favor ingrese su nombre');
          hasErrors = true;
        } else {
          removeError(nombre);
        }
        
        // Validar email
        if (email.value.trim() === '') {
          showError(email, 'Por favor ingrese su email');
          hasErrors = true;
        } else if (!isValidEmail(email.value.trim())) {
          showError(email, 'Por favor ingrese un email válido');
          hasErrors = true;
        } else {
          removeError(email);
        }
        
        // Validar teléfono (opcional pero con formato correcto si se proporciona)
        if (telefono.value.trim() !== '' && !isValidPhone(telefono.value.trim())) {
          showError(telefono, 'Por favor ingrese un teléfono válido');
          hasErrors = true;
        } else {
          removeError(telefono);
        }
        
        // Validar servicio
        if (servicio.value === '') {
          showError(servicio, 'Por favor seleccione un servicio');
          hasErrors = true;
        } else {
          removeError(servicio);
        }
        
        // Validar mensaje
        if (mensaje.value.trim() === '') {
          showError(mensaje, 'Por favor ingrese su mensaje');
          hasErrors = true;
        } else if (mensaje.value.trim().length < 20) {
          showError(mensaje, 'Su mensaje debe tener al menos 20 caracteres');
          hasErrors = true;
        } else {
          removeError(mensaje);
        }
        
        // Detener envío si hay errores
        if (hasErrors) {
          e.preventDefault();
        } else {
          // Aquí puedes añadir código para enviar por AJAX si lo prefieres
          // O simplemente dejar que el formulario se envíe normalmente
          
          // Opcional: Mostrar mensaje de envío
          const submitBtn = contactForm.querySelector('input[type="submit"]');
          submitBtn.value = 'Enviando...';
          submitBtn.disabled = true;
        }
      });
      
      // Opcional: Validación en tiempo real
      const inputs = contactForm.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          // Validar específicamente según el campo
          switch(this.id) {
            case 'nombre':
              if (this.value.trim() === '') {
                showError(this, 'Por favor ingrese su nombre');
              } else {
                removeError(this);
              }
              break;
            case 'email':
              if (this.value.trim() === '') {
                showError(this, 'Por favor ingrese su email');
              } else if (!isValidEmail(this.value.trim())) {
                showError(this, 'Por favor ingrese un email válido');
              } else {
                removeError(this);
              }
              break;
            case 'telefono':
              if (this.value.trim() !== '' && !isValidPhone(this.value.trim())) {
                showError(this, 'Por favor ingrese un teléfono válido');
              } else {
                removeError(this);
              }
              break;
            case 'servicio':
              if (this.value === '') {
                showError(this, 'Por favor seleccione un servicio');
              } else {
                removeError(this);
              }
              break;
            case 'mensaje':
              if (this.value.trim() === '') {
                showError(this, 'Por favor ingrese su mensaje');
              } else if (this.value.trim().length < 20) {
                showError(this, 'Su mensaje debe tener al menos 20 caracteres');
              } else {
                removeError(this);
              }
              break;
          }
        });
      });
    }
  });