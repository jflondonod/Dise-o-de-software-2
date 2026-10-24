/**
 * Portal del técnico: cola de visitas, detalle y cierre con acta PDF.
 */
document.addEventListener("DOMContentLoaded", () => {
    const usuario = requerirSesion(["tecnico"]);
    if (!usuario) return;
    prepararMenu(usuario);
    document.getElementById("tec-nombre").textContent = (usuario.nombre || "técnico").split(" ")[0];

    const tabla = document.getElementById("tabla-cola");
    const aviso = document.getElementById("tec-aviso");
    const formCierre = document.getElementById("form-cierre");
    let ticketSeleccionado = null;

    document.getElementById("btn-recargar").addEventListener("click", cargarCola);
    cargarCola();

    async function cargarCola() {
        const r = await llamarApi("portal", { accion: "cola_tecnico" });
        if (!r.success) {
            mostrarAviso(aviso, r.message || "No se pudo cargar la cola.");
            return;
        }
        const tickets = r.tickets || [];
        if (!tickets.length) {
            tabla.innerHTML = `<tr><td colspan="5" class="vacio">No tienes visitas pendientes. 🎉</td></tr>`;
            return;
        }
        tabla.innerHTML = tickets.map((t) => `
            <tr data-id="${t.ticket_id}">
                <td>#${t.ticket_id}</td>
                <td>${formatearFecha(t.fecha_visita)}</td>
                <td>${escapeHtml(t.nombre_completo)}<br><small>${escapeHtml(t.telefono || "")}</small></td>
                <td class="texto-corto">${escapeHtml(t.direccion || "—")}</td>
                <td>${etiquetaEstado(t.estado)}</td>
            </tr>`).join("");
        tabla.querySelectorAll("tr[data-id]").forEach((fila) => {
            fila.addEventListener("click", () => {
                tabla.querySelectorAll("tr").forEach((f) => f.classList.remove("seleccionado"));
                fila.classList.add("seleccionado");
                mostrarDetalle(fila.dataset.id);
            });
        });
    }

    async function mostrarDetalle(ticketId) {
        const contenido = document.getElementById("detalle-contenido");
        document.getElementById("detalle-vacio").hidden = true;
        contenido.hidden = false;
        contenido.innerHTML = `<p class="card-description">Cargando...</p>`;
        formCierre.hidden = true;

        const r = await llamarApi("portal", { accion: "detalle_ticket", ticket_id: ticketId });
        if (!r.success) {
            contenido.innerHTML = `<p class="aviso aviso-error">${escapeHtml(r.message)}</p>`;
            return;
        }
        const t = r.data;
        ticketSeleccionado = t.ticket_id;
        contenido.innerHTML = `
            <dl class="detalle-lista">
                <dt>Ticket</dt><dd>#${t.ticket_id} ${etiquetaEstado(t.estado)}</dd>
                <dt>Visita</dt><dd>${formatearFecha(t.fecha_visita)}</dd>
                <dt>Cliente</dt><dd>${escapeHtml(t.nombre_completo)}</dd>
                <dt>Contacto</dt><dd>${escapeHtml(t.telefono || "—")} · ${escapeHtml(t.correo || "")}</dd>
                <dt>Dirección</dt><dd>${escapeHtml(t.direccion || "—")}</dd>
                <dt>Dispositivo</dt><dd>${escapeHtml(t.tipo_dispositivo || "No especificado")}</dd>
                <dt>Impacto</dt><dd>${escapeHtml(t.nivel_impacto || "—")} · ${escapeHtml(t.categoria || "")}</dd>
                <dt>Problema</dt><dd>${escapeHtml(t.descripcion_problema)}</dd>
            </dl>
            <h3>Conversación con la IA</h3>
            ${pintarHistorial(t.historial)}`;
        formCierre.hidden = !["Agendado", "En atención"].includes(t.estado);
    }

    formCierre.addEventListener("submit", async (e) => {
        e.preventDefault();
        const archivo = document.getElementById("cierre-acta").files[0];
        const resultado = document.getElementById("cierre-resultado").value.trim();
        if (!archivo || !ticketSeleccionado) return;

        const boton = document.getElementById("btn-cerrar");
        boton.disabled = true;
        boton.textContent = "Subiendo acta...";

        // 1) server.js guarda el PDF y devuelve su URL; 2) n8n cierra el ticket con esa URL
        const subida = await subirActa(ticketSeleccionado, archivo);
        if (!subida.success) {
            mostrarAviso(aviso, subida.message || "No se pudo subir el acta.");
        } else {
            boton.textContent = "Cerrando ticket...";
            const cierre = await llamarApi("portal", {
                accion: "cerrar_ticket",
                ticket_id: ticketSeleccionado,
                url_acta: subida.url,
                resultado,
            });
            mostrarAviso(aviso, cierre.message, cierre.success ? "ok" : "error");
            if (cierre.success) {
                formCierre.reset();
                formCierre.hidden = true;
                document.getElementById("detalle-contenido").hidden = true;
                document.getElementById("detalle-vacio").hidden = false;
                await cargarCola();
            }
        }
        boton.disabled = false;
        boton.textContent = "Subir acta y cerrar";
    });
});
