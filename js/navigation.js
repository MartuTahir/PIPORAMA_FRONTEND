const sections = {
    inicio : `
        <main class="home d-flex flex-column justify-content-center align-items-center text-center">
            <h1 class="neon-title">Bienvenido a <span>CineControl</span></h1>
            <p class="lead">Gestioná tu cine con estilo, precisión y luz propia 💡</p>

            <div class="d-flex gap-3 mt-4 flex-wrap justify-content-center" id="home-buttons-container">
                <a href="#dashboard" class="btn btn-home-primary" id="home-dashboard-btn">Dashboard</a>
                <a href="#clientes" class="btn btn-home-primary">Clientes</a>
                <a href="#facturas" class="btn btn-home-primary">Facturación</a>
                <a href="#empleados" class="btn btn-home-primary" id="home-empleados-btn">Empleados</a>
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
            <div class="text-result" id="total-clientes">
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

    <h1 class="mb-4 fw-bold" id="form-cliente-titulo">Agregar Nuevo Cliente</h1>
    <p class="lead">Completá todos los campos para registrar un nuevo cliente.</p>
    <hr>

    <form id="form-agregar-cliente" class="col-lg-8">

        <input type="hidden" id="cliente-codigo">
        <input type="hidden" id="cliente-id-contacto">

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
                    <label for="cliente-barrio" class="form-label">Barrio</label>
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
                    <label for="cliente-tipo" class="form-label">Tipo de Cliente</label>
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
                    <input type="text" class="form-control" id="cliente-contacto" placeholder="Ej: ejemplo@gmail.com">
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="cliente-tipo-contacto" class="form-label">Tipo de Contacto</label>
                    <select class="form-select" id="cliente-tipo-contacto">
                        <option value="">Cargando tipos de contacto...</option>
                    </select>
                </div>
            </div>
        </div>

        <button type="submit" class="btn btn-success btn-lg mt-3" id="btn-submit">
            <i class="bi bi-check-circle-fill me-2"></i>
            Agregar Cliente
        </button>

    </form>
</main>
`,
facturas : `
<main class="container-fluid py-4 px-4 main-clientes">
            <h2 class="mb-4 fw-bold">Administración de Facturas</h2>

            <div class="row mb-4">
            <div class="col-lg-6">
                <div class="d-flex">
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control"  placeholder="Buscar por nro de factura..." id="buscar-factura">
                </div>
                <button class="btn btn-primary d-flex align-items-center" type="button" id="boton-buscar-f">
                    <i class="bi bi-search me-2"></i>Buscar
                </button>
                </div>
            </div>
            <div class="col-lg-6 text-lg-end mt-3 mt-lg-0">
                <a href="#formFactura" class="btn btn-primary" id="boton-agregar-factura">
                <i class="bi bi-person-plus-fill me-2"></i>
                Agregar Factura
                </a>
            </div>
            </div>

            <div class="table-responsive">
            <table class="table table-dark table-hover align-middle">
                <thead>
                <tr>
                    <th scope="col">ID Factura</th>
                    <th scope="col">DNI cliente</th>
                    <th scope="col">DNI empleado</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Método de pago</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Forma de compra</th>
                    <th scope="col">Acciones</th>
                </tr>
                </thead>
                <tbody id="tabla-facturas-body">
                <tr><td colspan="8" class="text-center">Cargando...</td></tr>
                </tbody>
            </table>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-4">
            <div class="text-result" id="total-facturas">
                Mostrando 0 de 0 resultados
            </div>
            <nav aria-label="Paginación de facturas">
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

// ... (tus otras secciones como 'inicio', 'clientes', etc.) ...

formFactura: ` <main class="main-content p-4">
    <h1 class="mb-4 fw-bold" id="form-factura-titulo">Agregar Nueva Factura</h1>
    <p class="lead">Completá todos los campos para registrar una nueva factura.</p>
    <hr>
    <form id="form-agregar-factura" class="col-lg-10">
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3"><label for="factura-dni-cliente" class="form-label">DNI del Cliente</label><input type="text" class="form-control" id="factura-dni-cliente" placeholder="Ej: 46554887"></div>
                <div class="mb-3"><label for="factura-dni-empleado" class="form-label">DNI del Empleado</label><input type="text" class="form-control" id="factura-dni-empleado" placeholder="Ej: 12345678"></div>
                <div class="mb-3"><label for="factura-fecha" class="form-label">Fecha</label><input type="date" class="form-control" id="factura-fecha"></div>
            </div>
            <div class="col-md-6">
                <div class="mb-3"><label for="factura-metodo-pago" class="form-label">Método de Pago</label><select class="form-select" id="factura-metodo-pago"><option value="">Cargando...</option></select></div>
                <div class="mb-3"><label for="factura-estado" class="form-label">Estado</label><select class="form-select" id="factura-estado"><option value="">Cargando...</option></select></div>
                <div class="mb-3"><label for="factura-forma-compra" class="form-label">Forma de Compra</label><select class="form-select" id="factura-forma-compra"><option value="">Cargando...</option></select></div>
            </div>
        </div>

        <hr class="my-4">
        <h5 class="mb-3">Detalles de la Factura</h5>
        <div class="p-3 mb-3" style="background-color: var(--color-surface); border-radius: var(--radius);">
            
            <div class="mb-3">
                <label for="detalle-tipo-item" class="form-label fw-bold">1. Seleccione el tipo de ítem</label>
                <select class="form-select" id="detalle-tipo-item">
                    <option value="" selected>Seleccione un tipo...</option>
                    <option value="ticket">Ticket (Entrada)</option>
                    <option value="consumible">Consumible</option>
                    <option value="combo">Combo</option>
                </select>
            </div>

            <div id="formularios-detalle">
                
                <div id="form-seccion-ticket" class="detalle-seccion" style="display: none;">
                    <h6 class="text-info">Datos del Ticket</h6>
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label for="ticket-funcion" class="form-label">Función</label>
                            <select class="form-select" id="ticket-funcion"><option value="">Cargando funciones...</option></select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="ticket-asiento" class="form-label">Asiento</label>
                            <select class="form-select" id="ticket-asiento" disabled><option value="">Seleccione función...</option></select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="ticket-precio" class="form-label">Precio ($)</label>
                            <input type="number" step="0.01" class="form-control" id="ticket-precio" readonly placeholder="0.00">
                        </div>
                    </div>
                </div>
                <div id="form-seccion-consumible" class="detalle-seccion" style="display: none;">
                    <h6 class="text-info">Datos del Consumible</h6>
                    <div class="row">
                        <div class="col-md-8 mb-3"><label for="consumible-descripcion" class="form-label">Descripción</label><select class="form-select" id="consumible-descripcion"><option value="">Cargando...</option></select></div>
                        <div class="col-md-4 mb-3"><label for="consumible-precio" class="form-label">Precio ($)</label><input type="number" step="0.01" class="form-control" id="consumible-precio" readonly placeholder="0.00"></div>
                    </div>
                </div>

                <div id="form-seccion-combo" class="detalle-seccion" style="display: none;">
                    <h6 class="text-info">Datos del Combo</h6>
                    <div class="row">
                        <div class="col-md-8 mb-3"><label for="combo-descripcion" class="form-label">Descripción</label><select class="form-select" id="combo-descripcion"><option value="">Cargando...</option></select></div>
                        <div class="col-md-4 mb-3"><label for="combo-precio" class="form-label">Precio ($)</label><input type="number" step="0.01" class="form-control" id="combo-precio" readonly placeholder="0.00"></div>
                    </div>
                </div>
            </div>

            <div class="row align-items-end mt-3">
                <div class="col-md-9">
                    <label for="detalle-promocion" class="form-label">2. Aplicar Promoción (Opcional)</label>
                    <select class="form-select" id="detalle-promocion"><option value="" selected>Sin promoción...</option></select>
                </div>
                <div class="col-md-3">
                    <button type="button" class="btn btn-primary w-100" id="btn-agregar-item">
                        <i class="bi bi-plus-circle me-2"></i>Agregar Ítem
                    </button>
                </div>
            </div>
        </div>

        <h6 class="mb-2">Ítems a Facturar</h6>
        <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
        <table class="table table-dark table-sm">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Detalles</th>
                        <th>Promoción</th>
                        <th>Precio Final</th>
                        <th class="text-center" style="width: 50px;">Acción</th>
                    </tr>
                </thead>
                <tbody id="tabla-detalles-body">
                    <tr><td colspan="6" class="text-center text-muted">Aún no hay ítems...</td></tr>
                </tbody>
            </table>
        </div>

        <hr class="my-4">
        <h5 class="mb-3">Información Adicional</h5>
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="factura-total" class="form-label">Total ($)</label>
                                        <input type="number" class="form-control" id="factura-total" readonly placeholder="0.00">
                </div>
            </div>
            
        </div>

        <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-success btn-m" id="btn-submit-factura">
                <i class="bi bi-check-circle-fill me-2"></i>
                Guardar Factura
            </button>
            <a href="#facturas" class="btn btn-secondary btn-m" onclick="navigateTo('facturas'); return false;">
              <i class="bi bi-arrow-left me-2"></i>
                Volver a Facturas
            </a>
        </div>
        </form>
</main>
`,
}

// Función para navegar entre páginas
function navigateTo(page) {
    const contentDiv = document.getElementById('main-content');
    const userRole = localStorage.getItem("userRole");
    
    // Verificar permisos de acceso según el rol
    const rolePermissions = {
        'Empleado': {
            allowedPages: ['inicio', 'clientes', 'facturas', 'formCliente', 'formFactura']
        },
        'Administrador': {
            allowedPages: ['inicio', 'clientes', 'facturas', 'dashboard', 'empleados', 'formCliente', 'formFactura']
        }
    };
    
    const permissions = rolePermissions[userRole];
    
    // Si el usuario no tiene permisos para acceder a esta página, redirigir al inicio
    if (permissions && !permissions.allowedPages.includes(page)) {
        contentDiv.innerHTML = `
            <main class="container-fluid py-4 px-4 text-center">
                <div class="alert alert-warning">
                    <h1 class="text-dark">Acceso Denegado</h1>
                    <p class="text-muted">No tienes permisos para acceder a esta sección.</p>
                    <p class="text-muted">Tu rol actual es: <strong>${userRole}</strong></p>
                    <a href="#inicio" class="btn btn-primary nav-linkD">Volver al inicio</a>
                </div>
            </main>
        `;
        return;
    }
    
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

    // Configurar listeners para las diferentes páginas
    if (page === 'clientes') {
        cargarClientes();
        setupClientesListeners();
    }else if (page === 'formCliente') {
        setupFormClienteListeners();
    }else if (page === 'facturas') {
        cargarFacturas();
        setupFacturasListeners();
    }else if (page === 'formFactura') {
        setupFormFacturaListeners();
    }else if (page === 'inicio') {
        // Configurar visibilidad de botones en el home según el rol
        setTimeout(setupHomeButtonsVisibility, 100); // Pequeño delay para asegurar que el DOM esté actualizado
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

// Función para controlar los botones del home según el rol
function setupHomeButtonsVisibility() {
    const userRole = localStorage.getItem("userRole");
    
    // Definir permisos por rol (igual que en home.js)
    const rolePermissions = {
        'Empleado': {
            canSeeDashboard: false,
            canSeeEmpleados: false
        },
        'Administrador': {
            canSeeDashboard: true,
            canSeeEmpleados: true
        }
    };
    
    const permissions = rolePermissions[userRole];
    
    if (!permissions) {
        return; // Si no hay rol definido, mostrar todo por defecto
    }
    
    // Controlar visibilidad de los botones del home
    const dashboardBtn = document.getElementById('home-dashboard-btn');
    if (dashboardBtn) {
        dashboardBtn.style.display = permissions.canSeeDashboard ? 'inline-block' : 'none';
    }
    
    const empleadosBtn = document.getElementById('home-empleados-btn');
    if (empleadosBtn) {
        empleadosBtn.style.display = permissions.canSeeEmpleados ? 'inline-block' : 'none';
    }
}

// Hacer las funciones disponibles globalmente
window.navigateTo = navigateTo;
window.setupHomeButtonsVisibility = setupHomeButtonsVisibility;
