let dniClienteEditar = null; //Variable para usar mas tarde en metodos que necesitan traer clientes

//Funcion para cargar tabla
async function cargarClientes() {
        const tabla = document.getElementById('tabla-clientes-body');

        tabla.innerHTML = '<tr><td colspan="5" class="text-center">Cargando clientes...</td></tr>';//Texto por defecto

        try {
            const url = 'https://localhost:7169/api/Clients';
            const response = await fetch(url);
            if (!response.ok){
                throw new Error(`Error: ${response.status} - No se pudo conectar a la API`);
            }
            const clientes = await response.json();
            tabla.innerHTML = '';//Se limpia la tabla antes de cargar datos

            if(clientes.length ===0){ //En caso de que este vacia, muestra ese mensaje
                tabla.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron clientes.</td></tr>';
                return;
            }
            //Esto es por facha nada mas
            document.getElementById('total-clientes').textContent = `Mostrando ${clientes.length} de ${clientes.length} resultados`;

            //Aca esta toda la logica de la tabla, por cada cliente que enccuentre en la respuesta que esta mas arriba,
            //va "dibujandolos" acorde a la tabla con los datos que le trae la respuesta (en este caso nombre, apellido, dni y estado)

            //La parte de los codigos en cada boton es para los distintos metodos asociados a estos (editar, alta, baja)
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
                            data-dni="${cliente.dniCliente}"
                            data-nombre="${cliente.nombre} ${cliente.apellido}"
                            data-activo="${cliente.activo}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    
                    <button class="btn btn-sm btn-outline-danger me-1 btn-eliminar" 
                            data-codigo="${cliente.codigo}"
                            data-dni="${cliente.dniCliente}"
                            data-nombre="${cliente.nombre} ${cliente.apellido}"
                            data-activo="${cliente.activo}">
                        <i class="bi bi-trash"></i>
                    </button>
                    
                    <button class="btn btn-sm btn-outline-success btn-alta" 
                            data-codigo="${cliente.codigo}"
                            data-dni="${cliente.dniCliente}"
                            data-nombre="${cliente.nombre} ${cliente.apellido}"
                            data-activo="${cliente.activo}">
                        <i class="bi bi-plus-circle"></i>
                    </button>
                </td>
            </tr>
            `;

                tabla.innerHTML += fila //Esto sirve para ir agregando las filas a la tabla a medida que las va leyendo
            });
        }catch(error)
        {
            tabla.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar: ${error.message}</td></tr>`;
            console.error('Error en funcion cargarClientes',error)
        }

}

//Funcion para buscar clientes por dni duh
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
            //La logica es muy similar a la funcion anterior solamente que aca le estamos dando los valores del cliente en especifico
            //que nos trae la api
            const fila = `
            <tr>
                <td>${cliente.nombre}</td>
                <td>${cliente.apellido}</td>
                <td>${cliente.dniCliente}</td>
                <td>${estado}</td> 
                <td>
                    <button class="btn btn-sm btn-outline-info me-1 btn-editar"
                            data-codigo="${cliente.codigo}"
                            data-dni="${cliente.dniCliente}"
                            data-nombre="${cliente.nombre} ${cliente.apellido}"
                            data-activo="${cliente.activo}">
                        <i class="bi bi-pencil"></i>
                    </button>
            
                    <button class="btn btn-sm btn-outline-danger me-1 btn-eliminar" 
                            data-codigo="${cliente.codigo}"
                            data-dni="${cliente.dniCliente}"
                            data-nombre="${cliente.nombre} ${cliente.apellido}"
                            data-activo="${cliente.activo}">
                        <i class="bi bi-trash"></i>
                    </button>

                    <button class="btn btn-sm btn-outline-success btn-alta" 
                            data-codigo="${cliente.codigo}"
                            data-dni="${cliente.dniCliente}"
                            data-nombre="${cliente.nombre} ${cliente.apellido}"
                            data-activo="${cliente.activo}">
                        <i class="bi bi-plus-circle"></i>
                    </button>
                </td>
            </tr>
            `;
            tabla.innerHTML += fila;
            document.getElementById('total-clientes').textContent = `Mostrando 1 de 1 resultados`;//Este mensaje nose que tanto me gusta pero se lo dejo provisoriamente
        }catch(error)
        {
            tabla.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al buscar: ${error.message}</td></tr>`;
            console.error('Error en funcion buscarClientePorDNI',error)
        }
}
//Esta funcion es para los listeners de los botones y demas cosas interactivas de la pagina, como buscar, agregar, eliminar, editar, dar de alta
function setupClientesListeners() {
    
    
    const botonBuscar = document.getElementById('boton-buscar');
    const inputBuscar = document.getElementById('buscar-cliente');

    //La parte de !botonBuscar.dataset.listenerAgregado es para evitar agregar multiples listeners al mismo boton
    if (botonBuscar && inputBuscar && !botonBuscar.dataset.listenerAgregado) {

        //Esta logica es para "escuchar" a la funcion de buscar por dni
        const realizarBusqueda = () => {
            const dni = inputBuscar.value.trim();
            if (dni) {
                buscarClientePorDNI(dni); // Busca por dni
            } else {
                cargarClientes(); // Si está vacío, recarga todos
            }
        };

        //Aca lo escucha
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

    //Misma logica de antes pero ahora para el boton de agregar
    if(botonAgregar && !botonAgregar.dataset.listenerAgregado){
        botonAgregar.addEventListener('click', (e) => {
            e.preventDefault();//Evita que el navegador se recargue
            sessionStorage.removeItem('dniClienteEditar');//Elimina el cliente para editar porque esta abriendo el form para agregar, no editar
            navigateTo('formCliente');//Va al formulario
        });
        botonAgregar.dataset.listenerAgregado = 'true';
    }
    const tabla = document.getElementById('tabla-clientes-body');

    if(tabla && !tabla.dataset.listenerAgregado){//Si esta la tabla y no hay otro listener, hace esto

        tabla.addEventListener('click', (e) => {
        //Logica eliminar
        const botonEliminar = e.target.closest('.btn-eliminar');//La accion de presionar el boton
        if(botonEliminar){//si se presiona, carga los datos necesarios para eliminar
            const codigo = botonEliminar.dataset.codigo;
            const dni = botonEliminar.dataset.dni;
            const nombre = botonEliminar.dataset.nombre;
            const estaActivo = botonEliminar.dataset.activo === 'true';

            if(!estaActivo){//Validacion
                Swal.fire({
                        title: 'Acción no válida',
                        text: `El cliente ${nombre} ya se encuentra Inactivo.`,
                        icon: 'info',
                        background: '#1e1d2c', color: '#ffffff'
                    });
            }else{
                eliminarCliente(codigo,dni, nombre);//Si esta activo, llama a la funcion para eliminar con los datos correspondientes
            }

        }
        //Logica dar de alta
        const botonAlta = e.target.closest('.btn-alta');
        if(botonAlta){
            const codigo = botonAlta.dataset.codigo;
            const dni = botonAlta.dataset.dni;
            const nombre = botonAlta.dataset.nombre;
            const estaActivo = botonAlta.dataset.activo === 'true';
            if(estaActivo){
                Swal.fire({//Validacion
                        title: 'Acción no válida',
                        text: `El cliente ${nombre} ya se encuentra Activo.`,
                        icon: 'info',
                        background: '#1e1d2c', color: '#ffffff'
                    });
            }else{
                darClienteDeAlta(codigo,dni, nombre);
            }
        }
        const botonEditar = e.target.closest('.btn-editar');
        if(botonEditar){
            dniClienteEditar = botonEditar.dataset.dni;
            sessionStorage.setItem('dniClienteEditar', dniClienteEditar);//Aca lo setea al dni porque esta abriendo el formulario para editar
            navigateTo('formCliente');
        }
    });
        tabla.dataset.listenerAgregado = 'true';
    }
}

//Funcion para dar de baja 
async function eliminarCliente(codigo, dni, nombre) {
    Swal.fire({//Boton de sweetalert
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
        
        if (result.isConfirmed) {//Si tocas que si, se conecta con la api y hace el Delete (que en realidad es una baja logica pero bueno llamemosle delete)
            try {
                const url = `https://localhost:7169/api/Clients/${codigo}`;
                
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo dar de baja al cliente.`);
                }

                
                Swal.fire({
                    title: '¡Baja Exitosa!',
                    text: `${nombre} ha sido marcado como Inactivo.`,
                    icon: 'success',
                    background: '#1e1d2c',
                    color: '#ffffff',
                    timer: 2000,
                    showConfirmButton: false
                });

                cargarClientes(); //Recarga la tabla una vez terminada la accion

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
//Funcion de alta (exactamente la misma logica que eliminar pero a la inversa)
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
                    method: 'PUT', 
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

                cargarClientes(); 
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


async function cargarDatosClienteParaEdicion(dni) {
    const url = `https://localhost:7169/api/Clients/${dni}`;
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Error ${response.status}: No se pudo encontrar al cliente con dni: ${dni}`);
        }
        const cliente = await response.json();

        document.getElementById('cliente-codigo').value = cliente.codigo;
        document.getElementById('cliente-nombre').value = cliente.nombre;
        document.getElementById('cliente-apellido').value = cliente.apellido;
        document.getElementById('cliente-dni').value = cliente.dniCliente;
        document.getElementById('cliente-activo').value = cliente.activo.toString();
        document.getElementById('cliente-barrio').value = cliente.idBarrio;
        document.getElementById('cliente-tipo').value = cliente.idTipoCliente;
        if(cliente.contacto){
            document.getElementById('cliente-id-contacto').value = cliente.contacto.idContacto;
            document.getElementById('cliente-contacto').value = cliente.contacto.descripcion;
            document.getElementById('cliente-tipo-contacto').value = cliente.contacto.idTipoContacto;
        }
    }catch (error){
        
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar datos',
            text: 'No se pudieron cargar los datos del cliente para editar.',
            background: '#1e1d2c', color: '#ffffff'
        });
        navigateTo('clientes'); 
    }
}

//Esta funcion es para los listeners del formulario de agregar/editar cliente
async function setupFormClienteListeners() {
    const formAgregarCliente = document.getElementById('form-agregar-cliente');
    const titulo = document.getElementById('form-cliente-titulo');
    const btnSubmit = document.getElementById('btn-submit'); 
    const inputCodigo = document.getElementById('cliente-codigo'); // Campo oculto para el ID de Cliente en el navigation
    const inputIdContacto = document.getElementById('cliente-id-contacto'); // Campo oculto para el ID de Contacto en el navigation
    const dniParaEditar = sessionStorage.getItem('dniClienteEditar')
    
    if (formAgregarCliente && !formAgregarCliente.dataset.listenerAgregado) {
        
        // Carga de combos
        const urlBase = 'https://localhost:7169/api/Additionals/'; 
        const promesasCombos = [   //Arreglo de promesas para cargar los combos
            //Se utiliza la funcion cargar combos, con parametros personalizads en cada combo
            cargarCombos(`${urlBase}Barrios`, 'cliente-barrio', 'idBarrio', 'descripcion', 'Seleccione un barrio...'),
            cargarCombos(`${urlBase}Tipos-Cliente`, 'cliente-tipo', 'idTipoCliente', 'tipoCliente', 'Seleccione un tipo de cliente...'),
            cargarCombos(`${urlBase}Tipos-Contacto`, 'cliente-tipo-contacto', 'idTipoContacto', 'descripcion', 'Seleccione un tipo de contacto...')
        ];

        // Lógica de modo (Agregar o Editar)

        if(dniParaEditar){//Si existe ese dni, es modo editar
            // --- MODO EDITAR ---
            //Cambia los titulos y botones acorde al modo
            titulo.textContent = 'Editar Cliente'
            btnSubmit.innerHTML = '<i class="bi bi-save-fill me-2"></i> Guardar Cambios'
            btnSubmit.classList.remove('btn-success')
            btnSubmit.classList.add('btn-primary')

            await Promise.all(promesasCombos);//El promise.all espera a que se carguen todos los combos antes de seguir
            await cargarDatosClienteParaEdicion(dniParaEditar) // Rellena el formulario con los datos del cliente a editar
            
            
        }else{
            // --- MODO AGREGAR ---
            titulo.textContent = 'Agregar Cliente'
            btnSubmit.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Agregar Cliente'
            btnSubmit.classList.remove('btn-primary')
            btnSubmit.classList.add('btn-success')
            inputCodigo.value = '' // Limpia el ID oculto de Cliente
            inputIdContacto.value = '' // Limpia el ID oculto de Contacto
            
            await Promise.all(promesasCombos);
        }

        // Listener del boton submit
        formAgregarCliente.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const regexSoloNumeros = /^[0-9]+$/;//Le pregunte a la IA como validar los campos y me tiro estas dos lineas
            const regexSoloLetras = /^[a-zA-ZÀ-ÿ\s']+$/;
            
            //Valores crudos de los inputs
            //Se los pido para hacer las validaciones
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
            
            const codigo = inputCodigo.value; // Lee el ID del campo oculto

            //Put vs post
            //Aca esta toda la logica "posta", lo de antes era nomas para el tema de los titulos y los botones

            if (codigo) {// Si hay un codigo, significa que existe el cliente, por lo tanto es un PUT
              //PUT  
                
                // Arma el JSON que espera la api
                const clienteActualizado = {//Obtengo los valores del formulario, metiendolos en un objeto clienteActualizado
                    codigo: parseInt(codigo),
                    nombre: document.getElementById('cliente-nombre').value,
                    apellido: document.getElementById('cliente-apellido').value,
                    dniCliente: document.getElementById('cliente-dni').value,
                    activo: document.getElementById('cliente-activo').value === 'true',
                    idBarrio: parseInt(document.getElementById('cliente-barrio').value),
                    idTipoCliente: parseInt(document.getElementById('cliente-tipo').value),
                    contacto : {
                        idContacto : parseInt(document.getElementById('cliente-id-contacto').value),
                        descripcion : document.getElementById('cliente-contacto').value,
                        idTipoContacto : parseInt(document.getElementById('cliente-tipo-contacto').value)
                    } 
                };
                
                try{
                    const url = `https://localhost:7169/editar/${codigo}`;
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(clienteActualizado) // Envía el JSON plano
                    });
                    if(!response.ok){
                        throw new Error(`Fallo la actualizacion del cliente: ${response.status}`);
                    }
                    Swal.fire({ title: "Éxito",
                                text: "Cliente actualizado con éxito.",
                                icon: "success", 
                                background: '#1e1d2c', 
                                color: '#ffffff' });
                    navigateTo('clientes');//Vuelve a la pagina de clientes una vez terminado
                }catch(error){
                    console.error('Error al actualizar cliente:', error);
                    Swal.fire({ icon: "error", 
                        title: "Oops...", 
                        text: "Error al actualizar: " + error.message, 
                        background: '#1e1d2c', 
                        color: '#ffffff' });
                }

            } else {
                //POST
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
                    Swal.fire({
                        title: "Éxito",
                        text: "Cliente agregado con éxito.",
                        icon: "success",
                        background: '#1e1d2c', color: '#ffffff'
                    });
                    navigateTo('clientes');//Vuelve a la pagina de clientes una vez terminado
                }catch(error){
                    console.error('Error al agregar cliente:', error);
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Error al agregar el cliente: " + error.message,
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
            }
        });
        
        formAgregarCliente.dataset.listenerAgregado = 'true';
    
    } else if (formAgregarCliente) {//Todo este bloque se encarga de "limpiar" y para preparar el formulario para el usuario
        

        formAgregarCliente.reset();
        
        const urlBase = 'https://localhost:7169/api/Additionals/'; 
        const promesasCombos = [   
            cargarCombos(`${urlBase}Barrios`, 'cliente-barrio', 'idBarrio', 'descripcion', 'Seleccione un barrio...'),
            cargarCombos(`${urlBase}Tipos-Cliente`, 'cliente-tipo', 'idTipoCliente', 'tipoCliente', 'Seleccione un tipo de cliente...'),
            cargarCombos(`${urlBase}Tipos-Contacto`, 'cliente-tipo-contacto', 'idTipoContacto', 'descripcion', 'Seleccione un tipo de contacto...')
        ];

        if(dniParaEditar){//Disenio para editar
            titulo.textContent = 'Editar Cliente'
            btnSubmit.innerHTML = '<i class="bi bi-save-fill me-2"></i> Guardar Cambios'
            btnSubmit.classList.remove('btn-success')
            btnSubmit.classList.add('btn-primary')
            await Promise.all(promesasCombos);
            await cargarDatosClienteParaEdicion(dniClienteEditar)
            dniClienteEditar = null;
        }else{//Disenio para agregar
            titulo.textContent = 'Agregar Cliente'
            btnSubmit.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Agregar Cliente'
            btnSubmit.classList.remove('btn-primary')
            btnSubmit.classList.add('btn-success')
            inputCodigo.value = ''
            inputIdContacto.value = ''
            await Promise.all(promesasCombos);
        }
    }
}

//Funcion para cargar combos
async function cargarCombos(url, selectId, valorCampo, textoCampo, textoDefault = "Seleccione una opcion...") {
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