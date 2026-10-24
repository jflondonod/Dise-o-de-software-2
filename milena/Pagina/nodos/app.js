/**
 * Utilidades compartidas por todas las ventanas: sesión, llamadas a la API,
 * menú superior y formato de datos.
 */
const API_URL = '/api';
const PAGINA_POR_ROL = {
    cliente: 'homeVentana.html',
    tecnico: 'tecnicoVentana.html',
    admin: 'dashboardVentana.html',
};
const ESTADOS_FINALES = ['Cerrado', 'Resuelto IA', 'Cancelado'];

// ==========================================
// Sesión (guardada en el navegador)
// ==========================================
function leerLocal(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
}
function escribirLocal(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
}
function borrarLocal(clave) {
    try { localStorage.removeItem(clave); } catch (e) { /* sin almacenamiento */ }
}

const Sesion = {
    token() {
        return leerLocal('session_token');
    },
    usuario() {
        try { return JSON.parse(leerLocal('user')); } catch (e) { return null; }
    },
    guardar(token, usuario) {
        escribirLocal('session_token', token);
        escribirLocal('user', JSON.stringify(usuario));
    },
    cerrar() {
        ['session_token', 'user', 'ticket_id'].forEach(borrarLocal);
    },
};

// ==========================================
// Llamadas al servidor (server.js las reenvía a n8n)
// ==========================================
async function llamarApi(servicio, datos = {}) {
    const cuerpo = { ...datos };
    const token = Sesion.token();
    if (token) cuerpo.session_token = token;

    let resultado;
    try {
        const respuesta = await fetch(`${API_URL}/${servicio}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cuerpo),
        });
        resultado = await respuesta.json();
    } catch (error) {
        console.error('Error de conexión:', error);
        return { success: false, status: 'network', message: 'No se pudo conectar con el servidor. Revisa que server.js y n8n estén encendidos.' };
    }

    if (resultado.status === 'unauthorized' && token) {
        Sesion.cerrar();
        window.location.href = 'loginVentana.html?expirada=1';
    }
    return resultado;
}

async function subirActa(ticketId, archivo) {
    const datos = new FormData();
    datos.append('session_token', Sesion.token() || '');
    datos.append('ticket_id', ticketId);
    datos.append('acta', archivo);
    try {
        const respuesta = await fetch(`${API_URL}/actas`, { method: 'POST', body: datos });
        return await respuesta.json();
    } catch (error) {
        return { success: false, message: 'No se pudo subir el archivo.' };
    }
}

// Redirige al login si no hay sesión, o a la página del rol si no tiene permiso.
function requerirSesion(rolesPermitidos) {
    const usuario = Sesion.usuario();
    if (!Sesion.token() || !usuario) {
        window.location.replace('loginVentana.html');
        return null;
    }
    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
        window.location.replace(PAGINA_POR_ROL[usuario.rol] || 'loginVentana.html');
        return null;
    }
    return usuario;
}

async function cerrarSesion() {
    await llamarApi('portal', { accion: 'logout' });
    Sesion.cerrar();
    window.location.href = 'loginVentana.html';
}

// ==========================================
// Menú superior: enlaces según el rol, nombre, salir e indicador animado
// ==========================================
function prepararMenu(usuario) {
    const inicio = document.querySelector('[data-nav="inicio"]');
    if (inicio) inicio.href = PAGINA_POR_ROL[usuario.rol] || 'homeVentana.html';

    const panel = document.querySelector('[data-nav="dashboard"]');
    if (panel) {
        const destino = { admin: 'dashboardVentana.html', tecnico: 'tecnicoVentana.html', cliente: 'misTickets.html' };
        const textos = { admin: 'Dashboard', tecnico: 'Mis visitas', cliente: 'Mis tickets' };
        panel.href = destino[usuario.rol];
        const icono = panel.querySelector('img');
        panel.textContent = ' ' + textos[usuario.rol];
        if (icono) panel.prepend(icono);
    }

    document.querySelectorAll('.user-name').forEach((el) => { el.textContent = usuario.nombre || 'Usuario'; });

    const pie = document.querySelector('.sidebar-footer');
    if (pie && !pie.querySelector('.btn-logout')) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-logout';
        boton.textContent = 'Salir';
        boton.addEventListener('click', cerrarSesion);
        pie.appendChild(boton);
    }
    iniciarIndicadorMenu();
}

function iniciarIndicadorMenu() {
    const menu = document.querySelector('.nav-menu');
    const indicador = document.querySelector('.nav-indicator');
    const enlaces = document.querySelectorAll('.nav-link');
    if (!menu) return;

    const transicion = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
    function mover(elemento, animado = true) {
        if (!elemento || !indicador) return;
        const rMenu = menu.getBoundingClientRect();
        const rEnlace = elemento.getBoundingClientRect();
        indicador.style.transition = animado ? transicion : 'none';
        indicador.style.width = `${rEnlace.width}px`;
        indicador.style.transform = `translateX(${rEnlace.left - rMenu.left}px)`;
        indicador.style.opacity = '1';
    }

    const activo = () => document.querySelector('.nav-link.active');
    mover(activo(), false);
    window.addEventListener('load', () => mover(activo(), false));
    window.addEventListener('resize', () => mover(activo(), false));

    enlaces.forEach((enlace) => {
        enlace.addEventListener('click', (e) => {
            const destino = enlace.getAttribute('href');
            if (!destino || destino === '#') {
                e.preventDefault();
                return;
            }
            e.preventDefault();
            enlaces.forEach((l) => l.classList.remove('active'));
            enlace.classList.add('active');
            mover(enlace);
            setTimeout(() => { window.location.href = destino; }, 220);
        });
    });
}

// ==========================================
// Formato
// ==========================================
function escapeHtml(texto) {
    const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(texto ?? '').replace(/[&<>"']/g, (c) => mapa[c]);
}

// Texto de la IA: se escapa y se permite **negrita** y saltos de línea.
function formatearTextoIA(texto) {
    return escapeHtml(texto).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

function formatearFecha(fecha, conHora = true) {
    if (!fecha) return '—';
    const opciones = conHora ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' };
    return new Date(fecha).toLocaleString('es-CO', { timeZone: 'America/Bogota', ...opciones });
}

function claseEstado(estado) {
    if (ESTADOS_FINALES.includes(estado)) return 'estado-final';
    if (['Escalamiento pendiente', 'Escalado nivel 2', 'Pendiente de asignación'].includes(estado)) return 'estado-alerta';
    if (['Agendado', 'En atención'].includes(estado)) return 'estado-agenda';
    return 'estado-activo';
}

function etiquetaEstado(estado) {
    return `<span class="badge-estado ${claseEstado(estado)}">${escapeHtml(estado || '—')}</span>`;
}

// Historial del chat de un ticket (detalle_ticket)
function pintarHistorial(historial) {
    if (!historial || !historial.length) return `<p class="card-description">Sin mensajes.</p>`;
    const nombres = { usuario: "Cliente", IA: "Asistente IA", sistema: "Sistema" };
    return `<ul class="historial">${historial.map((h) => `
        <li class="emisor-${escapeHtml(h.emisor)}">
            <span class="quien">${escapeHtml(nombres[h.emisor] || h.emisor)} · ${formatearFecha(h.fecha)}</span>
            ${formatearTextoIA(h.mensaje)}
        </li>`).join("")}</ul>`;
}

function mostrarAviso(elemento, mensaje, tipo = 'error') {
    if (!elemento) { alert(mensaje); return; }
    elemento.textContent = mensaje;
    elemento.className = `aviso aviso-${tipo}`;
    elemento.hidden = !mensaje;
}
