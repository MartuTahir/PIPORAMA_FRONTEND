    

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
                    <button class="btn btn-sm btn-outline-info me-1"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger me-1"><i class="bi bi-trash"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-eye"></i></button>
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
                    <button class="btn btn-sm btn-outline-info me-1"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger me-1"><i class="bi bi-trash"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-eye"></i></button>
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

            const nuevoCliente = {
                nombre: document.getElementById('cliente-nombre').value,
                apellido: document.getElementById('cliente-apellido').value,
                dniCliente: document.getElementById('cliente-dni').value,
                activo: document.getElementById('cliente-activo').value === 'true',
                idBarrio: parseInt(document.getElementById('cliente-barrio').value),
                idTipoCliente: parseInt(document.getElementById('cliente-tipo').value),
                contacto : {
                    descripcion : document.getElementById('cliente-contacto').value,
                    idTipoContacto : parseInt(document.getElementById('cliente-tipo-contacto').value)
                }
            };
            if(!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.dniCliente || isNaN(nuevoCliente.idBarrio) || isNaN(nuevoCliente.idTipoCliente) || !nuevoCliente.contacto.descripcion || isNaN(nuevoCliente.contacto.idTipoContacto)){
                alert('Por favor, complete todos los campos obligatorios.');
                return;
            }
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
                alert('¡Cliente agregado con éxito!');
                navigateTo('clientes');

            }catch(error){
                console.error('Error al agregar cliente:', error);
                alert('Error al agregar el cliente. Por favor, intente nuevamente.');
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