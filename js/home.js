// ====== VERIFICACIÓN DE AUTENTICACIÓN ======
function checkAuth() {
    const token = localStorage.getItem("authToken");
    const userName = localStorage.getItem("userName");
    
    if (!token) {
        // Si no hay token, redirigir al login
        window.location.href = "index.html";
        return false;
    }
    
    // Opcional: Mostrar el nombre del usuario en la interfaz
    const userElement = document.getElementById('nombre-user');
    userElement.textContent = userName || 'Usuario';

    return true;
}

// ====== CONTROL DE ROLES Y PERMISOS ======
function setupRoleBasedNavigation() {
    const userRole = localStorage.getItem("userRole");
    
    // Definir permisos por rol
    const rolePermissions = {
        'Empleado': {
            canSeeClientes: true,
            canSeeFacturas: true,
            canSeeDashboard: false,
            canSeeEmpleados: false
        },
        'Administrador': {
            canSeeClientes: true,
            canSeeFacturas: true,
            canSeeDashboard: true,
            canSeeEmpleados: true
        }
    };
    
    const permissions = rolePermissions[userRole];
    
    if (!permissions) {
        console.error('Rol no reconocido:', userRole);
        return;
    }
    
    // Controlar visibilidad del Dashboard
    const dashboardNav = document.getElementById('dashboard-nav');
    if (dashboardNav) {
        dashboardNav.style.display = permissions.canSeeDashboard ? 'block' : 'none';
    }
    
    // Controlar visibilidad de Empleados en el dropdown
    const empleadosNav = document.getElementById('empleados-nav');
    if (empleadosNav) {
        empleadosNav.style.display = permissions.canSeeEmpleados ? 'block' : 'none';
    }
    
    // Actualizar el texto del usuario para mostrar el rol
    const usernameSpan = document.querySelector('.username');
    if (usernameSpan) {
        usernameSpan.textContent = userRole;
    }
    
    // También actualizar el nombre completo en el dropdown
    const userElement = document.getElementById('nombre-user');
    const userName = localStorage.getItem("userName");
    if (userElement) {
        userElement.textContent = `${userName} (${userRole})`;
    }
}

// ====== SISTEMA DE TEMAS ======
function initTheme() {
    const body = document.body;
    
    // Verificar si hay una preferencia guardada, si no, usar tema oscuro por defecto
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "light") {
        body.classList.add("light-mode");
    } else {
        // Por defecto tema oscuro (no agregar ninguna clase)
        // Asegurarse de que no tenga la clase light-mode
        body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
    }
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    // Verificar autenticación primero
    if (checkAuth()) {
        // Solo inicializar tema si está autenticado
        initTheme();
        // Configurar navegación basada en roles
        setupRoleBasedNavigation();
    }
});

// Funcionalidad del botón de cambio de tema
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("light-mode");
        
        // Guardar la preferencia del usuario
        if (body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
        }
    });
}

// Funcionalidad del menú hamburguesa
const navbarToggler = document.getElementById("navbarToggler");
const navbarNav = document.getElementById("navbarNav");

navbarToggler.addEventListener("click", () => {
    // Toggle del menú
    navbarNav.classList.toggle("show");
    navbarToggler.classList.toggle("active");
    
    // Actualizar aria-expanded
    const isExpanded = navbarNav.classList.contains("show");
    navbarToggler.setAttribute("aria-expanded", isExpanded);
});

// Manejar dropdowns en móviles
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 991) {
            e.preventDefault();
            const dropdown = toggle.parentElement;
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            
            // Cerrar otros dropdowns
            dropdownToggles.forEach(otherToggle => {
                if (otherToggle !== toggle) {
                    const otherDropdown = otherToggle.parentElement;
                    const otherMenu = otherDropdown.querySelector('.dropdown-menu');
                    otherDropdown.classList.remove('show');
                    otherToggle.classList.remove('active');
                }
            });
            
            // Toggle el dropdown actual
            dropdown.classList.toggle('show');
            toggle.classList.toggle('active');
        }
    });
});

// Cerrar el menú al hacer clic en un enlace (en móviles)
const navLinks = document.querySelectorAll(".nav-links a:not(.dropdown-toggle)");
navLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (window.innerWidth <= 991) {
            navbarNav.classList.remove("show");
            navbarToggler.classList.remove("active");
            navbarToggler.setAttribute("aria-expanded", "false");
            
            // Cerrar dropdowns también
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
            document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                toggle.classList.remove('active');
            });
        }
    });
});

// Cerrar el menú al redimensionar la ventana
window.addEventListener("resize", () => {
    if (window.innerWidth > 991) {
        navbarNav.classList.remove("show");
        navbarToggler.classList.remove("active");
        navbarToggler.setAttribute("aria-expanded", "false");
        
        // Cerrar dropdowns también
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
    }
});

// Cerrar menú al hacer clic en el overlay o fuera del sidebar
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 991) {
        const isClickInsideSidebar = e.target.closest('.navbar-collapse');
        const isClickOnToggler = e.target.closest('.navbar-toggler');
        
        if (!isClickInsideSidebar && !isClickOnToggler && navbarNav.classList.contains('show')) {
            navbarNav.classList.remove("show");
            navbarToggler.classList.remove("active");
            navbarToggler.setAttribute("aria-expanded", "false");
            
            // Cerrar dropdowns también
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
            document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                toggle.classList.remove('active');
            });
        }
    }
});