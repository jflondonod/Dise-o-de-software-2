// Servidor de la plataforma de soporte técnico.
//  - Sirve la página (carpeta public/).
//  - Reenvía las peticiones de la página a los webhooks de n8n (así el navegador
//    nunca habla directo con n8n y no hay problemas de CORS).
//  - Recibe y guarda las actas PDF que suben los técnicos (carpeta actas/).
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
// Usa /webhook (flujos activos). Para depurar en el editor de n8n usa /webhook-test.
const N8N_WEBHOOK_URL = (process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook').replace(/\/$/, '');
// Dirección pública de esta página; se usa en los enlaces de las actas que llegan por correo.
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const CARPETA_ACTAS = path.join(__dirname, 'actas');

const SERVICIOS = {
    portal: 'soporte/portal-tecnico',
    solicitudes: 'soporte/solicitudes',
    chat: 'soporte/chat',
    logistica: 'soporte/logistica',
};

fs.mkdirSync(CARPETA_ACTAS, { recursive: true });

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// Error con un mensaje que explica la causa (se muestra en la página y en esta consola).
class ErrorN8n extends Error {}

async function llamarN8n(servicio, cuerpo) {
    const url = `${N8N_WEBHOOK_URL}/${SERVICIOS[servicio]}`;
    let respuesta;
    try {
        respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cuerpo),
            signal: AbortSignal.timeout(90000),
        });
    } catch (error) {
        throw new ErrorN8n(`No se pudo conectar con n8n en ${url} (${error.cause?.code || error.message}). `
            + '¿Está abierto n8n? ¿Es esa la dirección y el puerto con que abres n8n en el navegador?');
    }
    const texto = await respuesta.text();
    if (respuesta.status === 404) {
        throw new ErrorN8n(`n8n no tiene registrado el webhook ${url}. El flujo no está activo/publicado, `
            + 'o hay un flujo viejo con la misma ruta, o la URL de n8n es distinta.');
    }
    if (!respuesta.ok) {
        throw new ErrorN8n(`El flujo de ${SERVICIOS[servicio]} falló dentro de n8n (HTTP ${respuesta.status}). `
            + `Abre n8n → Executions y mira el nodo en rojo. Respuesta: ${texto.slice(0, 300)}`);
    }
    if (!texto) {
        throw new ErrorN8n(`El flujo de ${SERVICIOS[servicio]} terminó sin responder. `
            + 'Abre n8n → Executions y revisa en qué nodo se detuvo.');
    }
    try {
        return JSON.parse(texto);
    } catch (error) {
        throw new ErrorN8n(`n8n respondió algo que no es JSON: ${texto.slice(0, 200)}`);
    }
}

// Subida de actas: solo técnicos con sesión activa, solo PDF, máximo 10 MB.
const subida = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 } });

app.post('/api/actas', subida.single('acta'), async (req, res) => {
    try {
        const ticketId = Number.parseInt(req.body.ticket_id, 10);
        if (!ticketId) {
            return res.json({ success: false, message: 'Falta el número de ticket.' });
        }
        if (!req.file || req.file.buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
            return res.json({ success: false, message: 'El archivo debe ser un PDF.' });
        }
        const sesion = await llamarN8n('portal', { accion: 'me', session_token: req.body.session_token });
        if (!sesion.success || sesion.data.rol !== 'tecnico') {
            return res.json({ success: false, status: sesion.status || 'forbidden', message: 'Solo un técnico con sesión activa puede subir actas.' });
        }
        // Nombre aleatorio: el enlace no se puede adivinar a partir del número de ticket.
        const nombre = `ticket-${ticketId}-${crypto.randomBytes(12).toString('hex')}.pdf`;
        await fs.promises.writeFile(path.join(CARPETA_ACTAS, nombre), req.file.buffer);
        res.json({ success: true, url: `${PUBLIC_URL}/actas/${nombre}` });
    } catch (error) {
        console.error('[actas]', error.message);
        res.status(502).json({ success: false, message: 'No se pudo guardar el acta. Intenta de nuevo.' });
    }
});

app.post('/api/:servicio', async (req, res) => {
    const { servicio } = req.params;
    if (!SERVICIOS[servicio]) {
        return res.status(404).json({ success: false, message: 'Servicio no encontrado.' });
    }
    try {
        res.json(await llamarN8n(servicio, req.body));
    } catch (error) {
        console.error(`[${servicio}]`, error.message);
        res.status(502).json({
            success: false,
            status: 'n8n_error',
            message: error instanceof ErrorN8n
                ? error.message
                : 'El servidor de automatización (n8n) no respondió. Revisa que esté encendido y que los flujos estén activos.',
        });
    }
});

app.use('/actas', express.static(CARPETA_ACTAS, { index: false }));
app.get('/', (req, res) => res.redirect('/loginVentana.html'));
app.use(express.static(path.join(__dirname, 'public')));

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        const message = error.code === 'LIMIT_FILE_SIZE' ? 'El PDF supera los 10 MB.' : 'Archivo no válido.';
        return res.status(400).json({ success: false, message });
    }
    next(error);
});

app.listen(PORT, () => {
    console.log(`Plataforma de soporte en ${PUBLIC_URL}`);
    console.log(`Reenviando peticiones a n8n en ${N8N_WEBHOOK_URL}`);
});
