document.addEventListener('DOMContentLoaded', function() {
    // Añadir botón de menú móvil
    const nav = document.getElementById('nav');
    const body = document.querySelector('body');
    
    // Crear botón de menú móvil
    const menuButton = document.createElement('div');
    menuButton.className = 'mobile-menu-button';
    menuButton.innerHTML = '<i class="fa fa-bars"></i>';
    menuButton.style.display = 'none';
    
    // Añadir botón al body
    body.appendChild(menuButton);
    
    // Función para verificar el tamaño de la pantalla
    function checkScreenSize() {
        if (window.innerWidth <= 736) {
            menuButton.style.display = 'block';
        } else {
            menuButton.style.display = 'none';
            // Asegurarse de que el menú esté visible en pantallas grandes
            nav.classList.remove('mobile-active');
        }
    }
    
    // Verificar al cargar la página
    checkScreenSize();
    
    // Verificar cuando se redimensiona la ventana
    window.addEventListener('resize', checkScreenSize);
    
    // Alternar menú móvil
    menuButton.addEventListener('click', function() {
        nav.classList.toggle('mobile-active');
        
        // Cambiar ícono
        if (nav.classList.contains('mobile-active')) {
            menuButton.innerHTML = '<i class="fa fa-times"></i>';
        } else {
            menuButton.innerHTML = '<i class="fa fa-bars"></i>';
        }
    });
    
    // Cerrar menú al hacer clic en un enlace
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 736) {
                nav.classList.remove('mobile-active');
                menuButton.innerHTML = '<i class="fa fa-bars"></i>';
            }
        });
    });
});