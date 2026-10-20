document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatMessages = document.getElementById("chat-messages");
    const welcomeScreen = document.getElementById("welcome-screen");
    const escalationFormContainer = document.getElementById("escalation-form-container");
    const humanEscalationForm = document.getElementById("human-escalation-form");

    // Contador de intentos
    let currentAttempt = 0;
    const maxAttempts = 3;

    // Gestionar o inicializar un ticket_id único en localStorage
    let currentTicketId = localStorage.getItem("ticket_id");
    if (!currentTicketId) {
        currentTicketId = "tkt-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
        localStorage.setItem("ticket_id", currentTicketId);
    }

    function handleSendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;
        
        // Ocultar la pantalla de bienvenida centrada y mostrar los mensajes en la primera interacción
        if (welcomeScreen && welcomeScreen.style.display !== "none") {
            welcomeScreen.style.display = "none";
            chatMessages.style.display = "flex";
        }

        appendUserMessage(text);
        chatInput.value = "";

        // Procesar la interacción con el servidor
        processUserInteraction(text);
    }

    sendBtn.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSendMessage();
    });

    // Función central que procesa la interacción
    function processUserInteraction(userMessage) {
        if (currentAttempt >= maxAttempts) {
            triggerHumanEscalation();
            return;
        }

        currentAttempt++;
        getAiResponseFromServer(userMessage);
    }

    // Función para conectar con el servidor y obtener la respuesta de la IA
   async function getAiResponseFromServer(userMessage) {
    // Generar indicador de carga con animación de puntos
    const loadingId = appendAiMessage(`
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `);

    try {
        const response = await fetch('http://localhost:5678/webhook-test/7e1a991c-9eb0-4370-8d92-7ad54ebcf18d       ', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ticket_id: currentTicketId, 
                message: userMessage, 
                attempt: currentAttempt,
                descripcion_problema: userMessage 
            })
        });

        const data = await response.json();

        // Remover el indicador de carga animado
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        const aiText = data.response || "Aquí tienes una alternativa para resolver tu inconveniente.";

        if (currentAttempt >= maxAttempts) {
            appendAiMessage(aiText);
            triggerHumanEscalation();
        } else {
            appendAiMessageWithButtons(aiText);
        }

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
            appendAiMessage("⚠️ **Hemos agotado los 3 intentos de solución automática.** Por favor completa tus datos en el formulario inferior para derivar tu caso con un técnico humano.");
            
            // Bloquear entrada de chat
            chatInput.disabled = true;
            sendBtn.disabled = true;
            chatInput.placeholder = "Chat finalizado - Requiere datos de soporte.";

            // Mostrar el formulario de escalamiento si existe en el DOM
            if (escalationFormContainer) {
                escalationFormContainer.style.display = "block";
                escalationFormContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    }

    // Evento de envío del formulario de datos humanos hacia n8n
    if (humanEscalationForm) {
        humanEscalationForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const clientData = {
                ticket_id: currentTicketId,
                nombre: document.getElementById("esc-name").value,
                email: document.getElementById("esc-email").value,
                telefono: document.getElementById("esc-phone").value,
                estado: "escalado_humano"
            };

            try {
                await fetch('http://localhost:5678/webhook/5f2be296-d650-45a1-ba7f-f8832c1156e4', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientData)
                });

                escalationFormContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #21633c;">
                        <h3 style="margin-top: 0;">✅ ¡Datos enviados con éxito!</h3>
                        <p style="margin-bottom: 0;">Tu caso ha sido transferido a nuestro equipo técnico. Te contactaremos muy pronto.</p>
                    </div>
                `;
            } catch (error) {
                console.error("Error al enviar datos de escalamiento:", error);
                alert("Hubo un error al enviar tus datos. Inténtalo de nuevo.");
            }
        });
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
            <button class="btn-success" style="margin-right: 8px; padding: 6px 12px; cursor: pointer; background: #28a745; color: white; border: none; border-radius: 4px;">¡Sí solucionó!</button>
            <button class="btn-danger" style="padding: 6px 12px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 4px;">No funcionó</button>
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
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '#039;' };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
});