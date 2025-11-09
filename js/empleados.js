

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

async function cargarDatosEmpleadoParaEdicion(dni) {
    const url = `https://localhost:7169/api/Employees/${dni}`;
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Error ${response.status}: No se pudo encontrar al empleados con dni: ${dni}`);
        }
        const empleados = await response.json();

        document.getElementById('empleados-codigo').value = empleados.idEmpleado;
        document.getElementById('empleados-nombre').value = empleados.nomEmpleado;
        document.getElementById('empleados-apellido').value = empleados.apeEmpleado;
        document.getElementById('empleados-dni').value = empleados.dniEmpleado;
        document.getElementById('empleados-usuario').value = empleados.usuario;
        document.getElementById('empleados-contraseña').value = empleados.contraseña;
        document.getElementById('empleados-activo').value = empleados.activo.toString();
        document.getElementById('empleados-barrio').value = empleados.idBarrio;
        if(empleados.contacto){
            document.getElementById('empleados-id-contacto').value = empleados.contacto.idContacto;
            document.getElementById('empleados-contacto').value = empleados.contacto.descripcion;
            document.getElementById('empleados-tipo-contacto').value = empleados.contacto.idTipoContacto;
        }
        if(empleados.rol){
            document.getElementById('empleados-id-rol').value = empleados.rol.idRol;
            document.getElementById('empleados-rol').value = empleados.rol.descripcion;
        }

    }catch (error){
        
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar datos',
            text: 'No se pudieron cargar los datos del empleados para editar.',
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
        formAgregarEmpleados.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const regexSoloNumeros = /^[0-9]+$/;//Le pregunte a la IA como validar los campos y me tiro estas dos lineas
            const regexSoloLetras = /^[a-zA-ZÀ-ÿ\s']+$/;
            
            //Valores crudos de los inputs
            //Se los pido para hacer las validaciones
            const dniInput = document.getElementById('empleado-dni').value;
            const nombreInput = document.getElementById('empleado-nombre').value;
            const apellidoInput = document.getElementById('empleado-apellido').value;
            const usuarioInput = document.getElementById('empleado-usuario').value;
            const contraseñaInput = document.getElementById('empleado-contraseña').value;
            const idBarrioVal = parseInt(document.getElementById('empleado-barrio').value);
            const idTipoContactoVal = parseInt(document.getElementById('empleado-tipo-contacto').value);
            const contactoDesc = document.getElementById('empleado-contacto').value;
            const idRolVal = parseInt(document.getElementById('empleado-rol').value);

            //Validaciones
            if(!regexSoloNumeros.test(dniInput)){
                Swal.fire({
                    icon: "warning",
                    title: "DNI inválido",
                    text: "El DNI debe contener solo números.",
                });
                return;
            }

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

            if(!regexSoloLetras.test(usuarioInput)){
                Swal.fire({
                    icon: "warning",
                    title: "Usuario inválido",
                    text: "El usuario debe contener solo letras y espacios.",
                });
                return;
            }

            if(!regexSoloLetras.test(contraseñaInput)){
                Swal.fire({
                    icon: "warning",
                    title: "Contraseña inválida",
                    text: "La contraseña debe contener solo letras y espacios.",
                });
                return;
            }

            if (isNaN(idBarrioVal) || !contactoDesc || isNaN(idTipoContactoVal) || isNaN(idRolVal)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor, complete todos los campos obligatorios (barrio, rol, contacto, etc.).',
                    background: '#1e1d2c', color: '#ffffff'
                });
                return;
            } 
            
            const codigo = inputCodigo.value;

            if (codigo) {
                // Armar el JSON que espera la api
                const empleadoActualizado = {
                    idEmpleado: parseInt(codigo),
                    nomEmpleado: document.getElementById('empleado-nombre').value,
                    apeEmpleado: document.getElementById('empleado-apellido').value,
                    dniEmpleado: document.getElementById('empleado-dni').value,
                    usuario: document.getElementById('empleado-usuario').value,
                    contraseña: document.getElementById('empleado-contraseña').value,
                    activo: document.getElementById('empleado-activo').value === 'true',
                    idBarrio: parseInt(document.getElementById('empleado-barrio').value),
                    contacto : {
                        idContacto : parseInt(document.getElementById('empleado-id-contacto').value),
                        descripcion : document.getElementById('empleado-contacto').value,
                        idTipoContacto : parseInt(document.getElementById('empleado-tipo-contacto').value)
                    },
                    rol : {
                        idContacto : parseInt(document.getElementById('empleado-rol').value)
                    }
                };
                
                try{
                    const url = `https://localhost:7169/api/Employees/${codigo}`;
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(empleadoActualizado) // Envía el JSON plano
                    });
                    if(!response.ok){
                        throw new Error(`Fallo la actualizacion del empleado: ${response.status}`);
                    }
                    Swal.fire({ title: "Éxito",
                                text: "Empleado actualizado con éxito.",
                                icon: "success", 
                                background: '#1e1d2c', 
                                color: '#ffffff' });
                    navigateTo('empleado'); //Vuelve a la pagina de empleado una vez terminado
                }catch(error){
                    console.error('Error al actualizar empleado:', error);
                    Swal.fire({ icon: "error", 
                        title: "Oops...", 
                        text: "Error al actualizar: " + error.message, 
                        background: '#1e1d2c', 
                        color: '#ffffff' });
                }

            } else {
                //POST
                const empleadoNuevo = {
                    idEmpleado: parseInt(codigo),
                    nomEmpleado: document.getElementById('empleado-nombre').value,
                    apeEmpleado: document.getElementById('empleado-apellido').value,
                    dniEmpleado: document.getElementById('empleado-dni').value,
                    usuario: document.getElementById('empleado-usuario').value,
                    contraseña: document.getElementById('empleado-contraseña').value,
                    activo: document.getElementById('empleado-activo').value === 'true',
                    idBarrio: parseInt(document.getElementById('empleado-barrio').value),
                    contacto : {
                        idContacto : parseInt(document.getElementById('empleado-id-contacto').value),
                        descripcion : document.getElementById('empleado-contacto').value,
                        idTipoContacto : parseInt(document.getElementById('empleado-tipo-contacto').value)
                    },
                    rol : {
                        idContacto : parseInt(document.getElementById('empleado-rol').value)
                    }
                };
                
                try{
                    const url = 'https://localhost:7169/api/Employees';
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(empleadoNuevo)
                    });
                    if(!response.ok){
                        throw new Error(`Fallo el post del empleado: ${response.status}`);
                    }
                    Swal.fire({
                        title: "Éxito",
                        text: "Empleado agregado con éxito.",
                        icon: "success",
                        background: '#1e1d2c', color: '#ffffff'
                    });
                    navigateTo('empleados');
                }catch(error){
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
            await cargarDatosEmpleadoParaEdicion(dniEmpleadoEditar)
            dniEmpleadoEditar = null;
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

//Funcion para cargar combos
async function cargarCombos(url, selectId, valorCampo, textoCampo, textoDefault = "Seleccione una opcion...") {
    const select = document.getElementById(selectId);//El id de la tabla a la que va a hacer select
    if (!select) {
        return
    };
    select.disabled = true;
    select.innerHTML = `<option value="">Cargando...</option>`;
    try {
        const response = await fetch(url); //Hace fetch a la url correspondiente

        if(!response.ok) {
            throw new Error(`Error: ${response.status} al cargar ${selectId}`);
        }

        const data = await response.json();
        select.innerHTML = '';

        const opcionDefault = document.createElement('option');
        opcionDefault.value = '';
        opcionDefault.textContent = textoDefault; //Texto default dependiendo del combobox
        select.appendChild(opcionDefault);

        //Carga el combo
        data.forEach(item => 
        { 
            const opcion = document.createElement('option');
            opcion.value = item[valorCampo];
            opcion.textContent = item[textoCampo];
            select.appendChild(opcion);
        });
        
    }
    catch(error){
        console.error(`Error al cargar ${selectId}:`, error);
        select.innerHTML = `<option value="">Error al cargar</option>`;
    }finally{
        select.disabled = false;
    }
}