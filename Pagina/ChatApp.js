document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatMessages = document.getElementById("chat-messages");

    // Contador de intentos (inicia en 1 con el primer diagnóstico)
    let currentAttempt = 1;
    const maxAttempts = 3;

    // Recuperar el problema y la respuesta que trajo n8n del formulario anterior
    const initialProblem = localStorage.getItem("userDescription");
    const initialAiResponse = localStorage.getItem("aiResponse");

    if (initialProblem) {
        // 1. Pintar el reporte inicial del usuario
        appendUserMessage(initialProblem);

        // 2. Pintar la respuesta inicial con sus botones de Sí/No
        if (initialAiResponse) {
            appendAiMessageWithButtons(initialAiResponse);
        } else {
            // Plan de respaldo por si acaso no llega
            getAiResponseFromServer(initialProblem);
        }
    }

    function handleSendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;
        appendUserMessage(text);
        chatInput.value = "";

        // Si el usuario escribe un mensaje adicional en el chat
        processUserInteraction(text);
    }

    sendBtn.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSendMessage();
    });

    // Función central que procesa la interacción
    function processUserInteraction(userMessage) {
        // Si ya íbamos en el intento 3 y dio "No funcionó", disparamos el escalamiento humano
        if (currentAttempt >= maxAttempts) {
            triggerHumanEscalation();
            return;
        }

        currentAttempt++;
        getAiResponseFromServer(userMessage);
    }

    // Función para conectar con el servidor y obtener la respuesta de la IA
    async function getAiResponseFromServer(userMessage) {
        const loadingId = appendAiMessage("<i>Analizando intento " + currentAttempt + " de " + maxAttempts + " ...</i>");

        // llamar el ID del ticket y la descripción original del problema
        const currentTicketId = localStorage.getItem("ticket_id");
        const originalProblem = localStorage.getItem("userDescription"); // <--- problema inicial

        try {
            const response = await fetch('http://localhost:5678/webhook/5f2be296-d650-45a1-ba7f-f8832c1156e4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    ticket_id: currentTicketId, 
                    message: userMessage, 
                    attempt: currentAttempt,
                    descripcion_problema: originalProblem 
                })
            });

            const data = await response.json();

            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) loadingElement.remove();

            const aiText = data.response || "Aquí tienes otra alternativa para resolver tu inconveniente.";

            // ¡Corrección aquí! Permitimos que el intento 3 también muestre los botones.
            // Los botones evaluarán si el usuario logra solucionar o si rechaza la última alternativa.
            appendAiMessageWithButtons(aiText);

        } catch (error) {
            console.error("Error al obtener respuesta de la IA:", error);
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) loadingElement.remove();
            appendAiMessage("Hubo un error al conectar con el servicio de IA. Intenta de nuevo.");
        }
    }

    // Disparar escalamiento humano al agotar intentos
    function triggerHumanEscalation() {
        setTimeout(() => {
            appendAiMessage("⚠️ **Hemos agotado los 3 intentos de solución automática.** Tu caso ha sido escalado a nuestro equipo técnico humano. Nos pondremos en contacto contigo en breve.");
            chatInput.disabled = true;
            sendBtn.disabled = true;
            chatInput.placeholder = "Caso escalado a soporte humano.";
        }, 500);
    }

    function appendUserMessage(message) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message user-message";
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="ai-body">
                    <p>${escapeHtml(message)}</p>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function appendAiMessage(text) {
        const messageId = "ai-msg-" + Date.now();
        const messageDiv = document.createElement("div");
        messageDiv.className = "message ai-message";
        messageDiv.id = messageId;
        
        const formattedText = text.replace(/\n/g, '<br>');

        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="ai-header">
                    <span class="ai-icon">✨</span> 
                    <span>IA Soporte:</span>
                </div>
                <div class="ai-body">
                    <p>${formattedText}</p>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        return messageId;
    }

    // Agregar mensaje de IA con los botones interactivos de "Sí / No"
    function appendAiMessageWithButtons(text) {
        const messageId = appendAiMessage(text);
        const messageDiv = document.getElementById(messageId);

        const actionDiv = document.createElement("div");
        actionDiv.className = "chat-actions";
        actionDiv.style.marginTop = "10px";
        actionDiv.innerHTML = `
            <button class="btn-success" style="margin-right: 8px; padding: 6px 12px; cursor: pointer; background: #28a745; color: white; border: none; border-radius: 4px;"> ¡Sí solucionó!</button>
            <button class="btn-danger" style="padding: 6px 12px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 4px;"> No funcionó</button>
        `;

        messageDiv.querySelector('.message-bubble').appendChild(actionDiv);
        scrollToBottom();

        // Evento botón: Sí solucionó
        actionDiv.querySelector(".btn-success").addEventListener("click", () => {
            actionDiv.remove();
            appendUserMessage("👍 ¡Sí me solucionó el problema!");
            appendAiMessage("🎉 ¡Excelente! Me alegra mucho haberte ayudado. Este ticket se marcará como resuelto. ¡Que tengas un gran día!");
            chatInput.disabled = true;
            sendBtn.disabled = true;
            chatInput.placeholder = "Conversación finalizada con éxito.";
        });

        // Evento botón: No funcionó
        actionDiv.querySelector(".btn-danger").addEventListener("click", () => {
            actionDiv.remove();
            appendUserMessage("👎 No funcionó el método.");
            processUserInteraction("El paso anterior no funcionó, dame otra alternativa.");
        });
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '#039;' };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
});