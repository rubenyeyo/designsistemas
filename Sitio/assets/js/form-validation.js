// Validación mejorada del formulario de contacto
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
            const errorElement = document.getElementById(input.id + '-error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            input.classList.add('error-input');
        }
        
        // Función para quitar error
        function removeError(input) {
            const errorElement = document.getElementById(input.id + '-error');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            input.classList.remove('error-input');
        }
        
        // Función para mostrar estado del formulario
        function showFormStatus(isSuccess, messages = []) {
            const formStatus = document.getElementById('form-status');
            const formSuccess = document.getElementById('form-success');
            const formError = document.getElementById('form-error');
            const errorList = document.getElementById('error-list');
            
            // Limpiar errores anteriores
            errorList.innerHTML = '';
            
            if (isSuccess) {
                formError.style.display = 'none';
                formSuccess.style.display = 'block';
            } else {
                formSuccess.style.display = 'none';
                formError.style.display = 'block';
                
                // Mostrar mensajes de error
                messages.forEach(message => {
                    const li = document.createElement('li');
                    li.textContent = message;
                    errorList.appendChild(li);
                });
            }
            
            formStatus.style.display = 'block';
            
            // Desplazar a la parte superior del formulario
            formStatus.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Función para validar el formulario
        function validateForm() {
            let isValid = true;
            const errorMessages = [];
            
            // Validar nombre
            const nombre = document.getElementById('nombre');
            if (nombre.value.trim() === '') {
                showError(nombre, 'Por favor ingrese su nombre');
                errorMessages.push('El nombre es obligatorio');
                isValid = false;
            } else {
                removeError(nombre);
            }
            
            // Validar email
            const email = document.getElementById('email');
            if (email.value.trim() === '') {
                showError(email, 'Por favor ingrese su email');
                errorMessages.push('El email es obligatorio');
                isValid = false;
            } else if (!isValidEmail(email.value.trim())) {
                showError(email, 'Por favor ingrese un email válido');
                errorMessages.push('El formato del email es inválido');
                isValid = false;
            } else {
                removeError(email);
            }
            
            // Validar teléfono (opcional)
            const telefono = document.getElementById('telefono');
            if (telefono.value.trim() !== '' && !isValidPhone(telefono.value.trim())) {
                showError(telefono, 'Por favor ingrese un teléfono válido');
                errorMessages.push('El formato del teléfono es inválido');
                isValid = false;
            } else {
                removeError(telefono);
            }
            
            // Validar servicio
            const servicio = document.getElementById('servicio');
            if (servicio.value === '') {
                showError(servicio, 'Por favor seleccione un servicio');
                errorMessages.push('Debe seleccionar un servicio');
                isValid = false;
            } else {
                removeError(servicio);
            }
            
            // Validar mensaje
            const mensaje = document.getElementById('mensaje');
            if (mensaje.value.trim() === '') {
                showError(mensaje, 'Por favor ingrese su mensaje');
                errorMessages.push('El mensaje es obligatorio');
                isValid = false;
            } else if (mensaje.value.trim().length < 10) {
                showError(mensaje, 'Su mensaje debe tener al menos 10 caracteres');
                errorMessages.push('El mensaje es demasiado corto');
                isValid = false;
            } else {
                removeError(mensaje);
            }
            
            // Validar reCAPTCHA si está presente
            if (typeof grecaptcha !== 'undefined') {
                const recaptchaResponse = grecaptcha.getResponse();
                if (recaptchaResponse.length === 0) {
                    document.getElementById('recaptcha-error').textContent = 'Por favor, verifica que no eres un robot';
                    document.getElementById('recaptcha-error').style.display = 'block';
                    errorMessages.push('Debe completar el captcha');
                    isValid = false;
                } else {
                    document.getElementById('recaptcha-error').style.display = 'none';
                }
            }
            
            return { isValid, errorMessages };
        }
        
        // Event listener para cuando se envía el formulario
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Desactivar el botón de envío para evitar múltiples envíos
            const submitButton = contactForm.querySelector('.submit-button');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Enviando...';
            
            // Validar formulario
            const { isValid, errorMessages } = validateForm();
            
            if (!isValid) {
                // Reactivar el botón si hay errores
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                showFormStatus(false, errorMessages);
                return;
            }
            
            // Si el formulario es válido, enviar por AJAX
            const formData = new FormData(contactForm);
            
            fetch(contactForm.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Éxito
                    showFormStatus(true);
                    contactForm.reset();
                    
                    // Ocultar el formulario y mostrar solo el mensaje de éxito
                    contactForm.style.display = 'none';
                    
                    // Resetear reCAPTCHA si está presente
                    if (typeof grecaptcha !== 'undefined') {
                        grecaptcha.reset();
                    }
                } else {
                    // Error
                    showFormStatus(false, data.errores);
                }
            })
            .catch(error => {
                // Error en la solicitud
                console.error('Error:', error);
                showFormStatus(false, ['Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo más tarde.']);
            })
            .finally(() => {
                // Reactivar el botón de envío
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });
        });
        
        // Validación en tiempo real
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                // Validación específica para cada campo
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
                        } else if (this.value.trim().length < 10) {
                            showError(this, 'Su mensaje debe tener al menos 10 caracteres');
                        } else {
                            removeError(this);
                        }
                        break;
                }
            });
        });
        
        // Reset del formulario
        contactForm.querySelector('.reset-button').addEventListener('click', function() {
            // Eliminar todos los mensajes de error
            document.querySelectorAll('.field-error').forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            
            // Eliminar clases de error de los inputs
            inputs.forEach(input => {
                input.classList.remove('error-input');
            });
            
            // Ocultar mensajes de estado
            document.getElementById('form-status').style.display = 'none';
            
            // Resetear reCAPTCHA si está presente
            if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
            }
        });
    }
});