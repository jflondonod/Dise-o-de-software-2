document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // 1. Remover la clase 'active' de todos los enlaces
            navLinks.forEach(item => item.classList.remove('active'));
            
            // 2. Añadir la clase 'active' al enlace que se acaba de hacer clic
            this.classList.add('active');
        });
    });
});