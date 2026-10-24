/**
 * Lógica para la ventana Home / Inicio (cliente)
 */
document.addEventListener("DOMContentLoaded", async () => {
    const usuario = requerirSesion(["cliente"]);
    if (!usuario) return;
    prepararMenu(usuario);

    // Nombre en el saludo
    const homeUserName = document.getElementById("home-user-name");
    if (homeUserName) {
        homeUserName.textContent = (usuario.nombre || "Usuario").split(" ")[0];
    }

    // Tarjetas de métricas con los tickets reales del cliente
    const resultado = await llamarApi("portal", { accion: "mis_tickets" });
    const sistema = document.getElementById("stat-sistema");
    if (!resultado.success) {
        if (sistema) {
            sistema.textContent = "🔴 Sin conexión";
            sistema.style.color = "#c0392b";
        }
        return;
    }
    const tickets = resultado.tickets || [];
    document.getElementById("stat-activos").textContent =
        tickets.filter((t) => !ESTADOS_FINALES.includes(t.estado)).length;
    document.getElementById("stat-resueltos").textContent =
        tickets.filter((t) => ["Resuelto IA", "Cerrado"].includes(t.estado)).length;
});
