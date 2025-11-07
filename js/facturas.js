// Función para configurar los listeners del formulario de facturas
async function setupFormFacturaListeners() {
    const formFactura = document.getElementById('form-agregar-factura');
    const fechaInput = document.getElementById('factura-fecha');
    
    // Establecer la fecha actual por defecto
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
    }
    
    if (formFactura) {
        formFactura.addEventListener('submit', async function(e) {
            e.preventDefault();
            await guardarFactura();
        });
    }
    
    // Listener para validación en tiempo real del DNI del cliente
    const dniClienteInput = document.getElementById('factura-dni-cliente');
    if (dniClienteInput) {
        dniClienteInput.addEventListener('blur', async function() {
            await validarDniCliente(this.value);
        });
    }
    
    // Listener para validación en tiempo real del DNI del empleado
    const dniEmpleadoInput = document.getElementById('factura-dni-empleado');
    if (dniEmpleadoInput) {
        dniEmpleadoInput.addEventListener('blur', async function() {
            await validarDniEmpleado(this.value);
        });
    }
}

// Función para validar si existe un cliente con el DNI ingresado
async function validarDniCliente(dni) {
    if (!dni || dni.trim() === '') return;
    
    try {
        // Aquí deberías hacer la llamada a tu API para validar el cliente
        console.log('Validando DNI de cliente:', dni);
        // Ejemplo de validación visual
        const input = document.getElementById('factura-dni-cliente');
        input.classList.remove('is-invalid', 'is-valid');
        
        // Simulación de validación - reemplazar con tu lógica real
        if (dni.length >= 7) {
            input.classList.add('is-valid');
        } else {
            input.classList.add('is-invalid');
        }
    } catch (error) {
        console.error('Error validando DNI del cliente:', error);
    }
}

// Función para validar si existe un empleado con el DNI ingresado
async function validarDniEmpleado(dni) {
    if (!dni || dni.trim() === '') return;
    
    try {
        // Aquí deberías hacer la llamada a tu API para validar el empleado
        console.log('Validando DNI de empleado:', dni);
        // Ejemplo de validación visual
        const input = document.getElementById('factura-dni-empleado');
        input.classList.remove('is-invalid', 'is-valid');
        
        // Simulación de validación - reemplazar con tu lógica real
        if (dni.length >= 7) {
            input.classList.add('is-valid');
        } else {
            input.classList.add('is-invalid');
        }
    } catch (error) {
        console.error('Error validando DNI del empleado:', error);
    }
}

// Función para guardar la factura
async function guardarFactura() {
    const btnSubmit = document.getElementById('btn-submit-factura');
    const originalText = btnSubmit.innerHTML;
    
    try {
        // Mostrar loading
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
        btnSubmit.disabled = true;
        
        // Obtener datos del formulario
        const facturaData = {
            dniCliente: document.getElementById('factura-dni-cliente').value,
            dniEmpleado: document.getElementById('factura-dni-empleado').value,
            fecha: document.getElementById('factura-fecha').value,
            metodoPago: document.getElementById('factura-metodo-pago').value,
            estado: document.getElementById('factura-estado').value,
            formaCompra: document.getElementById('factura-forma-compra').value,
            total: parseFloat(document.getElementById('factura-total').value) || 0,
            observaciones: document.getElementById('factura-observaciones').value
        };
        
        // Validar campos requeridos
        if (!facturaData.dniCliente || !facturaData.dniEmpleado || !facturaData.fecha) {
            throw new Error('Por favor complete todos los campos obligatorios');
        }
        
        // Aquí deberías hacer la llamada a tu API para guardar la factura
        console.log('Datos de la factura a guardar:', facturaData);
        
        // Simulación de guardado exitoso
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mostrar mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: '¡Factura creada!',
            text: 'La factura ha sido registrada correctamente.',
            confirmButtonColor: '#28a745'
        }).then(() => {
            // Redirigir a la lista de facturas
            navigateTo('facturas');
        });
        
    } catch (error) {
        console.error('Error al guardar factura:', error);
        
        // Mostrar mensaje de error
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Hubo un error al guardar la factura. Intente nuevamente.',
            confirmButtonColor: '#dc3545'
        });
        
    } finally {
        // Restaurar botón
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
    }
}

// Función para configurar listeners de la página de facturas
function setupFacturasListeners() {
    // Listener para el botón "Agregar Factura"
    const botonAgregarFactura = document.getElementById('boton-agregar-factura');
    if (botonAgregarFactura) {
        botonAgregarFactura.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo('formFactura');
        });
    }
    
    // Listener para el botón de búsqueda
    const botonBuscar = document.getElementById('boton-buscar-f');
    if (botonBuscar) {
        botonBuscar.addEventListener('click', function() {
            buscarFacturas();
        });
    }
    
    // Listener para búsqueda en tiempo real
    const inputBuscar = document.getElementById('buscar-factura');
    if (inputBuscar) {
        inputBuscar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarFacturas();
            }
        });
    }
}

// Función para buscar facturas por número de factura
async function buscarFacturas() {
    const nroFactura = document.getElementById('buscar-factura').value.trim();

    if (!nroFactura) {
        // Si no hay número de factura, cargar todas las facturas
        await cargarFacturas();
        return;
    }
    
    try {
        console.log('Buscando facturas para número de factura:', nroFactura);

        const response = await fetch(`https://localhost:7169/api/Invoices/${nroFactura}`);
        const facturaData = await response.json();
        
        // Convertir a array si es un objeto único
        const facturasFiltradas = Array.isArray(facturaData) ? facturaData : [facturaData];
        
        // Validar que tenemos datos válidos
        if (!facturasFiltradas || facturasFiltradas.length === 0 || !facturasFiltradas[0]) {
            throw new Error('No se encontró la factura');
        }

        // Actualizar la tabla
        const tablaBody = document.getElementById('tabla-facturas-body');
        if (tablaBody) {
            if (facturasFiltradas.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="8" class="text-center">No se encontraron facturas para el número de factura: ${nroFactura}</td></tr>`;
            } else {
                tablaBody.innerHTML = facturasFiltradas.map((factura, index) => `
                    <tr>
                        <td>${factura.invoiceId || (index + 1)}</td>
                        <td>${factura.dniClient}</td>
                        <td>${factura.dniEmployee}</td>
                        <td>${factura.invoiceDate}</td>
                        <td>${factura.paymentMethod}</td>
                        <td><span class="badge bg-${factura.purchaseStatus === 'Aprobada' ? 'success' : 'warning'}">${factura.purchaseStatus}</span></td>
                        <td>${factura.purchaseForm}</td>
                        <td>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-outline-info" onclick="toggleFacturaDetalle(${factura.invoiceId || index})" title="Ver detalles">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="eliminarFactura(${factura.invoiceId || index})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr id="detalle-factura-${factura.invoiceId || index}" class="collapse">
                        <td colspan="8" class="border-0 p-0">
                            <div class="card bg-secondary border-0 m-2">
                                <div class="card-header bg-primary text-white">
                                    <h6 class="mb-0 fw-bold"><i class="bi bi-receipt me-2"></i>Detalle de la Factura #${factura.invoiceId || (index + 1)}</h6>
                                </div>
                                <div class="card-body body-detail">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6 class="text-info mb-2 fw-bold">Información General</h6>
                                            <p class="fs-6"><strong>ID:</strong> ${factura.invoiceId || 'N/A'}</p>
                                            <p class="fs-6"><strong>Total:</strong> $${factura.detailInvoices.price || '0.00'}</p>
                                            <p class="fs-6"><strong>Fecha de creación:</strong> ${factura.invoiceDate}</p>
                                            <p class="fs-6"><strong>Estado del pago:</strong> <span class="badge bg-${factura.purchaseStatus === 'Aprobada' ? 'success' : 'warning'}">${factura.purchaseStatus}</span></p>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 class="text-info mb-2 fw-bold">Detalles de Compra</h6>
                                            <p class="fs-6"><strong>Método de pago:</strong> ${factura.paymentMethod}</p>
                                            <p class="fs-6"><strong>Forma de compra:</strong> ${factura.purchaseForm}</p>
                                        </div>
                                    </div>
                                    ${factura.detailInvoices && factura.detailInvoices.length > 0 ? `
                                    <div class="mt-3">
                                        <h6 class="text-primary mb-2 fw-bold">Detalles de la Compra</h6>
                                        <div class="table-responsive">
                                            <table class="table table-sm table-dark">
                                                <thead>
                                                    <tr>
                                                        <th>Tipo</th>
                                                        <th>Descripción</th>
                                                        <th>Detalles</th>
                                                        <th class="text-end">Precio</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${factura.detailInvoices.map((item, index) => {
                                                        let tipo = '';
                                                        let descripcion = '';
                                                        let detalles = '';
                                                        
                                                        if (item.consumable) {
                                                            tipo = '<span class="badge bg-danger"><i class="bi bi-cup-straw me-1"></i>Consumible</span>';
                                                            descripcion = item.consumable;
                                                        } else if (item.combo) {
                                                            tipo = '<span class="badge bg-warning text-dark"><i class="bi bi-box me-1"></i>Combo</span>';
                                                            descripcion = item.combo;
                                                        } else if (item.ticket) {
                                                            tipo = '<span class="badge bg-primary"><i class="bi bi-ticket-perforated me-1"></i>Ticket</span>';
                                                            descripcion = item.ticket.function ? item.ticket.function.functionDate || 'Función' : 'Entrada de cine';
                                                            
                                                            if (item.ticket) {
                                                                const ticketDetails = [];
                                                                if (item.ticket.function) {
                                                                    if (item.ticket.function.functionDate) ticketDetails.push(`Fecha: ${item.ticket.function.functionDate}`);
                                                                    if (item.ticket.function.film) ticketDetails.push(`Película: ${item.ticket.function.film}`);
                                                                    if (item.ticket.function.room) ticketDetails.push(`Sala: ${item.ticket.function.room}`);
                                                                }
                                                                if (item.ticket.seat) {
                                                                    if (item.ticket.seat.seatRow) ticketDetails.push(`Fila: ${item.ticket.seat.seatRow}`);
                                                                    if (item.ticket.seat.seatNumber) ticketDetails.push(`Asiento: ${item.ticket.seat.seatNumber}`);
                                                                }
                                                                detalles = ticketDetails.length > 0 ? ticketDetails.join('<br>') : '';
                                                            }
                                                        } else {
                                                            tipo = '<span class="badge bg-secondary"><i class="bi bi-question me-1"></i>Otro</span>';
                                                            descripcion = 'Item sin especificar';
                                                        }
                                                        
                                                        if (item.promotion) {
                                                            detalles += detalles ? '<br>' : '';
                                                            detalles += `<small class="text-primary"><i class="bi bi-tag me-1"></i>Promoción: ${item.promotion.description}</small>`;
                                                        }
                                                        
                                                        return `
                                                        <tr>
                                                            <td>${tipo}</td>
                                                            <td class="fw-medium">${descripcion}</td>
                                                            <td class="small">${detalles || '<span class="text-muted">-</span>'}</td>
                                                            <td class="text-end fw-bold">$${parseFloat(item.price || 0).toFixed(2)}</td>
                                                        </tr>`;
                                                    }).join('')}
                                                    <tr class="total-row-custom">
                                                        <td colspan="3" class="fw-bold text-end">TOTAL:</td>
                                                        <td class="text-end fw-bold fs-5">$${factura.detailInvoices.reduce((total, item) => total + parseFloat(item.price || 0), 0).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Actualizar contador
            const totalFacturas = document.getElementById('total-facturas');
            if (totalFacturas) {
                totalFacturas.textContent = `Mostrando ${facturasFiltradas.length} resultado(s) para factura número: ${nroFactura}`;
            }
        }
        
    } catch (error) {
        console.error('Error al buscar facturas:', error);
        
        const tablaBody = document.getElementById('tabla-facturas-body');
        if (tablaBody) {
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al buscar facturas</td></tr>';
        }
    }
}

// Función para cargar facturas (si no existe ya)
async function cargarFacturas() {
    try {
        console.log('Cargando facturas...');
        
        const url = 'https://localhost:7169/api/Invoices';
        const response = await fetch(url);
        const facturas = await response.json();

        // Actualizar la tabla (si existe)
        const tablaBody = document.getElementById('tabla-facturas-body');
        if (tablaBody) {
            if (facturas.length === 0) {
                tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay facturas registradas</td></tr>';
            } else {
                tablaBody.innerHTML = facturas.map((factura, index) => `
                    <tr>
                        <td>${factura.invoiceId || (index + 1)}</td>
                        <td>${factura.dniClient}</td>
                        <td>${factura.dniEmployee}</td>
                        <td>${factura.invoiceDate}</td>
                        <td>${factura.paymentMethod}</td>
                        <td><span class="badge bg-${factura.purchaseStatus === 'Aprobada' ? 'success' : 'warning'}">${factura.purchaseStatus}</span></td>
                        <td>${factura.purchaseForm}</td>
                        <td>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-outline-info" onclick="toggleFacturaDetalle(${factura.invoiceId || index})" title="Ver detalles">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="eliminarFactura(${factura.invoiceId || index})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr id="detalle-factura-${factura.invoiceId || index}" class="collapse">
                        <td colspan="8" class="border-0 p-0">
                            <div class="card bg-secondary border-0 m-2">
                                <div class="card-header bg-primary text-white">
                                    <h6 class="mb-0 fw-bold"><i class="bi bi-receipt me-2"></i>Detalle de la Factura #${factura.invoiceId || (index + 1)}</h6>
                                </div>
                                <div class="card-body body-detail">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6 class="text-info mb-2 fw-bold">Información General</h6>
                                            <p class="fs-6"><strong>ID:</strong> ${factura.invoiceId || 'N/A'}</p>
                                            <p class="fs-6"><strong>Total:</strong> $${factura.detailInvoices.price || '0.00'}</p>
                                            <p class="fs-6"><strong>Fecha de creación:</strong> ${factura.invoiceDate}</p>
                                            <p class="fs-6"><strong>Estado del pago:</strong> <span class="badge bg-${factura.purchaseStatus === 'Aprobada' ? 'success' : 'warning'}">${factura.purchaseStatus}</span></p>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 class="text-info mb-2 fw-bold">Detalles de Compra</h6>
                                            <p class="fs-6"><strong>Método de pago:</strong> ${factura.paymentMethod}</p>
                                            <p class="fs-6"><strong>Forma de compra:</strong> ${factura.purchaseForm}</p>
                                        </div>
                                    </div>
                                    ${factura.detailInvoices && factura.detailInvoices.length > 0 ? `
                                    <div class="mt-3">
                                        <h6 class="text-primary mb-2 fw-bold">Detalles de la Compra</h6>
                                        <div class="table-responsive">
                                            <table class="table table-sm table-dark">
                                                <thead>
                                                    <tr>
                                                        <th>Tipo</th>
                                                        <th>Descripción</th>
                                                        <th>Detalles</th>
                                                        <th class="text-end">Precio</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${factura.detailInvoices.map((item, index) => {
                                                        let tipo = '';
                                                        let descripcion = '';
                                                        let detalles = '';
                                                        
                                                        if (item.consumable) {
                                                            tipo = '<span class="badge bg-danger"><i class="bi bi-cup-straw me-1"></i>Consumible</span>';
                                                            descripcion = item.consumable;
                                                        } else if (item.combo) {
                                                            tipo = '<span class="badge bg-warning text-dark"><i class="bi bi-box me-1"></i>Combo</span>';
                                                            descripcion = item.combo;
                                                        } else if (item.ticket) {
                                                            tipo = '<span class="badge bg-primary"><i class="bi bi-ticket-perforated me-1"></i>Ticket</span>';
                                                            descripcion = item.ticket.function ? item.ticket.function.functionDate || 'Función' : 'Entrada de cine';
                                                            
                                                            if (item.ticket) {
                                                                const ticketDetails = [];
                                                                if (item.ticket.function) {
                                                                    if (item.ticket.function.functionDate) ticketDetails.push(`Fecha: ${item.ticket.function.functionDate}`);
                                                                    if (item.ticket.function.film) ticketDetails.push(`Película: ${item.ticket.function.film}`);
                                                                    if (item.ticket.function.room) ticketDetails.push(`Sala: ${item.ticket.function.room}`);
                                                                }
                                                                if (item.ticket.seat) {
                                                                    if (item.ticket.seat.seatRow) ticketDetails.push(`Fila: ${item.ticket.seat.seatRow}`);
                                                                    if (item.ticket.seat.seatNumber) ticketDetails.push(`Asiento: ${item.ticket.seat.seatNumber}`);
                                                                }
                                                                detalles = ticketDetails.length > 0 ? ticketDetails.join('<br>') : '';
                                                            }
                                                        } else {
                                                            tipo = '<span class="badge bg-secondary"><i class="bi bi-question me-1"></i>Otro</span>';
                                                            descripcion = 'Item sin especificar';
                                                        }
                                                        
                                                        if (item.promotion) {
                                                            detalles += detalles ? '<br>' : '';
                                                            detalles += `<small class="text-primary"><i class="bi bi-tag me-1"></i>Promoción: ${item.promotion.description}</small>`;
                                                        }
                                                        
                                                        return `
                                                        <tr>
                                                            <td>${tipo}</td>
                                                            <td class="fw-medium">${descripcion}</td>
                                                            <td class="small">${detalles || '<span class="text-muted">-</span>'}</td>
                                                            <td class="text-end fw-bold">$${parseFloat(item.price || 0).toFixed(2)}</td>
                                                        </tr>`;
                                                    }).join('')}
                                                    <tr class="total-row-custom">
                                                        <td colspan="3" class="fw-bold text-end">TOTAL:</td>
                                                        <td class="text-end fw-bold fs-5">$${factura.detailInvoices.reduce((total, item) => total + parseFloat(item.price || 0), 0).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Actualizar contador
            const totalFacturas = document.getElementById('total-facturas');
            if (totalFacturas) {
                totalFacturas.textContent = `Mostrando ${facturas.length} de ${facturas.length} resultados`;
            }
        }
        
    } catch (error) {
        console.error('Error al cargar facturas:', error);
        
        const tablaBody = document.getElementById('tabla-facturas-body');
        if (tablaBody) {
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar facturas</td></tr>';
        }
    }
}

// Función para mostrar/ocultar el detalle de una factura
function toggleFacturaDetalle(facturaId) {
    const detalleRow = document.getElementById(`detalle-factura-${facturaId}`);
    if (detalleRow) {
        const boton = event.target.closest('button');
        const icono = boton.querySelector('i');
        
        // Verificar el estado ANTES del toggle para saber qué acción se va a realizar
        const estaVisible = detalleRow.classList.contains('show');
        
        // Usar Bootstrap collapse
        const bsCollapse = new bootstrap.Collapse(detalleRow, {
            toggle: true
        });
        
        // Cambiar el icono según la acción que se realizó
        if (estaVisible) {
            // Si estaba visible, ahora se va a ocultar -> mostrar ojo normal
            icono.classList.remove('bi-eye-slash');
            icono.classList.add('bi-eye');
            boton.setAttribute('title', 'Ver detalles');
        } else {
            // Si estaba oculto, ahora se va a mostrar -> mostrar ojo tachado
            icono.classList.remove('bi-eye');
            icono.classList.add('bi-eye-slash');
            boton.setAttribute('title', 'Ocultar detalles');
        }
    }
}

// Función para eliminar una factura
async function eliminarFactura(facturaId) {
    try {
        const result = await Swal.fire({
            title: '¿Estás seguro de eliminar la factura?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: 'var(--color-surface)', // Usa el color de tu proyecto
            color: 'var(--color-text)' // Color del texto
        });
        
        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Eliminando...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Aquí deberías hacer la llamada a tu API para eliminar la factura
            const url = `https://localhost:7169/api/Invoices/${facturaId}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Mostrar éxito y recargar las facturas
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminada!',
                    text: 'La factura ha sido eliminada correctamente.',
                    confirmButtonColor: '#28a745',
                    background: 'var(--color-surface)', // Usa el color de tu proyecto
                    color: 'var(--color-text)' // Color del texto
                }).then(() => {
                    // Recargar la tabla de facturas
                    cargarFacturas();
                });
            } else {
                throw new Error('Error al eliminar la factura');
            }
        }
        
    } catch (error) {
        console.error('Error al eliminar factura:', error);
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al eliminar la factura. Intenta nuevamente.',
            confirmButtonColor: '#dc3545'
        });
    }
}
