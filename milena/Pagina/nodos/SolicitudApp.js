document.addEventListener("DOMContentLoaded", () => {
    const usuario = requerirSesion();
    if (!usuario) return;
    prepararMenu(usuario);

    const soporteForm = document.getElementById("soporte-form");
    const aviso = document.getElementById("solicitud-aviso");

    // Datos de la cuenta: el ticket queda ligado al correo con el que se inició sesión
    document.getElementById("nombre").value = usuario.nombre || "";
    document.getElementById("correo").value = usuario.correo || "";

    // Capturar el envío del formulario de soporte
    soporteForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const formData = {
            nombre: document.getElementById("nombre").value,
            identificacion: document.getElementById("identificacion").value,
            telefono: document.getElementById("telefono").value,
            tipo_dispositivo: document.getElementById("tipo_dispositivo").value,
            descripcion: document.getElementById("descripcion").value
        };

        const submitBtn = soporteForm.querySelector("button[type='submit']");
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Registrando...";
        submitBtn.disabled = true;

        // Flujo 01 de n8n: crea el ticket y envía la confirmación por correo
        const resultado = await llamarApi("solicitudes", formData);

        if (resultado.success) {
            // El chat arranca con la descripción como primer mensaje para la IA
            escribirLocal("ticket_id", resultado.ticket_id);
            window.location.href = `chatVen.html?ticket=${encodeURIComponent(resultado.ticket_id)}`;
            return;
        }
        mostrarAviso(aviso, resultado.message || "Hubo un error al registrar la solicitud.");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
});
