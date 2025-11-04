const sections = {
    inicio : `
        <main class="home d-flex flex-column justify-content-center align-items-center text-center">
            <h1 class="neon-title">Bienvenido a <span>CineControl</span></h1>
            <p class="lead">Gestioná tu cine con estilo, precisión y luz propia 💡</p>

            <div class="d-flex gap-3 mt-4 flex-wrap justify-content-center">
                <a href="#" class="btn btn-home-primary">Dashboard</a>
                <a href="#" class="btn btn-home-primary">Clientes</a>
                <a href="#" class="btn btn-home-primary">Facturación</a>
                <a href="#" class="btn btn-home-primary">Empleados</a>
            </div>
        </main>
    `,
    clientes : `
        <main class="container-fluid py-4 px-4 main-clientes">
            <h2 class="mb-4 fw-bold">Administración de Clientes</h2>

            <div class="row mb-4">
            <div class="col-lg-6">
                <div class="d-flex">
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control"  placeholder="Buscar por DNI..." id="buscar-cliente">
                </div>
                <button class="btn btn-primary d-flex align-items-center" type="button" id="boton-buscar">
                    <i class="bi bi-search me-2"></i>Buscar
                </button>
                </div>
            </div>
            <div class="col-lg-6 text-lg-end mt-3 mt-lg-0">
                <a href="#formCliente" class="btn btn-primary" id="boton-agregar-cliente">
                <i class="bi bi-person-plus-fill me-2"></i>
                Agregar Cliente
                </a>
            </div>
            </div>

            <div class="table-responsive">
            <table class="table table-dark table-hover align-middle">
                <thead>
                <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Apellido</th>
                    <th scope="col">DNI</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acciones</th>
                </tr>
                </thead>
                <tbody id="tabla-clientes-body">
                <tr><td colspan="5" class="text-center">Cargando...</td></tr>
                </tbody>
            </table>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-4">
            <div class="text-white" id="total-clientes">
                Mostrando 0 de 0 resultados
            </div>
            <nav aria-label="Paginación de clientes">
                <ul class="pagination pagination-dark mb-0">
                <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Anterior</a>
                </li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item disabled"><a class="page-link" href="#">...</a></li>
                <li class="page-item"><a class="page-link" href="#">10</a></li>
                <li class="page-item">
                    <a class="page-link" href="#">Siguiente</a>
                </li>
                </ul>
            </nav>
            </div>
        </main>
    `,
    formCliente: `<main class="main-content p-4">

    <h1 class="mb-4">Agregar Nuevo Cliente</h1>
    <p class="lead">Completá todos los campos para registrar un nuevo cliente.</p>
    <hr>

    <form id="form-agregar-cliente" class="col-lg-8">

        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="cliente-nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="cliente-nombre" placeholder="Ej: Juansito">
                </div>
                <div class="mb-3">
                    <label for="cliente-dni" class="form-label">DNI</label>
                    <input type="text" class="form-control" id="cliente-dni" placeholder="Ej: 46554887">
                </div>
                <div class="mb-3">
                    <label for="cliente-barrio" class="form-label">Barrio (ID)</label>
                    <select class="form-select" id="cliente-barrio">
                        <option value="">Cargando barrios...</option>
                    </select>
                </div>
            </div>

            <div class="col-md-6">
                <div class="mb-3">
                    <label for="cliente-apellido" class="form-label">Apellido</label>
                    <input type="text" class="form-control" id="cliente-apellido" placeholder="Ej: Guemberena">
                </div>
                <div class="mb-3">
                    <label for="cliente-tipo" class="form-label">Tipo de Cliente (ID)</label>
                    <select class ="form-select" id="cliente-tipo">
                        <option value="">Cargando tipos...</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="cliente-activo" class="form-label">Estado</label>
                    <select class="form-select" id="cliente-activo">
                        <option value="true" selected>Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
                </div>
            </div>
        </div>

        <hr class="my-4">
        <h5 class="mb-3">Datos de Contacto</h5>

        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="cliente-contacto" class="form-label">Contacto (Email o Teléfono)</label>
                    <input type="text" class="form-control" id="cliente-contacto" placeholder="Ej: Juansito@gmail.com">
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="cliente-tipo-contacto" class="form-label">Tipo de Contacto (ID)</label>
                    <select class="form-select" id="cliente-tipo-contacto">
                        <option value="">Cargando tipos de contacto...</option>
                    </select>
                </div>
            </div>
        </div>

        <button type="submit" class="btn btn-success btn-lg mt-3">
            <i class="bi bi-check-circle-fill me-2"></i>
            Agregar Cliente
        </button>

    </form>
</main>
`
}

// Función para navegar entre páginas
function navigateTo(page) {
    const contentDiv = document.getElementById('main-content');
    
    // Actualizar contenido usando el objeto sections
    if (sections[page]) {
        contentDiv.innerHTML = sections[page];
    } else {
        contentDiv.innerHTML = `
            <main class="container-fluid py-4 px-4 text-center">
                <h1 class="text-white">Página no encontrada</h1>
                <p class="text-muted">La sección "${page}" está en desarrollo.</p>
                <a href="#inicio" class="btn btn-primary nav-linkD">Volver al inicio</a>
            </main>
        `;
    }
    if (page === 'clientes') {
        cargarClientes();
        setupClientesListeners();
    }else if (page === 'formCliente') {
        setupFormClienteListeners();
    }
    

    
    // Actualizar estado activo del navbar
    document.querySelectorAll('.nav-linkD').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === '#' + page) {
            link.classList.add('active');
        }
    });
    
    // Cerrar menú móvil si está abierto
    const navbarNav = document.getElementById('navbarNav');
    const navbarToggler = document.getElementById('navbarToggler');
    if (navbarNav && navbarNav.classList.contains('show')) {
        navbarNav.classList.remove('show');
        navbarToggler.classList.remove('active');
        navbarToggler.setAttribute('aria-expanded', 'false');
    }
    
    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Actualizar URL sin recargar
    history.pushState({ page: page }, '', '#' + page);
}

// Event listeners para los enlaces del navbar
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-linkD');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const page = href.substring(1);
                navigateTo(page);
            }
        });
    });

    // También manejar los botones del home
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-home-primary')) {
            e.preventDefault();
            const text = e.target.textContent.toLowerCase();
            let page = 'dashboard';
            
            if (text.includes('cliente')) page = 'clientes';
            else if (text.includes('factur')) page = 'facturas';
            else if (text.includes('emplead')) page = 'empleados';
            
            
            navigateTo(page);
        }
    });
    
    // Manejar botón atrás del navegador
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            navigateTo(e.state.page);
        } else {
            navigateTo('inicio');
        }
    });
    
    // Cargar página inicial
    const currentHash = window.location.hash.substring(1);
    navigateTo(currentHash || 'inicio');
});

// Hacer las funciones disponibles globalmente
window.navigateTo = navigateTo;
