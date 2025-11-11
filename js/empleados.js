let dniEmpleadoEditar = null;

//Funcion para cargar tabla
async function cargarEmpleados() {
        const tabla = document.getElementById('tabla-empleados-body');

        tabla.innerHTML = '<tr><td colspan="5" class="text-center">Cargando empleados...</td></tr>';//Texto por defecto

        try {
            const url = 'https://localhost:7169/api/Employees';
            const response = await fetch(url);
            if (!response.ok){
                throw new Error(`Error: ${response.status} - No se pudo conectar a la API`);
            }
            const empleados = await response.json();
            //Se limpia la tabla antes de cargar datos
            tabla.innerHTML = '';

            if(empleados.length == 0)
            { 
                //En caso de que este vacia, muestra ese mensaje
                tabla.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron empleados.</td></tr>';
                return;
            }
            empleados.forEach(empleado => {
                const estado = empleado.activo
            ? '<span class="badge bg-success">Activo</span>'
            : '<span class="badge bg-danger">Inactivo</span>';

            const fila = `
            <tr>
                <td>${empleado.nomEmpleado}</td>
                <td>${empleado.apeEmpleado}</td>
                <td>${empleado.dniEmpleado}</td>
                <td>${estado}</td> 
                <td>
                    <button class="btn btn-sm btn-outline-info me-1 btn-editar"
                            data-codigo="${empleado.idEmpleado}"
                            data-dni="${empleado.dniEmpleado}"
                            data-nombre="${empleado.nomEmpleado} ${empleado.apeEmpleado}"
                            data-activo="${empleado.activo}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    
                    <button class="btn btn-sm btn-outline-danger me-1 btn-eliminar" 
                            data-codigo="${empleado.idEmpleado}"
                            data-dni="${empleado.dniEmpleado}"
                            data-nombre="${empleado.nomEmpleado} ${empleado.apeEmpleado}"
                            data-activo="${empleado.activo}">
                        <i class="bi bi-trash"></i>
                    </button>
                    
                    <button class="btn btn-sm btn-outline-success btn-alta" 
                            data-codigo="${empleado.idEmpleado}"
                            data-dni="${empleado.dniEmpleado}"
                            data-nombre="${empleado.nomEmpleado} ${empleado.apeEmpleado}"
                            data-activo="${empleado.activo}">
                        <i class="bi bi-plus-circle"></i>
                    </button>
                </td>
            </tr>
            `;
                //Esto es por facha nada mas
                document.getElementById('total-empleados').textContent = `Mostrando ${empleados.length} de ${empleados.length} resultados`;
                tabla.innerHTML += fila //Esto sirve para ir agregando las filas a la tabla a medida que las va leyendo
            });
        }catch(error)
        {
            tabla.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar: ${error.message}</td></tr>`;
            console.error('Error en funcion cargarEmpleados',error)
        }
}

//Funcion para buscar empleados por dni
async function buscarEmpleadoPorDNI(dni) {
        const tabla = document.getElementById('tabla-empleados-body');

        tabla.innerHTML = '<tr><td colspan="5" class="text-center">Buscando empleados...</td></tr>';

        try {
            const url = `https://localhost:7169/api/Employees/${dni}`;
            const response = await fetch(url);
            if (!response.ok){
                throw new Error(`No se encontró el empleado con DNI ${dni}`);
            }
            const empleado = await response.json();
            tabla.innerHTML = '';
            if(!empleado){
                tabla.innerHTML = '<tr><td colspan="5" class="text-center">No se encontró ningún empleados con ese DNI.</td></tr>';
                return;
            }
            const estado = empleado.activo
            ? '<span class="badge bg-success">Activo</span>'
            : '<span class="badge bg-danger">Inactivo</span>';
            // logica similar a la funcion anterior, pero solo para un empleado por DNI.
            const fila = `
            <tr>
                <td>${empleado.nomEmpleado}</td>
                <td>${empleado.apeEmpleado}</td>
                <td>${empleado.dniEmpleado}</td>
                <td>${estado}</td> 
                <td>
                    <button class="btn btn-sm btn-outline-info me-1 btn-editar"
                            data-codigo="${empleado.idEmpleado}"
                            data-dni="${empleado.dniEmpleado}"
                            data-nombre="${empleado.nomEmpleado} ${empleado.apeEmpleado}"
                            data-activo="${empleado.activo}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    
                    <button class="btn btn-sm btn-outline-danger me-1 btn-eliminar" 
                            data-codigo="${empleado.idEmpleado}"
                            data-dni="${empleado.dniEmpleado}"
                            data-nombre="${empleado.nomEmpleado} ${empleado.apeEmpleado}"
                            data-activo="${empleado.activo}">
                        <i class="bi bi-trash"></i>
                    </button>
                    
                    <button class="btn btn-sm btn-outline-success btn-alta" 
                            data-codigo="${empleado.idEmpleado}"
                            data-dni="${empleado.dniEmpleado}"
                            data-nombre="${empleado.nomEmpleado} ${empleado.apeEmpleado}"
                            data-activo="${empleado.activo}">
                        <i class="bi bi-plus-circle"></i>
                    </button>
                </td>
            </tr>
            `;
            tabla.innerHTML += fila;
            document.getElementById('total-empleados').textContent = `Mostrando 1 de 1 resultados`;
        }catch(error)
        {
            tabla.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al buscar: ${error.message}</td></tr>`;
            console.error('Error en funcion buscarEmpleadoPorDNI',error)
        }
}


// Funcionalidad de los botones y demas cosas interactivas de la pagina.
function setupEmpleadosListeners() {
    const botonBuscar = document.getElementById('boton-buscar');
    const inputBuscar = document.getElementById('buscar-empleados');

    //La parte de !botonBuscar.dataset.listenerAgregado es para evitar agregar multiples listeners al mismo boton
    if (botonBuscar && inputBuscar && !botonBuscar.dataset.listenerAgregado)
    {
        const realizarBusqueda = () => 
        {
            const dni = inputBuscar.value.trim();
            if (dni) 
            { buscarEmpleadoPorDNI(dni); } 
            else 
            { cargarEmpleados(); }
        };

        botonBuscar.addEventListener('click', realizarBusqueda);

        inputBuscar.addEventListener('keyup', (e) => 
        {
            if (e.key === 'Enter')
            { realizarBusqueda(); }
        });

        inputBuscar.addEventListener('input', () => 
        {
            if (inputBuscar.value.trim() === '')
            { cargarEmpleados(); }
        });

        botonBuscar.dataset.listenerAgregado = 'true'; 
    }

    const botonAgregar = document.getElementById('boton-agregar-empleados');

    if(botonAgregar && !botonAgregar.dataset.listenerAgregado)
        {
            botonAgregar.addEventListener('click', (e) => 
            {
                e.preventDefault();
                sessionStorage.removeItem('dniEmpleadoEditar');
                navigateTo('formEmpleados');
            }
        );
        botonAgregar.dataset.listenerAgregado = 'true';
    }
    const tabla = document.getElementById('tabla-empleados-body');

    if(tabla && !tabla.dataset.listenerAgregado)
    {
        tabla.addEventListener('click', (e) => 
        {
            const botonEliminar = e.target.closest('.btn-eliminar');
            if(botonEliminar)
            {
                const codigo = botonEliminar.dataset.codigo;
                const dni = botonEliminar.dataset.dni;
                const nombre = botonEliminar.dataset.nombre;
                const estaActivo = botonEliminar.dataset.activo === 'true';

                if(!estaActivo)
                {
                    Swal.fire
                    ({
                        title: 'Acción no válida',
                        text: `El empleado ${nombre} ya se encuentra Inactivo.`,
                        icon: 'info',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else
                { eliminarEmpleado(codigo,dni, nombre); }
            }

            const botonAlta = e.target.closest('.btn-alta');
            if(botonAlta)
            {
                const codigo = botonAlta.dataset.codigo;
                const dni = botonAlta.dataset.dni;
                const nombre = botonAlta.dataset.nombre;
                const estaActivo = botonAlta.dataset.activo === 'true';

                if(estaActivo){
                    Swal.fire
                        ({
                            title: 'Acción no válida',
                            text: `El empleado ${nombre} ya se encuentra Activo.`,
                            icon: 'info',
                            background: '#1e1d2c', color: '#ffffff'
                        });
                }
                else
                { darEmpleadoDeAlta(codigo,dni, nombre); }
            }

            const botonEditar = e.target.closest('.btn-editar');
            if(botonEditar){
                dniEmpleadoEditar = botonEditar.dataset.dni;
                sessionStorage.setItem('dniEmpleadoEditar', dniEmpleadoEditar);
                navigateTo('formEmpleados');
            }
        });

        tabla.dataset.listenerAgregado = 'true';
    }
}

async function eliminarEmpleado(codigo, dni, nombre) {
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
                const url = `https://localhost:7169/api/Employees/${dni}`;
                
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo dar de baja al empleado.`);
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

                cargarEmpleados(); //Recarga la tabla una vez terminada la accion

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

async function darEmpleadoDeAlta(codigo, dni, nombre) {
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
                const url = `https://localhost:7169/activate/${codigo}`;
                const response = await fetch(url, {
                    method: 'PUT', 
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo dar de alta al empleado.`);
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

                cargarEmpleados(); 
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

/* ------------------------------------------------------------------------ */
//Funcion para cargar combos
async function cargarCombos(url, selectId, valorCampo, textoCampo, textoDefault = "Seleccione una opcion...") {
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`No se encontró el elemento con ID: ${selectId}`);
        return
    };
    
    console.log(`Cargando combo: ${selectId} desde URL: ${url}`); // Log agregado
    
    select.disabled = true;
    select.innerHTML = `<option value="">Cargando...</option>`;
    try {
        const response = await fetch(url);

        if(!response.ok) {
            console.error(`Error ${response.status} al cargar ${selectId} desde ${url}`); // Log mejorado
            throw new Error(`Error: ${response.status} al cargar ${selectId}`);
        }

        const data = await response.json();
        console.log(`Datos recibidos para ${selectId}:`, data); // Log agregado
        
        select.innerHTML = '';

        const opcionDefault = document.createElement('option');
        opcionDefault.value = '';
        opcionDefault.textContent = textoDefault;
        select.appendChild(opcionDefault);

        //Carga el combo
        data.forEach(item => 
        { 
            const opcion = document.createElement('option');
            opcion.value = item[valorCampo];
            opcion.textContent = item[textoCampo];
            select.appendChild(opcion);
        });
        
        console.log(`Combo ${selectId} cargado exitosamente con ${data.length} elementos`); // Log agregado
        
    }
    catch(error){
        console.error(`Error detallado al cargar ${selectId}:`, error); // Log mejorado
        select.innerHTML = `<option value="">Error al cargar</option>`;
    }finally{
        select.disabled = false;
    }
}

async function cargarDatosEmpleadosParaEdicion(dni) {
    const url = `https://localhost:7169/api/Employees/${dni}`;
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Error ${response.status}: No se pudo encontrar al empleado con dni: ${dni}`);
        }
        const empleado = await response.json();

        document.getElementById('empleado-codigo').value = empleado.idEmpleado;
        document.getElementById('empleado-dni').value = empleado.dniEmpleado;

        document.getElementById('empleado-nombre').value = empleado.nomEmpleado;
        document.getElementById('empleado-apellido').value = empleado.apeEmpleado;

        document.getElementById('empleado-usuario').value = empleado.usuario;
        document.getElementById('empleado-contrasenia').value = empleado.contrasenia;

        document.getElementById('empleado-activo').value = empleado.activo.toString();
        if(empleado.barrio){
            document.getElementById('empleado-barrio').value = empleado.barrio.idBarrio;
        }
        if(empleado.contacto){
            document.getElementById('empleado-id-contacto').value = empleado.contacto.idContacto;
            document.getElementById('empleado-contacto').value = empleado.contacto.descripcion;
            document.getElementById('empleado-tipo-contacto').value = empleado.contacto.idTipoContacto;
        }
        if(empleado.rol){
            document.getElementById('empleado-rol').value = empleado.rol.idRol;
        }

    }catch (error){
        console.error('Error al cargar datos del empleado para edición:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar datos',
            text: 'No se pudieron cargar los datos del empleado para editar.',
            background: '#1e1d2c', color: '#ffffff'
        });
        navigateTo('empleados'); 
    }
}

/* ------------------------------------------------------------------------ */
async function setupFormEmpleadoListeners() {
    const formAgregarEmpleado = document.getElementById('form-agregar-empleado');
    const titulo = document.getElementById('form-empleado-titulo');
    const btnSubmit = document.getElementById('btn-submit'); 
    const inputCodigo = document.getElementById('empleado-codigo'); // Campo oculto para el ID de empleado en el navigation
    const inputIdContacto = document.getElementById('empleado-id-contacto'); // Campo oculto para el ID de Contacto en el navigation
    const dniParaEditar = sessionStorage.getItem('dniEmpleadoEditar')
    
    if (formAgregarEmpleado && !formAgregarEmpleado.dataset.listenerAgregado) {
        
        // Carga de combos
        const urlBase = 'https://localhost:7169/api/Additionals/'; 
        const promesasCombos = [   //Arreglo de promesas para cargar los combos
            //Se utiliza la funcion cargar combos, con parametros personalizads en cada combo
            cargarCombos(`${urlBase}Barrios`, 'empleado-barrio', 'idBarrio', 'descripcion', 'Seleccione un barrio...'),
            cargarCombos(`${urlBase}Tipos-Contacto`, 'empleado-tipo-contacto', 'idTipoContacto', 'descripcion', 'Seleccione un tipo de contacto...'),
            cargarCombos(`${urlBase}Empleados-Roles`, 'empleado-rol', 'idRol', 'descripcion', 'Seleccione un tipo de rol...')
        ];

        // Lógica de modo (Agregar o Editar)

        if(dniParaEditar){ //Si existe ese dni, es modo editar
            // --- MODO EDITAR ---
            //Cambia los titulos y botones acorde al modo
            titulo.textContent = 'Editar Empleado'
            btnSubmit.innerHTML = '<i class="bi bi-save-fill me-2"></i> Guardar Cambios'
            btnSubmit.classList.remove('btn-success')
            btnSubmit.classList.add('btn-primary')

            await Promise.all(promesasCombos); //El promise.all espera a que se carguen todos los combos antes de seguir
            await cargarDatosEmpleadosParaEdicion(dniParaEditar) // Rellena el formulario con los datos del empleado a editar
        }
        else{
            // --- MODO AGREGAR ---
            titulo.textContent = 'Agregar Empleado'
            btnSubmit.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Agregar Empleado'
            btnSubmit.classList.remove('btn-primary')
            btnSubmit.classList.add('btn-success')
            inputCodigo.value = ''
            inputIdContacto.value = ''
            
            await Promise.all(promesasCombos);
        }

        // Listener del boton submit
        formAgregarEmpleado.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const regexSoloNumeros = /^[0-9]+$/;//Le pregunte a la IA como validar los campos y me tiro estas dos lineas
            const regexSoloLetras = /^[a-zA-ZÀ-ÿ\s']+$/;
            
            //Valores crudos de los inputs
            //Se los pido para hacer las validaciones
            const dniInput = document.getElementById('empleado-dni').value;
            const nombreInput = document.getElementById('empleado-nombre').value;
            const apellidoInput = document.getElementById('empleado-apellido').value;
            const usuarioInput = document.getElementById('empleado-usuario').value;
            const contraseñaInput = document.getElementById('empleado-contrasenia').value;

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

            if(!regexSoloLetras.test(usuarioInput)){
                Swal.fire({
                    icon: "warning",
                    title: "Usuario inválido",
                    text: "El usuario debe contener solo letras y espacios.",
                });
                return;
            }

            if(contraseñaInput.length < 4){
                Swal.fire({
                    icon: "warning",
                    title: "Contraseña inválida",
                    text: "La contraseña debe contener solo letras y espacios.",
                });
                return;
            }

            // Barrio
            const selectBarrio = document.getElementById('empleado-barrio');
            const idBarrio = parseInt(selectBarrio.value);
            const descBarrio = selectBarrio.options[selectBarrio.selectedIndex].text;

            // Rol
            const selectRol = document.getElementById('empleado-rol');
            const idRol = parseInt(selectRol.value);
            const descRol = selectRol.options[selectRol.selectedIndex].text;

            // Contacto
            const selectTipoContacto = document.getElementById('empleado-tipo-contacto');
            const idTipoContacto = parseInt(selectTipoContacto.value);
            const descContacto = document.getElementById('empleado-contacto').value;

            // Validar que los combos estén seleccionados
            if (isNaN(idBarrio) || !descContacto || isNaN(idTipoContacto) || isNaN(idRol)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor, complete todos los campos obligatorios (barrio, rol, contacto, etc.).',
                    background: '#1e1d2c', color: '#ffffff'
                });
                return;
            }

            const codigo = inputCodigo.value;

            const idContacto = parseInt(inputIdContacto.value) || 0;
            
            if (codigo) {
                // Armar el JSON que espera la api
                // --- MODO EDITAR (PUT) ---
                // ID del Empleado: usa el del input oculto
                const idEmpleado = parseInt(codigo); 
                const empleadoActualizado = {
                    idEmpleado: idEmpleado, // ID de empleado
                    dniEmpleado: document.getElementById('empleado-dni').value,
                    nomEmpleado: document.getElementById('empleado-nombre').value,
                    apeEmpleado: document.getElementById('empleado-apellido').value,
                    usuario: document.getElementById('empleado-usuario').value,
                    contrasenia: document.getElementById('empleado-contrasenia').value,
                    activo: document.getElementById('empleado-activo').value === 'true',
                    barrio: {
                        idBarrio: idBarrio,
                        descripcion: descBarrio
                    },
                    contacto: {
                        idContacto: idContacto, // ID de contacto
                        descripcion: descContacto,
                        idTipoContacto: idTipoContacto
                    },
                    rol: {
                        idRol: idRol,
                        descripcion: descRol
                    }
                };
                
                // --- Lógica PUT (Editar) ---
                try {
                    const url = `https://localhost:7169/api/Employees/${idEmpleado}`; // El PUT suele ir al ID
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(empleadoActualizado) 
                    });
                    if (!response.ok) {
                        throw new Error(`Fallo la actualizacion del empleado: ${response.status}`);
                    }
                    Swal.fire({ title: "Éxito", text: "Empleado actualizado con éxito.", icon: "success", background: '#1e1d2c', color: '#ffffff' });
                    sessionStorage.removeItem('dniEmpleadoEditar'); // Limpiar session storage
                    navigateTo('empleados'); // Corregido a 'empleados'
                } catch (error) {
                    console.error('Error al actualizar empleado:', error);
                    Swal.fire({ icon: "error", title: "Oops...", text: "Error al actualizar: " + error.message, background: '#1e1d2c', color: '#ffffff' });
                }

            } else {
                // --- MODO AGREGAR (POST) ---
                const empleadoNuevo = {
                    idEmpleado: 0, // En POST, el ID de empleado es 0
                    dniEmpleado: document.getElementById('empleado-dni').value,
                    nomEmpleado: document.getElementById('empleado-nombre').value,
                    apeEmpleado: document.getElementById('empleado-apellido').value,
                    usuario: document.getElementById('empleado-usuario').value,
                    contrasenia: document.getElementById('empleado-contrasenia').value,
                    activo: document.getElementById('empleado-activo').value === 'true',
                    barrio: {
                        idBarrio: 0,
                        descripcion: descBarrio
                    },
                    contacto: {
                        idContacto: 0, // En POST, el ID de contacto es 0
                        descripcion: descContacto,
                        idTipoContacto: idTipoContacto
                    },
                    rol: {
                        idRol: 0,
                        descripcion: descRol
                    }
                };
                
                // --- Lógica POST (Agregar) ---
                try {
                    const url = 'https://localhost:7169/api/Employees';
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(empleadoNuevo)
                    });
                    if (!response.ok) {
                        throw new Error(`Fallo el post del empleado: ${response.status}`);
                    }
                    Swal.fire({
                        title: "Éxito",
                        text: "Empleado agregado con éxito.",
                        icon: "success",
                        background: '#1e1d2c', color: '#ffffff'
                    });
                    navigateTo('empleados');
                } catch (error) {
                    console.error('Error al agregar empleado:', error);
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Error al agregar el empleado: " + error.message,
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
            }
        });

        formAgregarEmpleado.dataset.listenerAgregado = 'true';
    
    } 
    else if (formAgregarEmpleado) {//Todo este bloque se encarga de "limpiar" y para preparar el formulario para el usuario
        

        formAgregarEmpleado.reset();
        
        const urlBase = 'https://localhost:7169/api/Additionals/'; 
        const promesasCombos = [   
            cargarCombos(`${urlBase}Barrios`, 'empleado-barrio', 'idBarrio', 'descripcion', 'Seleccione un barrio...'),
            cargarCombos(`${urlBase}Tipos-Contacto`, 'empleado-tipo-contacto', 'idTipoContacto', 'descripcion', 'Seleccione un tipo de contacto...'),
            cargarCombos(`${urlBase}Empleados-Roles`, 'empleado-rol', 'idRol', 'descripcion', 'Seleccione un tipo de rol...')
        ];

        if(dniParaEditar){//Disenio para editar
            titulo.textContent = 'Editar Empleado'
            btnSubmit.innerHTML = '<i class="bi bi-save-fill me-2"></i> Guardar Cambios'
            btnSubmit.classList.remove('btn-success')
            btnSubmit.classList.add('btn-primary')
            await Promise.all(promesasCombos);
            await cargarDatosEmpleadosParaEdicion(dniParaEditar) // Usar dniParaEditar aquí también
        }else{//Disenio para agregar
            titulo.textContent = 'Agregar Empleado'
            btnSubmit.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Agregar Empleado'
            btnSubmit.classList.remove('btn-primary')
            btnSubmit.classList.add('btn-success')
            inputCodigo.value = ''
            inputIdContacto.value = ''
            await Promise.all(promesasCombos);
        }
    }
}

