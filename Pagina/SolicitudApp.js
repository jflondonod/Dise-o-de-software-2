document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const soporteForm = document.getElementById("soporte-form");

    // Lógica para la barra lateral
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault(); 
            navLinks.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Capturar el envío del formulario de soporte
    soporteForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Recopilar los valores de los inputs usando sus IDs
        const formData = {
            nombre: document.getElementById("nombre").value,
            identificacion: document.getElementById("identificacion").value,
            correo: document.getElementById("correo").value,
            telefono: document.getElementById("telefono").value,
            tipo_dispositivo: document.getElementById("tipo_dispositivo").value,
            descripcion: document.getElementById("descripcion").value
        };

        try {
            // Enviar los datos al servidor backend mediante una petición POST
            const response = await fetch('http://localhost:5678/webhook-test/13a4622e-0c53-424a-9121-f5f9907c604f', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const resultado = await response.json();

            if (resultado.success) {
                alert("¡Reporte enviado y guardado correctamente en la base de datos!");
                soporteForm.reset(); // Limpia el formulario
            } else {
                alert("Error al enviar el reporte: " + resultado.error);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor backend. Asegurate de que este encendido.");
        }
    });
});
