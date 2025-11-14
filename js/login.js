const apiBase = "https://localhost:9190/api";
let token = null;

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const roleInput = document.getElementById("role");
const btnLogin = document.getElementById("btnLogin");
const messageDiv = document.getElementById("message");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");
const loginForm = document.getElementById("loginForm");
const btnCerrarSesion = document.getElementById("cerrar-sesion");

// Manejar cierre de sesión
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", (e) => {
        e.preventDefault();

        // Mostrar confirmación con SweetAlert
        Swal.fire({
            title: '¿Estás seguro/a de cerrar tu sesión actual?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Cerrar sesión',
            cancelButtonText: 'Cancelar',
            background: document.body.classList.contains('light-mode') ? '#ffffff' : '#1a1a1a',
            color: document.body.classList.contains('light-mode') ? '#000000' : '#ffffff'
        }).then((result) => {
            if (result.isConfirmed) {
                // Mostrar mensaje de cierre exitoso
                Swal.fire({
                    title: '¡Sesión cerrada!',
                    text: 'Has cerrado sesión correctamente',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: document.body.classList.contains('light-mode') ? '#ffffff' : '#1a1a1a',
                    color: document.body.classList.contains('light-mode') ? '#000000' : '#ffffff'
                }).then(() => {
                    // Cerrar sesión
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("userName");
                    localStorage.removeItem("userRole");
                    token = null;

                    // Redirigir al index.html
                    window.location.href = "index.html";
                });
            }
        });
    });
}

// Mostrar mensajes al usuario
function showMessage(text, type = "info") {
    messageDiv.textContent = text;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove("d-none");
    
    // Hacer scroll hacia el mensaje si es necesario
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Ocultar mensaje
function hideMessage() {
    messageDiv.classList.add("d-none");
}

// Mostrar/ocultar spinner de carga
function setLoading(isLoading) {
    if (isLoading) {
        btnText.classList.add("d-none");
        spinner.classList.remove("d-none");
        btnLogin.disabled = true;
    } else {
        btnText.classList.remove("d-none");
        spinner.classList.add("d-none");
        btnLogin.disabled = false;
    }
}

// Validar campos del formulario
function validateForm() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        showMessage("Por favor, complete todos los campos", "warning");
        return false;
    }
    
    if (username.length < 3) {
        showMessage("El usuario debe tener al menos 3 caracteres", "warning");
        return false;
    }
    if (password.length < 6) {
        showMessage("La contraseña debe tener al menos 6 caracteres", "warning");
        return false;
    }
    if (!roleInput.value) {
        showMessage("Por favor, seleccione un rol", "warning");
        return false;
    }
    
    return true;
}

// Manejar el evento de inicio de sesión
async function handleLogin() {
    hideMessage();
    
    if (!validateForm()) {
        return;
    }
    
    setLoading(true);
    showMessage("Iniciando sesión...", "info");
    
    try {
        const response = await fetch(`${apiBase}/Jwt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario: usernameInput.value,
                contrasenia: passwordInput.value,
                rol: roleInput.value,
            }),
        });

        if (!response.ok) {
            let errorMessage = "Credenciales inválidas";
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.title || errorMessage;
            } catch (e) {
                // Si no se puede parsear el JSON, usar mensaje por defecto
                if (response.status === 401) {
                    errorMessage = "Usuario o contraseña incorrectos";
                } else if (response.status >= 500) {
                    errorMessage = "Error del servidor. Intente más tarde.";
                } else {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (!data.token) {
            throw new Error("No se recibió el token de autenticación");
        }
        
        token = data.token;

        // Guardar el token para usar en otras páginas
        localStorage.setItem("authToken", token);
        localStorage.setItem("userName", usernameInput.value.trim());
        localStorage.setItem("userRole", roleInput.value);

        showMessage("Inicio de sesión exitoso ✅", "success");

        // Esperar un momento para que el usuario vea el mensaje y luego navegar
        setTimeout(() => {
            window.location.href = "inicio.html";
        }, 1000);

    } catch (err) {
        console.error("Error de login:", err);
        
        // Manejar diferentes tipos de errores
        let userMessage = "Error al iniciar sesión. Intente nuevamente.";
        
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            userMessage = "No se pudo conectar al servidor. Verifique su conexión a internet o que el servidor esté funcionando.";
        } else if (err.message) {
            userMessage = err.message;
        }
        
        showMessage(userMessage, "danger");
    } finally {
        setLoading(false);
    }

}

if (loginForm) {
    // Event listeners
    btnLogin.addEventListener("click", handleLogin);

    // Permitir login con Enter
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleLogin();
    });

    usernameInput.addEventListener("input", hideMessage);
    passwordInput.addEventListener("input", hideMessage);
}