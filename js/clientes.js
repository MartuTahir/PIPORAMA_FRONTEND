    

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
}