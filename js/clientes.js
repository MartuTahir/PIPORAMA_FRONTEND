    

    async function cargarClientes() {
        const tabla = document.getElementById('tabla-clientes-body');

        
        tabla.innerHTML = '<tr><td colspan="5" class="text-center">Cargando clientes...</td></tr>';

        try {
            const url = 'https://localhost:7169/api/Clients';
            const response = await fetch(url);
            if (!response.ok){
                throw new Error(`Error: ${response.status} - No se pudo conectar a la API`);
            }
            const clientes = await response.json();
            tabla.innerHTML = '';

            if(clientes.length ===0){
                tabla.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron clientes.</td></tr>';
                return;
            }
            document.getElementById('total-clientes').textContent = `Mostrando ${clientes.length} de ${clientes.length} resultados`;

            clientes.forEach(cliente => {
                const estado = cliente.activo
                ? '<span class="badge bg-success">Activo</span>'
                : '<span class="badge bg-danger">Inactivo</span>';

                const fila = `
                <tr>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.apellido}</td>
                    <td>${cliente.dniCliente}</td>
                    <td>${estado}</td> 
                    <td>
                    <button class="btn btn-sm btn-outline-info me-1 btn-editar"
                    data-codigo="${cliente.codigo}"
                    data-dni="${cliente.dniCliente}">
                    <i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger me-1 btn-eliminar" 
                    data-codigo="${cliente.codigo}"
                    data-dni="${cliente.dniCliente}"
                    data-nombre="${cliente.nombre} ${cliente.apellido}">
                    <i class="bi bi-trash"></i></button>
                    <button class="btn btn-sm btn-outline-success btn-alta" 
                    data-codigo="${cliente.codigo}"
                    data-dni="${cliente.dniCliente}">
                    <i class="bi bi-plus-circle"></i></button>
                    </td>
                </tr>
                `;

                tabla.innerHTML += fila 
            });
        }catch(error)
        {
            tabla.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar: ${error.message}</td></tr>`;
            console.error('Error en funcion cargarClientes',error)
        }

    }

    async function buscarClientePorDNI(dni) {
        const tabla = document.getElementById('tabla-clientes-body');

        tabla.innerHTML = '<tr><td colspan="5" class="text-center">Buscando cliente...</td></tr>';

        try {
            const url = `https://localhost:7169/api/Clients/${dni}`;
            const response = await fetch(url);
            if (!response.ok){
                throw new Error(`No se encontró el cliente con DNI ${dni}`);
            }
            const cliente = await response.json();
            tabla.innerHTML = '';
            if(!cliente){
                tabla.innerHTML = '<tr><td colspan="5" class="text-center">No se encontró ningún cliente con ese DNI.</td></tr>';
                return;
            }
            const estado = cliente.activo
                ? '<span class="badge bg-success">Activo</span>'
                : '<span class="badge bg-danger">Inactivo</span>';
            const fila = `
                <tr>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.apellido}</td>
                    <td>${cliente.dniCliente}</td>
                    <td>${estado}</td>
                    <td>
                    <button class="btn btn-sm btn-outline-info me-1" 
                    data-codigo="${cliente.codigo}" data-dni="${cliente.dniCliente}">
                    <i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger me-1" 
                    data-codigo="${cliente.codigo}" data-dni="${cliente.dniCliente}" data-nombre="${cliente.nombre} ${cliente.apellido}">
                    <i class="bi bi-trash"></i></button>
                    <button class="btn btn-sm btn-outline-secondary" 
                    data-codigo="${cliente.codigo}" data-dni="${cliente.dniCliente}">
                    <i class="bi bi-eye"></i></button>
                    </td>
                </tr>
            `;
            tabla.innerHTML += fila;
            document.getElementById('total-clientes').textContent = `Mostrando 1 de 1 resultados`;
        }catch(error)
        {
            tabla.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al buscar: ${error.message}</td></tr>`;
            console.error('Error en funcion buscarClientePorDNI',error)
        }
}

function setupClientesListeners() {
    
    
    const botonBuscar = document.getElementById('boton-buscar');
    const inputBuscar = document.getElementById('buscar-cliente');

    if (botonBuscar && inputBuscar && !botonBuscar.dataset.listenerAgregado) {

        const realizarBusqueda = () => {
            const dni = inputBuscar.value.trim();
            if (dni) {
                buscarClientePorDNI(dni); // Busca por dni
            } else {
                cargarClientes(); // Si está vacío, recarga todos
            }
        };

        botonBuscar.addEventListener('click', realizarBusqueda);

        //El keyup sirve para detectar cuando se presiona una tecla
        inputBuscar.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') { //si se toca enter cuenta como click en buscar
                realizarBusqueda();
            }
        });

        //si se borra el input, recarga todos los clientes
        inputBuscar.addEventListener('input', () => {
            if (inputBuscar.value.trim() === '') {
                cargarClientes();
            }
        });

        //Marca el botón para evitar agregar el listener múltiples veces
        botonBuscar.dataset.listenerAgregado = 'true'; 
    }
    const botonAgregar = document.getElementById('boton-agregar-cliente');
    if(botonAgregar && !botonAgregar.dataset.listenerAgregado){
        botonAgregar.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('formCliente');
        });
        botonAgregar.dataset.listenerAgregado = 'true';
    }
    const tabla = document.getElementById('tabla-clientes-body');
    if(tabla && !tabla.dataset.listenerAgregado){
        tabla.addEventListener('click', (e) => {
        const botonEliminar = e.target.closest('.btn-eliminar');
        if(botonEliminar){
            const codigo = botonEliminar.dataset.codigo;
            const dni = botonEliminar.dataset.dni;
            const nombre = botonEliminar.dataset.nombre;
            eliminarCliente(codigo,dni, nombre);

        }
        const botonAlta = e.target.closest('.btn-alta');
        if(botonAlta){
            const codigo = botonAlta.dataset.codigo;
            const dni = botonAlta.dataset.dni;
            const nombre = botonAlta.dataset.nombre;
            darClienteDeAlta(codigo,dni, nombre);
        }
        });
        tabla.dataset.listenerAgregado = 'true';
    }
}

/*
*@param {string} dni
*@param {string} nombre
*/ 
async function eliminarCliente(codigo, dni, nombre) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Querés dar de baja a ${nombre} (DNI: ${dni})? Esta acción cambiará su estado a Inactivo.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, dar de baja',
        cancelButtonText: 'Cancelar',
        background: '#1e1d2c', 
        color: '#ffffff',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then(async (result) => {
        
        if (result.isConfirmed) {
            try {
                const url = `https://localhost:7169/api/Clients/${codigo}`;
                
                const response = await fetch(url, {
                    method: 'DELETE', // O 'PATCH' o 'DELETE', según tu API
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo dar de baja al cliente.`);
                }

                // 3. Si todo salió bien, muestra éxito y recarga la tabla
                Swal.fire({
                    title: '¡Baja Exitosa!',
                    text: `${nombre} ha sido marcado como Inactivo.`,
                    icon: 'success',
                    background: '#1e1d2c',
                    color: '#ffffff',
                    timer: 2000,
                    showConfirmButton: false
                });

                cargarClientes(); // ¡Recarga la tabla para ver el cambio!

            } catch (error) {
                console.error('Error en la baja lógica:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo completar la operación. ' + error.message,
                    icon: 'error',
                    background: '#1e1d2c',
                    color: '#ffffff'
                });
            }
        }
    });
}

async function darClienteDeAlta(codigo, dni, nombre) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Querés dar de alta a ${nombre} (DNI: ${dni})? Esta acción cambiará su estado a Activo.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, dar de alta',
        cancelButtonText: 'Cancelar',
        background: '#1e1d2c', 
        color: '#ffffff',
        confirmButtonColor: 'rgba(0, 255, 76, 1)',
        cancelButtonColor: '#3085d6'
    }).then(async (result) => {
        
        if (result.isConfirmed) {
            try {
                const url = `https://localhost:7169/api/Clients/${codigo}`;
                const response = await fetch(url, {
                    method: 'PUT', // O 'PATCH' o 'DELETE', según tu API
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo dar de alta al cliente.`);
                }
                Swal.fire({
                    title: '¡Alta Exitosa!',
                    text: `${nombre} ha sido marcado como Activo.`,
                    icon: 'success',
                    background: '#1e1d2c',
                    color: '#ffffff',
                    timer: 2000,
                    showConfirmButton: false
                });

                cargarClientes(); // ¡Recarga la tabla para ver el cambio!
            } catch (error) {
                console.error('Error en la alta lógica:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo completar la operación. ' + error.message,
                    icon: 'error',
                    background: '#1e1d2c',
                    color: '#ffffff'
                });
            }
        }
    });
}



function setupFormClienteListeners() {
    const formAgregarCliente = document.getElementById('form-agregar-cliente');
    if(formAgregarCliente && !formAgregarCliente.dataset.listenerAgregado){
        const urlBase = 'https://localhost:7169/api/Additionals/';    
        cargarCombos(`${urlBase}Barrios`, 'cliente-barrio', 'idBarrio', 'descripcion', 'Seleccione un barrio...');
        cargarCombos(`${urlBase}Tipos-Cliente`, 'cliente-tipo', 'idTipoCliente', 'tipoCliente', 'Seleccione un tipo de cliente...');
        cargarCombos(`${urlBase}Tipos-Contacto`, 'cliente-tipo-contacto', 'idTipoContacto', 'descripcion', 'Seleccione un tipo de contacto...');
        
        formAgregarCliente.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const regexSoloNumeros = /^[0-9]+$/;
            const regexSoloLetras = /^[a-zA-ZÀ-ÿ\s']+$/;

            //Valores crudos de los inputs
            const dniInput = document.getElementById('cliente-dni').value;
            const nombreInput = document.getElementById('cliente-nombre').value;
            const apellidoInput = document.getElementById('cliente-apellido').value;
            const contactoDesc = document.getElementById('cliente-contacto').value;
            const idBarrioVal = parseInt(document.getElementById('cliente-barrio').value);
            const idTipoClienteVal = parseInt(document.getElementById('cliente-tipo').value);
            const idTipoContactoVal = parseInt(document.getElementById('cliente-tipo-contacto').value);
            //Validaciones
            if(!regexSoloLetras.test(nombreInput)){
                Swal.fire({
                    icon: "warning",
                    title: "Nombre inválido",
                    text: "El nombre debe contener solo letras y espacios.",
                });
                return;
            }

            if(!regexSoloLetras.test(apellidoInput)){
                Swal.fire({
                    icon: "warning",
                    title: "Apellido inválido",
                    text: "El apellido debe contener solo letras y espacios.",
                });
                return;
            }

            if(!regexSoloNumeros.test(dniInput)){
                Swal.fire({
                    icon: "warning",
                    title: "DNI inválido",
                    text: "El DNI debe contener solo números.",
                });
                return;
            }
            

            if (isNaN(idBarrioVal) || isNaN(idTipoClienteVal) || !contactoDesc || isNaN(idTipoContactoVal)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor, complete todos los campos obligatorios (barrio, tipo, contacto, etc.).',
                    background: '#1e1d2c', color: '#ffffff'
                });
                return;
            }
            
            

            
            const nuevoCliente = {
                nombre: nombreInput,
                apellido: apellidoInput,
                dniCliente: dniInput,
                activo: document.getElementById('cliente-activo').value === 'true',
                idBarrio: idBarrioVal,
                idTipoCliente: idTipoClienteVal,
                contacto : {
                    descripcion : contactoDesc,
                    idTipoContacto : idTipoContactoVal
                }
            };
            
            console.log("Enviando cliente:", nuevoCliente);
            try{
                const url = 'https://localhost:7169/api/Clients';
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoCliente)
                });
                if(!response.ok){
                    throw new Error(`Fallo el post del cliente: ${response.status}`);
                }
                const clienteCreado = await response.json();
                console.log('Cliente creado:', clienteCreado);
                Swal.fire({
                    title: "Éxito",
                    text: "Cliente agregado con éxito.",
                    icon: "success"
                });
                navigateTo('clientes');

            }catch(error){
                console.error('Error al agregar cliente:', error);
                Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error al agregar el cliente: " + error.message,
                });
            }
    });
        formAgregarCliente.dataset.listenerAgregado = 'true';
}

/*
* @param {string} url
* @param {string} selectId
* @param {string} valorCampo
* @param {string} textoCampo
* @param {string} textoDefault
*/

async function cargarCombos(url, selectId, valorCampo, textoCampo, textoDefault = "Seleccione una opcion...") {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.disabled = true;
    select.innerHTML = `<option value="">Cargando...</option>`;
    try {
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Error: ${response.status} al cargar ${selectId}`);
        }
        const data = await response.json();
        select.innerHTML = '';

        const opcionDefault = document.createElement('option');
        opcionDefault.value = '';
        opcionDefault.textContent = textoDefault;
        select.appendChild(opcionDefault);

        data.forEach(item => {
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
}}