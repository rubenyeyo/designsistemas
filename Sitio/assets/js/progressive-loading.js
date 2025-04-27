document.addEventListener('DOMContentLoaded', function() {
    // Buscar todas las imágenes que no son iconos
    const images = document.querySelectorAll('img:not(.icon)');
    
    // Configurar lazy loading
    images.forEach(function(img) {
        // Guardar la URL original
        const src = img.src;
        
        // Establecer un marcador de posición
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        
        // Añadir clase para estilos
        img.classList.add('lazy-load');
        
        // Configurar loading="lazy" para navegadores compatibles
        img.loading = 'lazy';
        
        // Configurar la URL original como data-src
        img.dataset.src = src;
        
        // Pequeños efectos para mejor UX
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = '0';
    });
    
    // Función para cargar imágenes cuando se vuelven visibles
    const loadImages = function() {
        const lazyImages = document.querySelectorAll('img.lazy-load');
        
        lazyImages.forEach(function(img) {
            if (isElementInViewport(img)) {
                img.src = img.dataset.src;
                img.classList.remove('lazy-load');
                img.onload = function() {
                    img.style.opacity = '1';
                };
            }
        });
    };
    
    // Función para verificar si un elemento está en el viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Cargar imágenes visibles inicialmente
    loadImages();
    
    // Cargar imágenes al desplazarse
    window.addEventListener('scroll', loadImages);
    window.addEventListener('resize', loadImages);
});