document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            // Previene el comportamiento por defecto si son enlaces vacíos "#"
            // (Si tus enlaces llevan a páginas reales, puedes comentar la siguiente línea)
            e.preventDefault(); 

            // Remueve la clase 'active' de todos los enlaces
            navLinks.forEach(nav => nav.classList.remove("active"));

            // Añade la clase 'active' al enlace que se presionó
            this.classList.add("active");
        });
    });
});