document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatMessages = document.getElementById("chat-messages");

    // Lógica para la barra lateral
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault(); 
            navLinks.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Función para enviar mensaje
    function handleSendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;

        // 1. Agregar el mensaje del usuario a la interfaz
        appendUserMessage(text);
        chatInput.value = "";

        // 2. Simular respuesta de la IA después de un breve momento
        setTimeout(() => {
            appendAiResponse();
        }, 600);
    }

    // Eventos de envío (clic en botón o tecla Enter)
    sendBtn.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    });

    // Función para renderizar el mensaje del usuario
    function appendUserMessage(message) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message user-message";
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="ai-body">
                    <p>“${message}”</p>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Función para renderizar la respuesta estructurada de la IA
    function appendAiResponse() {
        const aiResponseText = `Hola. He recibido tu reporte. Basado en tu descripción, la IA ha generado 3 intentos de solución sugerida para que intentes resolverlo ahora mismo de forma remota:

OPCIÓN 1 (Intento principal de IA):
1. Desconecta el cable de alimentación de la toma de corriente y del computador. Espera 30 segundos.
2. Mantén presionado el botón de encendido durante 10 segundos.
3. Vuelve a conectar el cable y enciéndelo.

OPCIÓN 2 (Intento alternativo):
1. Si tienes un computador de escritorio, verifica que la conexión del cable de la pantalla al computador y a la corriente sea firme.
2. Si tienes un portátil, intenta conectar un monitor externo para descartar fallas en la pantalla del portátil.

OPCIÓN 3 (Intento de diagnóstico):
1. Observa si las luces indicadoras de encendido parpadean o tienen un color específico al intentar prenderlo.

¿Pudiste solucionar tu inconveniente con estas opciones?`;

        const messageDiv = document.createElement("div");
        messageDiv.className = "message ai-message";
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="ai-header">
                    <span class="ai-icon">✨</span> 
                    <span>IA:</span>
                </div>
                <div class="ai-body">
                    <p>${aiResponseText}</p>
                </div>
                <div class="chat-actions">
                    <button class="chat-btn yes">Sí, problema resuelto</button>
                    <button class="chat-btn no">No, necesito ayuda</button>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();

        // Agregar interactividad opcional a los botones generados
        const yesBtn = messageDiv.querySelector(".chat-btn.yes");
        const noBtn = messageDiv.querySelector(".chat-btn.no");

        yesBtn.addEventListener("click", () => {
            appendUserMessage("Sí, problema resuelto");
            setTimeout(() => {
                appendSimpleAiMessage("¡Excelente! Me alegra haberte ayudado. Si tienes otro inconveniente, no dudes en escribir.");
            }, 500);
        });

        noBtn.addEventListener("click", () => {
            appendUserMessage("No, necesito ayuda");
            setTimeout(() => {
                appendSimpleAiMessage("Entendido. Un asesor humano tomará tu caso en breve para brindarte asistencia adicional.");
            }, 500);
        });
    }

    function appendSimpleAiMessage(text) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message ai-message";
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="ai-header">
                    <span class="ai-icon">✨</span> 
                    <span>IA:</span>
                </div>
                <div class="ai-body">
                    <p>${text}</p>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Mantener el scroll al final del chat automáticamente
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});