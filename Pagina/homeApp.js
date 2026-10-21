/**
 * Lógica para la ventana Home / Inicio
 */
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. Lógica del Indicador Deslizante (Menú)
    // ==========================================
    const navMenu = document.querySelector(".nav-menu");
    const navIndicator = document.querySelector(".nav-indicator");
    const navLinks = document.querySelectorAll(".nav-link");

    function moverIndicador(elemento, animado = true) {
        if (!elemento || !navIndicator || !navMenu) return;
        
        const menuRect = navMenu.getBoundingClientRect();
        const linkRect = elemento.getBoundingClientRect();

        const leftOffset = linkRect.left - menuRect.left;
        const width = linkRect.width;

        if (!animado) {
            navIndicator.style.transition = "none";
        } else {
            navIndicator.style.transition = "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease";
        }

        navIndicator.style.width = `${width}px`;
        navIndicator.style.transform = `translateX(${leftOffset}px)`;
        navIndicator.style.opacity = "1";
    }
    // Centrado e inicialización precisa tras cargar fuentes e íconos
    window.addEventListener("load", () => {
        const itemActivo = document.querySelector(".nav-link.active");
        if (itemActivo) {
            moverIndicador(itemActivo, false);
        }
    })

    // Inicializar indicador en la opción activa al cargar
    const itemActivo = document.querySelector(".nav-link.active");
    if (itemActivo) {
        // Ocultamos temporalmente la transición para el cálculo inicial instantáneo
        navIndicator.style.transition = "none";
        moverIndicador(itemActivo);
        
        // Restauramos la animación fluida después de un instante
        setTimeout(() => {
            navIndicator.style.transition = "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease";
        }, 50);
    }

    // A. Transición al hacer clic en las opciones del menú
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const urlDestino = link.getAttribute("href");

            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            moverIndicador(link);

            if (urlDestino && urlDestino !== "#" && !urlDestino.startsWith("javascript")) {
                e.preventDefault();
                setTimeout(() => {
                    window.location.href = urlDestino;
                }, 220);
            }
        });
    });

    // B. Transición cuando se presiona "Iniciar Consulta" o la tarjeta de Soporte
    // Busca los botones externos que van hacia el chat de soporte
    const botonesSoporteExternos = document.querySelectorAll('a[href="chatVen.html"]:not(.nav-link)');
    const botonNavSoporte = document.querySelector('.nav-link[href="chatVen.html"]');

    botonesSoporteExternos.forEach(boton => {
        boton.addEventListener("click", (e) => {
            e.preventDefault();
            const urlDestino = boton.getAttribute("href");

            if (botonNavSoporte) {
                // Mueve la barra superior hacia la opción de Soporte
                navLinks.forEach(l => l.classList.remove("active"));
                botonNavSoporte.classList.add("active");
                moverIndicador(botonNavSoporte);
            }

            // Redirige al chat tras la animación
            setTimeout(() => {
                window.location.href = urlDestino;
            }, 250);
        });
    });

    // Recalcular posición si se cambia el tamaño de la ventana
    window.addEventListener("resize", () => {
        const itemActual = document.querySelector(".nav-link.active");
        if (itemActual) moverIndicador(itemActual);
    });

    // ==========================================
    // 2. Lectura e Inyección del Nombre de Usuario
    // ==========================================
    let nombreUsuario = "Usuario";
    
    const userData = localStorage.getItem("user");
    const simpleUser = localStorage.getItem("nombre_usuario");

    if (userData) {
        try {
            const parsedUser = JSON.parse(userData);
            nombreUsuario = parsedUser.name || parsedUser.nombre || "Usuario";
        } catch (e) {
            console.error("Error al parsear los datos del usuario:", e);
        }
    } else if (simpleUser) {
        nombreUsuario = simpleUser;
    }

    const sidebarUserName = document.getElementById("sidebar-user-name");
    const homeUserName = document.getElementById("home-user-name");

    if (sidebarUserName) {
        sidebarUserName.textContent = nombreUsuario;
    }

    if (homeUserName) {
        const primerNombre = nombreUsuario.split(" ")[0];
        homeUserName.textContent = primerNombre;
    }
});