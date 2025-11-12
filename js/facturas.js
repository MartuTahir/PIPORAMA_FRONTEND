// Array que almacena los items que se van agregando a la factura (tickets, consumibles, combos)
let carritoDetalles = []
// Configura todos los event listeners y carga inicial del formulario de facturas
// Esta función se ejecuta cuando se carga la página de facturas por primera vez
// Se encarga de:
// - Inicializar el carrito de detalles
// - Configurar la fecha actual por defecto
// - Cargar todos los combos (select) con datos de la API
// - Configurar los event listeners para el formulario y sus campos
async function setupFormFacturaListeners() {
    const formFactura = document.getElementById('form-agregar-factura');
    const fechaInput = document.getElementById('factura-fecha');
    const elementoCarrito = document.getElementById('tabla-detalles-body');
    carritoDetalles = [];//Arreglo donde voy a guardar todos los items
    if(elementoCarrito) {
        renderizarCarrito(); 
    }

    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;//Fecha actual por defecto
    }
    
    if (formFactura && !formFactura.dataset.listenerAgregado) {
        
        console.log("Configurando formulario de facturas...");
        const urlBase = 'https://localhost:7169/api/Additionals/';
        const urlBasePersonas = 'https://localhost:7169/api/';
        // --- Carga de Combos (Encabezado y Detalles) ---
        cargarCombosPersonas(`${urlBasePersonas}Clients`, 'factura-dni-cliente', 'dniCliente', 'nombre', 'apellido', 'Seleccione un Cliente...');
        cargarCombosPersonas(`${urlBasePersonas}Employees`, 'factura-dni-empleado', 'dniEmpleado', 'nomEmpleado', 'apeEmpleado', 'Seleccione un Empleado...');
        cargarCombos(`${urlBase}medios-pago`, 'factura-metodo-pago', 'medioPago', 'medioPago', 'Seleccione Método...');
        cargarCombos(`${urlBase}estados-compra`, 'factura-estado', 'descripcion', 'descripcion', 'Seleccione Estado...');
        cargarCombos(`${urlBase}formas-compra`, 'factura-forma-compra', 'formaCompra1', 'formaCompra1', 'Seleccione Forma...');
        cargarCombosPromociones(`${urlBase}promociones`, 'detalle-promocion', 'idPromocion', 'descripcion', 'Sin promoción...');
        cargarCombosPrecios(`${urlBase}consumibles`, 'consumible-descripcion', 'nomConsumible', 'nomConsumible','preUnitario' ,'Seleccione Consumible...');
        cargarCombosPrecios(`${urlBase}combos`, 'combo-descripcion', 'nomCombo', 'nomCombo', 'precioCombo', 'Seleccione Combo...'); // (Asumiendo 'preCombo')
        
        try {
            const response = await fetch(`${urlBase}funciones`);//Agarra todas las funciones
            if (!response.ok) throw new Error('No se pudieron cargar las funciones');
            
            todasLasFunciones = await response.json(); // Guarda la lista global
            
            // Llama a la nueva función para poblar el combo de funciones
            poblarFuncionesCombo(todasLasFunciones, 'ticket-funcion', 'Seleccione Función...');

        } catch (error) {
            console.error("Error crítico al cargar funciones:", error);
        }

        // --- "Engancha" todos los listeners ---
        formFactura.addEventListener('submit', async function(e) { e.preventDefault(); await guardarFactura(); });//Listener para guardar la factura
        
        //Listener para mostrar/ocultar secciones según el tipo de item seleccionado de manera dinámica
        document.getElementById('detalle-tipo-item')?.addEventListener('change', () => {
                document.querySelectorAll('.detalle-seccion').forEach(seccion => { seccion.style.display = 'none'; });
                const seccionVisible = document.getElementById(`form-seccion-${document.getElementById('detalle-tipo-item').value}`);
                if (seccionVisible) { seccionVisible.style.display = 'block'; }
        });
        
        //Estas lineas de abajo sirven para actualizar el precio cuando se selecciona una funcion o un consumible/combo y para buscar asientos
        document.getElementById('ticket-funcion')?.addEventListener('change', buscarAsientos); 
        document.getElementById('btn-agregar-item')?.addEventListener('click', agregarItemAlCarrito);
        document.getElementById('factura-dni-cliente')?.addEventListener('blur', async function() { await validarDniCliente(this.value); });
        document.getElementById('factura-dni-empleado')?.addEventListener('blur', async function() { await validarDniEmpleado(this.value); });
        document.getElementById('consumible-descripcion')?.addEventListener('change', (e) => actualizarPrecio(e.target, 'consumible-precio'));
        document.getElementById('combo-descripcion')?.addEventListener('change', (e) => actualizarPrecio(e.target, 'combo-precio'));
        
        formFactura.dataset.listenerAgregado = 'true';//Marca que ya se agregó el listener
    }
}

//Funcion para agregar un item al carrito de detalles
// Agrega un nuevo item al carrito de la factura
// Maneja la lógica para agregar tickets, consumibles o combos
// Valida los datos ingresados y aplica promociones si corresponde
// Actualiza la vista del carrito después de agregar el item
function agregarItemAlCarrito() {
    // Obtener el tipo de item seleccionado (ticket/consumible/combo)
    const tipoItem = document.getElementById('detalle-tipo-item').value;
    const promoSelect = document.getElementById('detalle-promocion');//Promoción seleccionada
    const promoOpcion = promoSelect.options[promoSelect.selectedIndex];//Opción seleccionada de promoción

    let nuevoItem = {//Nuevo item por defecto
        Price: 0,
        Consumable: null,
        Combo: null,
        Ticket: null,
        Promotion: null,
        _tipoDisplay: tipoItem.charAt(0).toUpperCase() + tipoItem.slice(1),
        _descripcionDisplay: '',//Para mostrar en la tabla
        _detallesDisplay: ''//Para mostrar en la tabla
    };
    let precioOriginal = 0;


    if (tipoItem === 'consumible') {
        const select = document.getElementById('consumible-descripcion');//Consumible seleccionado
        const descripcion = select.value;//Descripción del consumible seleccionado
        precioOriginal = parseFloat(document.getElementById('consumible-precio').value);//Precio del consumible
        if (!descripcion || isNaN(precioOriginal) || precioOriginal <= 0) {
            Swal.fire({icon: 'warning', title: 'Datos incompletos', text: 'Seleccione un consumible y verifique su precio.', background: '#1e1d2c', color: '#ffffff'});
            return;
        }
        nuevoItem.Consumable = descripcion;//Asigna el consumible al nuevo item
        nuevoItem._descripcionDisplay = descripcion;

    } else if (tipoItem === 'ticket') {
        precioOriginal = parseFloat(document.getElementById('ticket-precio').value);
        
        const selectFuncion = document.getElementById('ticket-funcion');//Función seleccionada
        const funcionSeleccionada = selectFuncion.options[selectFuncion.selectedIndex];//Opción seleccionada de la lista de funciones
        const selectAsiento = document.getElementById('ticket-asiento');//Asiento seleccionado
        const asientoSeleccionado = selectAsiento.options[selectAsiento.selectedIndex];//Opción seleccionada de la lista de asientos

        // Validación
        if (isNaN(precioOriginal) || precioOriginal <= 0 || !funcionSeleccionada.value || !asientoSeleccionado.value) {
            Swal.fire({icon: 'warning', title: 'Datos incompletos', text: 'Debe seleccionar una Función, un Asiento e ingresar un Precio.', background: '#1e1d2c', color: '#ffffff'});
            return;
        }
        
        // Arma el objeto anidado (leyendo los 'data-attributes' de las opciones)
        
        nuevoItem.Ticket = {
            Function: {
                functionDate: funcionSeleccionada.dataset.fechaCompleta,
                film: funcionSeleccionada.dataset.film,
                room: funcionSeleccionada.dataset.room
            },
            Seat: {
                seatRow: asientoSeleccionado.dataset.fila,
                seatNumber: parseInt(asientoSeleccionado.dataset.numero)
            }
        };
        nuevoItem._descripcionDisplay = `Entrada: ${funcionSeleccionada.dataset.film}`;//Descripción del ticket
        nuevoItem._detallesDisplay = `Sala: ${funcionSeleccionada.dataset.room}, Fila: ${asientoSeleccionado.dataset.fila}, Asiento: ${asientoSeleccionado.dataset.numero}`;//Detalles del ticket

    } else if (tipoItem === 'combo') {//Logica similar a los consumibles

        const select = document.getElementById('combo-descripcion');
        const descripcion = select.value;
        precioOriginal = parseFloat(document.getElementById('combo-precio').value);
        if (!descripcion || isNaN(precioOriginal) || precioOriginal <= 0) {
            Swal.fire({icon: 'warning', title: 'Datos incompletos', text: 'Seleccione un combo y verifique su precio.', background: '#1e1d2c', color: '#ffffff'});
            return;
        }
        nuevoItem.Combo = descripcion;
        nuevoItem._descripcionDisplay = descripcion;
    
    } else {
        Swal.fire({icon: 'info', title: 'Seleccione un tipo', text: 'Primero debe seleccionar un tipo de ítem.', background: '#1e1d2c', color: '#ffffff'});
        return;
    }

    if (promoOpcion && promoOpcion.value) {//Logica para aplicar descuento si hay promoción seleccionada
        const descuento = parseFloat(promoOpcion.dataset.descuento) || 0;
        const precioFinal = precioOriginal * (1 - (descuento / 100));
        nuevoItem.Price = precioFinal;
        nuevoItem.Promotion = {
            description: promoOpcion.dataset.descripcion,
            discountPercentage: descuento
        };
    } else {
        nuevoItem.Price = precioOriginal;
    }

    carritoDetalles.push(nuevoItem);//Agrega el nuevo item al carrito
    renderizarCarrito();//Actualiza la vista del carrito
    
    //Esto lo que hace es resetear el formulario de detalles después de agregar un item
    document.getElementById('detalle-tipo-item').value = "";
    document.querySelectorAll('.detalle-seccion').forEach(s => {
        s.style.display = 'none';
        // ... (reseteo de inputs) ...
   });
    document.getElementById('detalle-promocion').value = "";
}


// Actualiza la vista del carrito en la tabla de detalles
// Muestra cada item con su tipo, descripción, promoción y precio
// Calcula y actualiza el total de la factura
// Si el carrito está vacío, muestra un mensaje indicándolo
function renderizarCarrito() {
    const tablaBody = document.getElementById('tabla-detalles-body');
    const inputTotal = document.getElementById('factura-total');
    
    tablaBody.innerHTML = '';
    
    // Si no hay items, no te deja agregar nada
    if (carritoDetalles.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Aún no hay ítems...</td></tr>';
        inputTotal.value = "0.00";
        return;
    }

    let totalCalculado = 0;

    // Recorre cada item y lo agrega a la tabla    
    carritoDetalles.forEach((item, index) => {
        const promoTexto = item.Promotion ? `<span class="badge bg-success">${item.Promotion.description}</span>` : '<span class="text-muted">-</span>';
        
        const fila = `
            <tr>
                <td>${item._tipoDisplay}</td>
                <td>${item._descripcionDisplay}</td>
                <td class="small">${item._detallesDisplay || '<span class="text-muted">-</span>'}</td>
                <td>${promoTexto}</td>
                <td class="fw-bold">$${item.Price.toFixed(2)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removerItemDelCarrito(${index})">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </td>
            </tr>
        `;
        tablaBody.innerHTML += fila;
        totalCalculado += item.Price;//Suma el precio al total
    });

    inputTotal.value = totalCalculado.toFixed(2);//Actualiza el total en el input
}

function removerItemDelCarrito(index) {
    carritoDetalles.splice(index, 1); // Elimina el ítem del array por su índice
    renderizarCarrito(); // Vuelve a dibujar la tabla y recalcular el total
}

// Función genérica para cargar datos en los combos (select) desde la API
// Parámetros:
// - url: endpoint de la API para obtener los datos
// - selectId: id del elemento select en el HTML
// - valorCampo: nombre del campo que se usará como value en las options
// - textoCampo: nombre del campo que se mostrará como texto en las options
// - textoDefault: texto para la opción por defecto
async function cargarCombos(url, selectId, valorCampo, textoCampo, textoDefault = "Seleccione una opcion..."){
    const select = document.getElementById(selectId);//El id de la tabla a la que va a hacer select
    if (!select) {
        return
    };
    select.disabled = true;
    select.innerHTML = `<option value="">Cargando...</option>`;
    try {
        const response = await fetch(url);//Hace fetch a la url correspondiente
        if(!response.ok) {
            throw new Error(`Error: ${response.status} al cargar ${selectId}`);
        }
        const data = await response.json();
        select.innerHTML = '';

        const opcionDefault = document.createElement('option');
        opcionDefault.value = '';
        opcionDefault.textContent = textoDefault;//Texto default dependiendo del combobox
        select.appendChild(opcionDefault);

        data.forEach(item => {//Carga el combo
            const opcion = document.createElement('option');
            opcion.value = item[valorCampo];
            opcion.textContent = item[textoCampo];
            select.appendChild(opcion);
        });
        
    }catch(error) {
        console.error(`Error al cargar ${selectId}:`, error);
        select.innerHTML = `<option value="">Error al cargar</option>`;
    }finally{
        select.disabled = false;
    }
}

async function cargarCombosPromociones(url, selectId, valorCampo, textoCampo, textoDefault) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.disabled = true;
    select.innerHTML = `<option value="">Cargando...</option>`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) { throw new Error(`Error al cargar ${selectId}`); }
        const data = await response.json();
        
        select.innerHTML = '';
        
        const opcionDefault = document.createElement('option'); 
        opcionDefault.value = ""; 
        opcionDefault.textContent = textoDefault; 
        select.appendChild(opcionDefault);//Agrega una opción por defecto

        data.forEach(item => {
            const opcion = document.createElement('option');
            opcion.value = item[valorCampo]; 
            opcion.textContent = item[textoCampo]; 
            
            opcion.dataset.descuento = item.valorDescuento; 
            opcion.dataset.descripcion = item[textoCampo];
            
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error(`Error al cargar ${selectId}:`, error);
        select.innerHTML = `<option value="">Error al cargar</option>`;
    } finally {
        select.disabled = false;
    }
}


async function cargarCombosPrecios(url, selectId, valorCampo, textoCampo, precioCampo, textoDefault = "Seleccione una opcion...") {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.disabled = true;
    select.innerHTML = `<option value="">Cargando...</option>`;
    try {
        const response = await fetch(url);
        if (!response.ok) { throw new Error(`Error al cargar ${selectId}`); }
        const data = await response.json();
        select.innerHTML = '';
        const opcionDefault = document.createElement('option');
        opcionDefault.value = "";
        opcionDefault.textContent = textoDefault;
        opcionDefault.dataset.precio = "0";
        select.appendChild(opcionDefault);
        data.forEach(item => {
            const opcion = document.createElement('option');
            opcion.value = item[valorCampo]; 
            opcion.textContent = item[textoCampo];
            opcion.dataset.precio = item[precioCampo]; 
            select.appendChild(opcion);
        });
    } catch (error) { console.error(`Error al cargar ${selectId}:`, error); }
    finally { select.disabled = false; }
}

async function cargarCombosPersonas(url, selectId, propDni, propNombre, propApellido, textoDefault) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.disabled = true;
    select.innerHTML = `<option value="">Cargando...</option>`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) { throw new Error(`Error al cargar ${selectId}`); }
        const data = await response.json();
        
        select.innerHTML = '';
        select.appendChild(new Option(textoDefault, '')); // Opción default

        data.forEach(item => {
            const opcion = document.createElement('option');
            
            opcion.value = item[propDni]; 
            
            opcion.textContent = `${item[propNombre]} ${item[propApellido]} (${item[propDni]})`; 
            
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error(`Error al cargar ${selectId}:`, error);
        select.innerHTML = `<option value="">Error al cargar</option>`;
    } finally {
        select.disabled = false;
    }
}

function poblarFuncionesCombo(funciones, selectId, textoDefault) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '';
    select.appendChild(new Option(textoDefault, ''));//Opción por defecto 

    funciones.forEach(func => {
        const opcion = document.createElement('option');
        const fechaHora = new Date(func.functionDate);
        const textoOpcion = `${func.film} - ${func.room} - ${fechaHora.toLocaleDateString('es-AR')} ${fechaHora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;

        opcion.value = func.idFuncion; // El valor es el ID
        opcion.textContent = textoOpcion; // El texto es "Pelicula - Sala - Hora"
        
        opcion.dataset.film = func.film;
        opcion.dataset.room = func.room;
        opcion.dataset.precio = func.precio;
        opcion.dataset.fechaCompleta = func.functionDate;

        select.appendChild(opcion);
    });
    select.disabled = false;
}


function actualizarPrecio(selectElement, inputPrecioId) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const precio = selectedOption.dataset.precio || 0;
    document.getElementById(inputPrecioId).value = parseFloat(precio).toFixed(2);
}

// Busca y carga los asientos disponibles para una función seleccionada
// Se ejecuta cuando el usuario selecciona una función en el combo
// Actualiza el combo de asientos y el precio del ticket
// Deshabilita el combo de asientos mientras se cargan los datos
async function buscarAsientos() {
    const selectFuncion = document.getElementById('ticket-funcion');
    const selectAsiento = document.getElementById('ticket-asiento');
    const inputPrecio = document.getElementById('ticket-precio');
    
    const funcionSeleccionada = selectFuncion.options[selectFuncion.selectedIndex];
    
    if (!funcionSeleccionada || !funcionSeleccionada.value) {
        
        selectAsiento.innerHTML = '<option value="">Seleccione función...</option>';
        selectAsiento.disabled = true;
        return;
    }

    const precioFuncion = parseFloat(funcionSeleccionada.dataset.precio || 0).toFixed(2);
    const idFuncion = funcionSeleccionada.value;

    inputPrecio.value = precioFuncion;
    
    selectAsiento.disabled = true;
    selectAsiento.innerHTML = '<option value="">Buscando asientos...</option>';
    
    try {
        const url = `https://localhost:7169/api/Additionals/Asientos/disponibles/${idFuncion}`;
        const response = await fetch(url);
        if (!response.ok) { throw new Error('No se encontraron asientos'); }
        const asientos = await response.json();
        
        selectAsiento.innerHTML = '';
        selectAsiento.appendChild(new Option('Seleccione un asiento...', ''));
        
        asientos.forEach(asiento => {
            const opcion = document.createElement('option');//Crea una opción por cada asiento
            opcion.value = asiento.idAsiento // Valor "F-12"
            opcion.textContent = `Fila: ${asiento.seatRow}, Asiento: ${asiento.seatNumber}`;
            opcion.dataset.fila = asiento.seatRow;
            opcion.dataset.numero = asiento.seatNumber;
            selectAsiento.appendChild(opcion);
        });
        selectAsiento.disabled = false;
    } catch (error) {
        console.error(error);
        selectAsiento.innerHTML = '<option value="">Error al cargar asientos</option>';
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

    //Valores crudos para validaciones
    const dniClientVal = document.getElementById('factura-dni-cliente').value;
    const dniEmpleadoVal = document.getElementById('factura-dni-empleado').value;
    const fechaVal = document.getElementById('factura-fecha').value;
    const metodoPagoVal = document.getElementById('factura-metodo-pago').value;
    const estadoVal = document.getElementById('factura-estado').value;
    const formaCompraVal = document.getElementById('factura-forma-compra').value;
    const totalFactura = parseFloat(document.getElementById('factura-total').value) || 0;

    //error por defecto
    const mostrarError = (titulo, texto) => {
        Swal.fire({
            icon: 'warning',
            title: titulo,
            text: texto,
            background: '#1e1d2c', // Tu tema oscuro
            color: '#ffffff',
            confirmButtonColor: '#d33' // Color rojo
        });
    };
    
    try {
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
        btnSubmit.disabled = true;


        if (!dniClientVal) {
            mostrarError('Campo Requerido', 'El DNI del Cliente es obligatorio.');
            return;
        }

        if (!dniEmpleadoVal) {
            mostrarError('Campo Requerido', 'El DNI del Empleado es obligatorio.');
            return;
        }

        if (!fechaVal) {
            mostrarError('Campo Requerido', 'La Fecha es obligatoria.');
            return;
        }

        const hoy = new Date().toISOString().split('T')[0];
        if (fechaVal > hoy) {
            mostrarError('Fecha Inválida', 'La fecha de la factura no puede ser posterior al día de hoy.');
            return;
        }


        if (!metodoPagoVal) {
            mostrarError('Campo Requerido', 'Debe seleccionar un Método de Pago.');
            return;
        }

        if (!estadoVal) {
            mostrarError('Campo Requerido', 'Debe seleccionar un Estado.');
            return;
        }

        if (!formaCompraVal) {
            mostrarError('Campo Requerido', 'Debe seleccionar una Forma de Compra.');
            return;
        }


        if (carritoDetalles.length === 0) {
        mostrarError('Factura Vacía', 'No se puede guardar una factura sin ítems. Por favor, agregue al menos un detalle.');
        return; // Detiene la función
        }

        if (totalFactura <= 0) {
            mostrarError('Total Inválido', 'El total de la factura debe ser mayor a cero.');
            return; 
        }

        

        // Obtener datos del formulario
        const facturaData = {
            DniClient: document.getElementById('factura-dni-cliente').value,
            DniEmployee: document.getElementById('factura-dni-empleado').value,
            InvoiceDate: document.getElementById('factura-fecha').value,
            PaymentMethod: document.getElementById('factura-metodo-pago').value,
            PurchaseStatus: document.getElementById('factura-estado').value,
            PurchaseForm: document.getElementById('factura-forma-compra').value,
            DetailInvoices : carritoDetalles
        };

        // Validar campos requeridos
        if (!facturaData.DniClient || !facturaData.DniEmployee || !facturaData.InvoiceDate) {
            throw new Error('Por favor complete todos los campos obligatorios');
        }

        try{
            const url = 'https://localhost:7169/api/Invoices'
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(facturaData)
            });
            if (!response.ok) {
                throw new Error('Error al guardar la factura');
            }
            Swal.fire({
                title: "Éxito",
                text: "Factura registrada con éxito.",
                icon: "success",
                background: '#1e1d2c', color: '#ffffff'
            });
            navigateTo('facturas');
        }catch(error){
            throw new Error('Error al guardar la factura');
        }
        
        
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
                                            <p class="fs-6"><strong>Total:</strong> $${factura.detailInvoices.reduce((total, item) => total + parseFloat(item.price || 0), 0).toFixed(2)}</p>
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
                                            <p class="fs-6"><strong>Total:</strong> $${factura.detailInvoices.reduce((total, item) => total + parseFloat(item.price || 0), 0).toFixed(2)}</p>
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
