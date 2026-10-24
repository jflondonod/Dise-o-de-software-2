/**
 * Dashboard de administración: indicadores, lista de tickets y asignación manual.
 */
const TARJETAS = [
    ["total_tickets", "Tickets en el periodo"],
    ["resueltos_ia", "Resueltos por la IA"],
    ["tasa_resolucion_ia_pct", "% resuelto por IA", "%"],
    ["en_diagnostico", "En diagnóstico"],
    ["escalamiento_pendiente", "Esperando datos de visita"],
    ["pendientes_asignacion", "Sin técnico asignado"],
    ["escalados_nivel_2", "Escalados nivel 2"],
    ["agendados", "Visitas agendadas"],
    ["cerrados", "Cerrados por técnico"],
    ["tiempo_promedio_resolucion_horas", "Horas promedio de solución", " h"],
];
const ESTADOS_ASIGNABLES = ["Pendiente de asignación", "Escalado nivel 2", "Escalamiento pendiente"];

document.addEventListener("DOMContentLoaded", () => {
    const usuario = requerirSesion(["admin"]);
    if (!usuario) return;
    prepararMenu(usuario);

    const aviso = document.getElementById("dash-aviso");
    const tabla = document.getElementById("tabla-admin");
    const formAsignar = document.getElementById("form-asignar");
    let tecnicos = [];
    let ticketSeleccionado = null;

    document.getElementById("btn-filtrar").addEventListener("click", cargarMetricas);
    document.getElementById("f-estado").addEventListener("change", cargarTickets);
    cargarMetricas();
    cargarTickets();

    async function cargarMetricas() {
        const r = await llamarApi("portal", {
            accion: "dashboard",
            desde: document.getElementById("f-desde").value,
            hasta: document.getElementById("f-hasta").value,
        });
        if (!r.success) {
            mostrarAviso(aviso, r.message || "No se pudieron cargar los indicadores.");
            return;
        }
        const m = r.data;
        document.getElementById("metricas").innerHTML = TARJETAS.map(([clave, texto, sufijo = ""]) => `
            <div class="stat-box">
                <div>
                    <div class="stat-label">${texto}</div>
                    <div class="stat-number">${m[clave] ?? "—"}${m[clave] != null ? sufijo : ""}</div>
                </div>
            </div>`).join("");
        const canales = Object.entries(m.por_canal || {}).map(([c, n]) => `${c}: ${n}`).join(" · ");
        document.getElementById("metricas-fecha").textContent =
            `Por canal: ${canales || "—"} · Actualizado ${formatearFecha(m.actualizado_en)}`;
    }

    async function cargarTickets() {
        const r = await llamarApi("portal", { accion: "tickets_admin", estado: document.getElementById("f-estado").value });
        if (!r.success) {
            mostrarAviso(aviso, r.message || "No se pudieron cargar los tickets.");
            return;
        }
        tecnicos = r.tecnicos || [];
        const tickets = r.tickets || [];
        if (!tickets.length) {
            tabla.innerHTML = `<tr><td colspan="5" class="vacio">No hay tickets con ese filtro.</td></tr>`;
            return;
        }
        tabla.innerHTML = tickets.map((t) => `
            <tr data-id="${t.ticket_id}">
                <td>#${t.ticket_id}</td>
                <td>${escapeHtml(t.nombre_completo)}<br><small>${escapeHtml(t.canal_origen)}</small></td>
                <td class="texto-corto">${escapeHtml(t.descripcion)}</td>
                <td>${etiquetaEstado(t.estado)}</td>
                <td>${escapeHtml(t.tecnico_nombre || "—")}</td>
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
        formAsignar.hidden = true;

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
                <dt>Cliente</dt><dd>${escapeHtml(t.nombre_completo)} · ${escapeHtml(t.correo || "")}</dd>
                <dt>Teléfono</dt><dd>${escapeHtml(t.telefono || "—")}</dd>
                <dt>Dirección</dt><dd>${escapeHtml(t.direccion || "—")}</dd>
                <dt>Impacto</dt><dd>${escapeHtml(t.nivel_impacto || "—")} · ${escapeHtml(t.categoria || "")}</dd>
                <dt>Intentos IA</dt><dd>${t.intentos_ia}</dd>
                <dt>Visita</dt><dd>${formatearFecha(t.fecha_visita)} ${t.tecnico_nombre ? "· " + escapeHtml(t.tecnico_nombre) : ""}</dd>
                <dt>Acta</dt><dd>${t.url_acta ? `<a href="${escapeHtml(t.url_acta)}" target="_blank" rel="noopener">Descargar PDF</a>` : "—"}</dd>
                <dt>Problema</dt><dd>${escapeHtml(t.descripcion_problema)}</dd>
            </dl>
            <h3>Historial</h3>
            ${pintarHistorial(t.historial)}`;

        if (ESTADOS_ASIGNABLES.includes(t.estado)) {
            document.getElementById("asig-tecnico").innerHTML = tecnicos.map((te) =>
                `<option value="${te.tecnico_id}">${escapeHtml(te.nombre)} (${escapeHtml(te.cuadrante)})</option>`).join("");
            formAsignar.hidden = false;
        }
    }

    formAsignar.addEventListener("submit", async (e) => {
        e.preventDefault();
        const boton = document.getElementById("btn-asignar");
        boton.disabled = true;
        // datetime-local viene sin zona horaria: se interpreta con la hora del navegador
        const fecha = new Date(document.getElementById("asig-fecha").value);
        const r = await llamarApi("portal", {
            accion: "asignar_tecnico",
            ticket_id: ticketSeleccionado,
            tecnico_id: document.getElementById("asig-tecnico").value,
            fecha_inicio: fecha.toISOString(),
        });
        boton.disabled = false;
        mostrarAviso(aviso, r.message, r.success ? "ok" : "error");
        if (r.success) {
            formAsignar.reset();
            formAsignar.hidden = true;
            await Promise.all([cargarTickets(), cargarMetricas()]);
            mostrarDetalle(ticketSeleccionado);
        }
    });
});
