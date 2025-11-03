const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-mode");
});

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

// Prevenir que el clic dentro del sidebar cierre el menú
navbarNav.addEventListener('click', (e) => {
    e.stopPropagation();
});