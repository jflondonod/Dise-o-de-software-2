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

        const submitBtn = soporteForm.querySelector("button[type='submit']");
        const originalText = submitBtn ? submitBtn.textContent : "Enviar";
        
        if (submitBtn) {
            submitBtn.textContent = "Procesando con IA...";
            submitBtn.disabled = true;
        }

        try {
            // Enviar los datos al servidor backend mediante una petición POST
            const response = await fetch('http://localhost:5678/webhook/13a4622e-0c53-424a-9121-f5f9907c604f', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // 1. Esperar y leer el JSON que responde n8n
            const resultado = await response.json();

            // 2. Verificar que n8n respondió con éxito
            if (resultado.status === "success") {
                 // Guardamos la información necesaria para el chat
                localStorage.setItem("userDescription", formData.descripcion);
                localStorage.setItem("aiResponse", resultado.response);
    
                 
                 localStorage.setItem("ticket_id", resultado.ticket_id); 
    // Saltamos a la vista de chat
                window.location.href = "chatVen.html";
            } else {
                alert("Hubo un error al procesar el reporte en el servidor.");
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor backend. Asegúrate de que esté encendido.");
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });
});