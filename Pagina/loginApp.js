// URL de tu Webhook en n8n (Asegúrate de cambiarla por la URL activa de tu nodo Webhook en n8n)
const WEBHOOK_URL = 'http://localhost:5678/webhook-test/e7762214-306c-4532-8bd0-c89198155be4';

function switchAuthTab(view, direction = 'forward') {
    const tabsContainer = document.getElementById('authTabs');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const formForgot = document.getElementById('form-forgot');
    const tabBtns = tabsContainer.querySelectorAll('.nav-tab-btn');

    // Remover clases de animación previa
    [formLogin, formRegister, formForgot].forEach(form => {
        form.classList.remove('active-form', 'reverse');
        form.classList.add('hidden-form');
    });

    tabBtns.forEach(btn => btn.classList.remove('active'));

    if (view === 'login') {
        formLogin.classList.replace('hidden-form', 'active-form');
        if (direction === 'reverse') {
            formLogin.classList.add('reverse');
        }
        tabBtns[0].classList.add('active');
        tabsContainer.classList.remove('hidden-tabs');
        tabsContainer.style.display = 'flex';

    } else if (view === 'register') {
        formRegister.classList.replace('hidden-form', 'active-form');
        tabBtns[1].classList.add('active');
        tabsContainer.classList.remove('hidden-tabs');
        tabsContainer.style.display = 'flex';

    } else if (view === 'forgot') {
        formForgot.classList.replace('hidden-form', 'active-form');
        tabsContainer.classList.add('hidden-tabs');
    }
}

// 1. Conexión Login con n8n
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('¡Inicio de sesión exitoso!');
            localStorage.setItem('user', JSON.stringify(result.data));
            window.location.href = 'index.html'; // Redirige a tu panel principal de soporte
        } else {
            alert(result.message || 'Credenciales incorrectas o cuenta inactiva.');
        }
    } catch (error) {
        console.error('Error al conectar con n8n:', error);
        alert('Error de conexión con el servidor de autenticación.');
    }
}

// 2. Conexión Registro con n8n
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const cedula = document.getElementById('reg-cedula').value;
    const phone = document.getElementById('reg-phone').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'register',
                name: name,
                cedula: cedula,
                phone: phone,
                email: email,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('¡Registro exitoso! Ya puedes iniciar sesión.');
            switchAuthTab('login', 'reverse');
        } else {
            alert(result.message || 'No se pudo completar el registro (el correo o la cédula ya podrían estar en uso).');
        }
    } catch (error) {
        console.error('Error al conectar con n8n:', error);
        alert('Error de conexión con el servidor de registro.');
    }
}

// 3. Conexión Recuperación de Contraseña con n8n
async function handleForgot(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'forgot',
                email: email
            })
        });

        const result = await response.json();
        alert(result.message || 'Si el correo está registrado, se han enviado las instrucciones.');
        switchAuthTab('login', 'reverse');
    } catch (error) {
        console.error('Error al conectar con n8n:', error);
        alert('Error de conexión con el servidor.');
    }
}