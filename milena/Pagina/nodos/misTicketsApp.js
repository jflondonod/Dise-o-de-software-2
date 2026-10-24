/**
 * Ventana "Mis tickets" (cliente): lista y detalle con historial.
 */
document.addEventListener("DOMContentLoaded", async () => {
    const usuario = requerirSesion();
    if (!usuario) return;
    prepararMenu(usuario);

    const tabla = document.getElementById("tabla-tickets");
    const aviso = document.getElementById("tickets-aviso");

    const resultado = await llamarApi("portal", { accion: "mis_tickets" });
    if (!resultado.success) {
        mostrarAviso(aviso, resultado.message || "No se pudieron cargar los tickets.");
        tabla.innerHTML = `<tr><td colspan="4" class="vacio">Sin datos</td></tr>`;
        return;
    }

    const tickets = resultado.tickets || [];
    if (!tickets.length) {
        tabla.innerHTML = `<tr><td colspan="4" class="vacio">Aún no tienes solicitudes. <a href="VenSolicitud.html">Crea la primera</a>.</td></tr>`;
        return;
    }

    tabla.innerHTML = tickets.map((t) => `
        <tr data-id="${t.ticket_id}">
            <td>#${t.ticket_id}</td>
            <td class="texto-corto">${escapeHtml(t.descripcion)}</td>
            <td>${etiquetaEstado(t.estado)}</td>
            <td>${formatearFecha(t.fecha_creacion, false)}</td>
        </tr>`).join("");

    tabla.querySelectorAll("tr[data-id]").forEach((fila) => {
        fila.addEventListener("click", () => {
            tabla.querySelectorAll("tr").forEach((f) => f.classList.remove("seleccionado"));
            fila.classList.add("seleccionado");
            mostrarDetalle(fila.dataset.id);
        });
    });

    const pedido = new URLSearchParams(window.location.search).get("ticket");
    if (pedido) tabla.querySelector(`tr[data-id="${CSS.escape(pedido)}"]`)?.click();

    async function mostrarDetalle(ticketId) {
        const contenido = document.getElementById("detalle-contenido");
        document.getElementById("detalle-vacio").hidden = true;
        contenido.hidden = false;
        contenido.innerHTML = `<p class="card-description">Cargando...</p>`;

        const r = await llamarApi("portal", { accion: "detalle_ticket", ticket_id: ticketId });
        if (!r.success) {
            contenido.innerHTML = `<p class="aviso aviso-error">${escapeHtml(r.message)}</p>`;
            return;
        }
        const t = r.data;
        const enChat = ["Pendiente", "En diagnóstico", "Escalamiento pendiente"].includes(t.estado);
        contenido.innerHTML = `
            <dl class="detalle-lista">
                <dt>Ticket</dt><dd>#${t.ticket_id} ${etiquetaEstado(t.estado)}</dd>
                <dt>Dispositivo</dt><dd>${escapeHtml(t.tipo_dispositivo || "No especificado")}</dd>
                <dt>Problema</dt><dd>${escapeHtml(t.descripcion_problema)}</dd>
                <dt>Creado</dt><dd>${formatearFecha(t.fecha_creacion)}</dd>
                <dt>Visita</dt><dd>${formatearFecha(t.fecha_visita)}</dd>
                <dt>Técnico</dt><dd>${escapeHtml(t.tecnico_nombre || "—")}</dd>
                <dt>Cierre</dt><dd>${formatearFecha(t.fecha_cierre)}</dd>
                <dt>Acta</dt><dd>${t.url_acta ? `<a href="${escapeHtml(t.url_acta)}" target="_blank" rel="noopener">Descargar PDF</a>` : "—"}</dd>
            </dl>
            ${enChat ? `<p><a class="btn" href="chatVen.html?ticket=${t.ticket_id}" style="text-decoration:none;display:inline-block;">Continuar en el chat</a></p>` : ""}
            <h3>Historial</h3>
            ${pintarHistorial(t.historial)}`;
    }
});

