// FUNCIONES Y AÑADIDOS GLOBALES

const URL = "https://localhost:9190/api/Dashboard";

let chartEntradasDiaInstance = null;
let chartPromedioSalasInstance = null;
let chartFranjaHorariaInstance = null;
let chartProductosTopInstance = null;

/* Convierte string de moneda con comas a número */
function parseCurrency(montoString) {
    if (!montoString || typeof montoString !== 'string') {
        return 0;
    }
    const stringLimpio = montoString.replace(/,/g, '');
    const numero = parseFloat(stringLimpio);
    return isNaN(numero) ? 0 : numero;
}

/* Fechas entre rango para que muestre todos los dias en
el grafico sin importar si hay datos o no */
function getAllDatesInRange(startDate, endDate) {
    const dates = [];

    // Uso UTC para evitar problemas con zonas horarias jeje
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    let currentDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    const lastDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));

    while (currentDate <= lastDate) {
        // Convierte a YYYY-MM-DD
        dates.push(currentDate.toISOString().split('T')[0]);
        // Avanza al siguiente día (en UTC)
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return dates;
}

// Eventos Globales - DOMContentLoaded comentados por cada seccion
document.addEventListener('DOMContentLoaded', function(){

    // Solo ejecutar si estamos en la página del dashboard
    if (document.getElementById('chartEntradasDia')) {
        initDashboardInternal();

        // Grafico 1
        getEntradasVendidas(); 

        const btnAplicar = document.getElementById('btnAplicarFiltro');
        const inputDesde = document.getElementById('filtroFechaDesde');
        const inputHasta = document.getElementById('filtroFechaHasta');

        if (btnAplicar) {
            btnAplicar.addEventListener('click', () => {
                const desde = inputDesde.value;
                const hasta = inputHasta.value;

                if ((desde && !hasta) || (!desde && hasta)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'Debe seleccionar ambas fechas (Desde y Hasta) para filtrar.',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else if (desde && hasta && desde === hasta) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'Debe seleccionar fechas (Desde y Hasta) diferentes.',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else if (desde && hasta && hasta < desde) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        // Mensaje corregido para tener más sentido
                        text: 'La fecha "Hasta" no puede ser anterior a la fecha "Desde".', 
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else {
                    getEntradasVendidas(desde, hasta);
                }
            });
        } else {
            console.error("No se encontró el botón con id 'btnAplicarFiltro'");
        }

        if (!inputDesde || !inputHasta) {
            console.error("No se encontraron los inputs de fecha con id 'filtroFechaDesde' o 'filtroFechaHasta'");
        }

        // Grafico 3
        getPromedioXFuncion(); 

        const btnAplicarProm = document.getElementById('btnAplicarFiltro_Prom');
        const inputDesdeProm = document.getElementById('filtroFechaDesde_Prom');
        const inputHastaProm = document.getElementById('filtroFechaHasta_Prom');

        if (btnAplicarProm) {
            btnAplicarProm.addEventListener('click', () => {
                const desde = inputDesdeProm.value;
                const hasta = inputHastaProm.value;

                if ((desde && !hasta) || (!desde && hasta)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'Debe seleccionar ambas fechas (Desde y Hasta) para filtrar.',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else if (desde && hasta && desde === hasta) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'Debe seleccionar fechas (Desde y Hasta) diferentes.',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else if (desde && hasta && hasta < desde) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'La fecha "Hasta" no puede ser anterior a la fecha "Desde".', 
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else {
                    getPromedioXFuncion(desde, hasta);
                }
            });
        } else {
            console.error("No se encontró el botón con id 'btnAplicarFiltro_Prom'");
        }

        if (!inputDesdeProm || !inputHastaProm) {
            console.error("No se encontraron los inputs de fecha con id 'filtroFechaDesde_Prom' o 'filtroFechaHasta_Prom'");
        }

        // Grafico 4 - Clientes Frecuentes
        loadClientes();

        const btnAplicarCli = document.getElementById('btnAplicarFiltro_Cli');
        const inputDesdeCli = document.getElementById('filtroFechaDesde_Cli');
        const inputHastaCli = document.getElementById('filtroFechaHasta_Cli');
        const inputComprasCli = document.getElementById('filtroCompras_Cli');

        if (btnAplicarCli) {
            btnAplicarCli.addEventListener('click', () => {
                const desde = inputDesdeCli.value;
                const hasta = inputHastaCli.value;
                const compra = inputComprasCli.value;

                if ((desde && !hasta) || (!desde && hasta)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en filtro de fecha',
                        text: 'Debe seleccionar ambas fechas (Desde y Hasta) para filtrar por rango.',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                    return;
                }
                if (desde && hasta && hasta < desde) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en filtro de fecha',
                        text: 'La fecha "Hasta" no puede ser anterior a la fecha "Desde".',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                    return;
                }
                if (compra) {
                    const compraNum = Number(compra);
                    if (compraNum <= 0 || !Number.isInteger(compraNum)) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error en filtro de compras',
                            text: 'La cantidad de compras debe ser un número entero y mayor a 0.',
                            background: '#1e1d2c', color: '#ffffff'
                        });
                        return;
                    }
                }
                
                loadClientes(desde, hasta, compra);
            });
        }

        if (!btnAplicarCli || !inputDesdeCli || !inputHastaCli || !inputComprasCli) {
            console.error("Faltan elementos del DOM para el filtro de Clientes Frecuentes.");
        }


        // Grafico 5 - Peliculas Mas Vistas
        loadPeliculas();

        const btnAplicarPel = document.getElementById('btnAplicarFiltro_Pel');
        const inputDesdePel = document.getElementById('filtroFechaDesde_Pel');
        const inputHastaPel = document.getElementById('filtroFechaHasta_Pel');
        const inputRecaudadoPel = document.getElementById('filtroRecaudado_Pel');

        if (btnAplicarPel) {
            btnAplicarPel.addEventListener('click', () => {
                const desde = inputDesdePel.value;
                const hasta = inputHastaPel.value;
                const recaudado = inputRecaudadoPel.value;

                if ((desde && !hasta) || (!desde && hasta)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'Debe seleccionar ambas fechas (Desde y Hasta) para filtrar por rango.',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                    return;
                }
                
                if (desde && hasta && hasta < desde) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'La fecha "Hasta" no puede ser anterior a la fecha "Desde".', 
                        background: '#1e1d2c', color: '#ffffff'
                    });
                    return;
                }
                
                if (recaudado) {
                    const recaudadoNum = Number(recaudado);
                    if (recaudadoNum <= 0 || !Number.isInteger(recaudadoNum)) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error en filtro de recaudación',
                            text: 'El monto recaudado debe ser un número entero y mayor a 0.',
                            background: '#1e1d2c', color: '#ffffff'
                        });
                        return;
                    }
                }
                
                loadPeliculas(desde, hasta, recaudado);
            });
        
        }

        if (!btnAplicarPel || !inputDesdePel || !inputHastaPel || !inputRecaudadoPel) {
            console.error("Faltan elementos del DOM para el filtro de Películas.");
        }

        // Grafico 6 - Productos Mas Vendidos
        getProductosMasVendidos();

        const btnAplicarProd = document.getElementById('btnAplicarFiltro_Prod');
        const inputDesdeProd = document.getElementById('filtroFechaDesde_Prod');
        const inputHastaProd = document.getElementById('filtroFechaHasta_Prod');

        if (btnAplicarProd) {
            btnAplicarProd.addEventListener('click', () => {
                const desde = inputDesdeProd.value;
                const hasta = inputHastaProd.value;

                if ((desde && !hasta) || (!desde && hasta)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'Debe seleccionar ambas fechas (Desde y Hasta) para filtrar.',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else if (desde && hasta && desde === hasta) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'Debe seleccionar fechas (Desde y Hasta) diferentes.',
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else if (desde && hasta && hasta < desde) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al filtrar datos',
                        text: 'La fecha "Hasta" no puede ser anterior a la fecha "Desde".', 
                        background: '#1e1d2c', color: '#ffffff'
                    });
                }
                else {
                    getProductosMasVendidos(desde, hasta);
                }
            });
        }

        if (!btnAplicarProd || !inputDesdeProd || !inputHastaProd) {
            console.error("Faltan elementos del DOM para el filtro de Productos.");
        }
    }
});

/* GRAFICO #1 -- Recaudacion Entradas Total Por Dia */
async function getEntradasVendidas(fechaDesde = null, fechaHasta = null) {
    try{
        let fetchUrl = `${URL}/EntradasRecaudacionXDia`;
        
        if (fechaDesde && fechaHasta) {
            const params = new URLSearchParams({
                fechaInicio: fechaDesde,
                fechaFin: fechaHasta
            });
            fetchUrl += `?${params.toString()}`;
        }

        const entradasVendidasXDia = await fetch(fetchUrl);
        
        if(!entradasVendidasXDia.ok){
            throw new Error("No se pudo cargar la recaudación");
        }
        const json = await entradasVendidasXDia.json();
        const rows = json;

        let labelsDia, dataEntradas, dataRecaudacion;

        if (fechaDesde && fechaHasta) {
            const dataMap = new Map(rows.map(row => [row.fecha, row]));
            const allDates = getAllDatesInRange(fechaDesde, fechaHasta);
            labelsDia = allDates;
            
            dataEntradas = allDates.map(date => {
                const row = dataMap.get(date);
                return row ? Number(row.entradas_vendidas) : 0;
            });
            dataRecaudacion = allDates.map(date => {
                const row = dataMap.get(date);
                return row ? parseCurrency(row.recaudacion_total) : 0;
            });

        } else {
            labelsDia = rows.map(r => r.fecha);
            dataEntradas = rows.map(e => Number(e.entradas_vendidas) );
            dataRecaudacion = rows.map(t => parseCurrency(t.recaudacion_total) );
        }

        const dataDia = {
        labels: labelsDia,
        datasets: [{
                    label: 'Entradas Vendidas',
                    data: dataEntradas,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Recaudación',
                    data: dataRecaudacion,
                    fill: false,
                    borderColor: 'rgb(153, 102, 255)',
                    tension: 0.1
                }
        ]
        };
        
        const ctxEntradasDia = document.getElementById('chartEntradasDia');
        if (ctxEntradasDia) { 
            if (chartEntradasDiaInstance) {
                chartEntradasDiaInstance.destroy();
            }
            chartEntradasDiaInstance = new Chart(ctxEntradasDia, {
                type: 'line',
                data: dataDia,
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            });
        }

        //Entradas Totales
        const entradasTotal = document.getElementById('totalEntradas');
        const totEnt = rows.reduce((sum, row) => {
            const v = Number(row.entradas_vendidas);
            return sum + (isNaN(v) ? 0 : v);
        }, 0);
        entradasTotal.textContent = totEnt.toLocaleString('en-US');

        //Recaudacion Total
        const recaudacionTotal = document.getElementById('totalRecaudacion');
        const totRec = rows.reduce((sum, row) => {
            const v = parseCurrency(row.recaudacion_total);
            return sum + (isNaN(v) ? 0 : v);
        }, 0);
        recaudacionTotal.textContent = '$' + totRec.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    catch(error){
        console.error("Error", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudieron cargar los datos del servidor.',
            background: '#1e1d2c', color: '#ffffff'
        });
    }
}

/* GRAFICO 2 | No tiene ningun parametro */
async function getFuncionesXHorario(){
    try{
        const funcionesXHorario = await fetch(`${URL}/CantidadFuncionesPorFranjaHoraria`);
        if(!funcionesXHorario.ok){
            throw new Error("No se pudieron cargar los horarios");
        }
        const json = await funcionesXHorario.json();
        const rows = json;
        const labelsTurnos = rows.map(r => r.franja_horaria);
        const dataFunciones = rows.map(e => Number(e.cantidad_funciones) );

        const dataHoraria = {
        labels: labelsTurnos,
        datasets: [{
            label: 'Funciones',
            data: dataFunciones,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
        }]
        };

        const ctxFranjaHoraria = document.getElementById('chartFranjaHoraria');
        if (ctxFranjaHoraria) {
            new Chart(ctxFranjaHoraria, {
                type: 'bar',
                data: dataHoraria,
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            });
        }
    }
    catch(error){
        console.error("Error", error);
    }
}

/* GRAFICO 3 | Filtrar por fechas  */
async function getPromedioXFuncion(fechaDesde = null, fechaHasta = null){
    try{
        let fetchUrl = `${URL}/PromedioEntradasVendidasXSala`;
        if (fechaDesde && fechaHasta) {
            const params = new URLSearchParams({
                fechaInicio: fechaDesde,
                fechaFin: fechaHasta
            });
            fetchUrl += `?${params.toString()}`;
        }

        const promedioXFuncion = await fetch(fetchUrl);
        if(!promedioXFuncion.ok){
            throw new Error("No se pudieron cargar los promedios");
        }
        const json = await promedioXFuncion.json();
        const rows = json;
        const labelsProm = rows.map(r => Number(r.ocupacion_promedio));
        const dataSala = rows.map(e => e.nom_sala );

        const dataSalas = {
            labels: dataSala,
            datasets: [{
                label: 'Promedio de Entradas',
                data: labelsProm,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)', 'rgba(255, 102, 242, 0.2)'
                ],
                borderColor: [
                'rgb(255, 99, 132)', 'rgb(54, 162, 235)',
                'rgb(255, 206, 86)', 'rgb(75, 192, 192)',
                'rgb(153, 102, 255)', 'rgba(255, 102, 250, 1)'
                ],
                borderWidth: 1
            }]
        };

        const ctxPromedioSalas = document.getElementById('chartPromedioSalas');
        if (ctxPromedioSalas) {
            
            if (chartPromedioSalasInstance) {
                chartPromedioSalasInstance.destroy();
            }

            // 3. Crear y guardar la nueva instancia
            chartPromedioSalasInstance = new Chart(ctxPromedioSalas, {
                type: 'bar',
                data: dataSalas,
                options: {
                    indexAxis: 'y', // <-- Esto lo hace horizontal
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            });
        }
    }
    catch(error){
        console.error("Error en getPromedioXFuncion:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar gráfico',
            text: 'No se pudo cargar el promedio por función.',
            background: '#1e1d2c', color: '#ffffff'
        });
    }
}

/* GRAFICO 4 | Clientes Frecuentes: Filtrar por fechas - Cantidad Compras */
function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}
function renderRows(rows) {
    const tbody = document.getElementById('clientesBody');
    const msg = document.getElementById('clientesMsg');
    clearContainer(tbody);
    msg.textContent = '';

    if (!rows || rows.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan', '3');
        td.className = 'text-center text-muted';
        msg.textContent = 'No se encontraron clientes con esos filtros.'; 
        tbody.appendChild(tr); 
        return;
    }

    rows.forEach(r => {
    const tr = document.createElement('tr');

    const tdNombre = document.createElement('td');
    tdNombre.textContent = r.nom_cliente || "-";

    const tdApellido = document.createElement('td');
    tdApellido.textContent = r.ape_cliente || "-";

    const tdTotal = document.createElement('td');
    tdTotal.textContent = r.total_compras || "-";

    tr.appendChild(tdNombre);
    tr.appendChild(tdApellido);
    tr.appendChild(tdTotal);

    tbody.appendChild(tr);
    });
}
async function fetchClientesFrecuentes(fechaDesde = null, fechaHasta = null, compra = null) {
    
    const params = new URLSearchParams();
    
    if (fechaDesde && fechaHasta) {
        params.append('fechaInicio', fechaDesde);
        params.append('fechaFin', fechaHasta);
    }
    if (compra) {
        params.append('compra', compra);
    }

    let fetchUrl = `${URL}/ClientesFrecuentes`;
    const queryString = params.toString();

    if (queryString) {
        fetchUrl += `?${queryString}`;
    }
    
    const res = await fetch(fetchUrl);
    if(!res.ok){
        throw new Error("No se pudieron cargar los clientes frecuentes");
    }
    return res.json();
}
async function loadClientes(fechaDesde = null, fechaHasta = null, compra = null) {
    const tbody = document.getElementById('clientesBody');
    const msg = document.getElementById('clientesMsg');
    clearContainer(tbody);
    msg.textContent = 'Cargando...';

    try {
        const json = await fetchClientesFrecuentes(fechaDesde, fechaHasta, compra);
        
        const rows = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (Array.isArray(json.rows) ? json.rows : []));

        const top5 = rows.slice(0, 5);

        renderRows(top5);
    } catch (err) {
        console.error('Error al cargar clientes frecuentes:', err);
        clearContainer(tbody);
        msg.textContent = 'Error cargando datos.';
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: err.message || 'No se pudieron cargar los clientes.',
            background: '#1e1d2c', color: '#ffffff'
        });
    }
}

/* GRAFICO 5 | PELICULAS MAS VISTAS: Filtrar por fechas y Recaudacion */
function clear(el){
    while (el.firstChild) el.removeChild(el.firstChild);
}
function renderPeliculas(rows) {
    const ul = document.getElementById('peliculasLista');
    const msg = document.getElementById('peliculasMsg');
    clear(ul);
    msg.textContent = '';

    if (!rows || rows.length === 0) {
        msg.textContent = 'No se encontraron películas con esos filtros.';
        return;
    }

    rows.forEach(r => {
        const li = document.createElement('li');
        
        const spanNombre = document.createElement('span');
        spanNombre.className = 'pelicula-nombre';
        spanNombre.textContent = r.pelicula ?? 'Película Desconocida';
        li.appendChild(spanNombre);

        const divDatos = document.createElement('div');
        divDatos.className = 'pelicula-datos-wrapper';

        const spanRecaudado = document.createElement('span');
        spanRecaudado.className = 'pelicula-dato-recaudado me-3';

        const recaudadoNum = parseCurrency(r.recaudacion_total);
        spanRecaudado.innerHTML = `<i class="bi bi-cash-stack"></i> $${recaudadoNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        const spanEntradas = document.createElement('span');
        spanEntradas.className = 'pelicula-dato-entradas';
        spanEntradas.innerHTML = `<i class="bi bi-ticket-perforated"></i> Entradas: ${r.entradas_vendidas ?? 0}`;

        divDatos.appendChild(spanRecaudado);
        divDatos.appendChild(spanEntradas);
        li.appendChild(divDatos);
        ul.appendChild(li);
    });
}
async function fetchPeliculas(fechaDesde = null, fechaHasta = null, recaudado = null) {
    
    let fetchUrl = `${URL}/RecaudacionTotalXPelicula`;
    const params = new URLSearchParams();

    if (fechaDesde && fechaHasta) {
        params.append('filtroFechaDesde_Pel', fechaDesde);
        params.append('filtroFechaHasta_Pel', fechaHasta);
    }
    if (recaudado) {
        params.append('filtroRecaudado_Pel', recaudado);
    }
    
    const queryString = params.toString();
    if (queryString) {
        fetchUrl += `?${queryString}`;
    }

    const res = await fetch(fetchUrl);
    if(!res.ok){
        throw new Error("No se pudieron cargar las películas");
    }
    return res.json();
}
async function loadPeliculas(fechaDesde = null, fechaHasta = null, recaudado = null) {
    const msg = document.getElementById('peliculasMsg');
    const ul = document.getElementById('peliculasLista');
    clearContainer(ul);
    msg.textContent = 'Cargando...';

    try {
        const json = await fetchPeliculas(fechaDesde, fechaHasta, recaudado);
        
        let rows = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (Array.isArray(json.rows) ? json.rows : []));

        renderPeliculas(rows);
    } catch (err) {
        console.error('Error cargando películas:', err);
        msg.textContent = 'Error cargando datos.';
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: err.message || 'No se pudieron cargar las películas.',
            background: '#1e1d2c', color: '#ffffff'
        });
    }
}

/* GRAFICO 6 | Productos Mas Vendidos: Filtrar por fechas */
async function getProductosMasVendidos(fechaDesde = null, fechaHasta = null){
    try{
        let fetchUrl = `${URL}/ProductosMasVendidos`;
        if (fechaDesde && fechaHasta) {
            const params = new URLSearchParams({
                fechaInicio: fechaDesde,
                fechaFin: fechaHasta
            });
            fetchUrl += `?${params.toString()}`;
        }

        const productosMasVendidos = await fetch(fetchUrl);
        if(!productosMasVendidos.ok){
            throw new Error("No se pudieron cargar los productos mas vendidos");
        }
        const json = await productosMasVendidos.json();

        const rows = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (Array.isArray(json.rows) ? json.rows : []));

        if (!rows) {
            console.error("No se pudo encontrar el array de datos en ProductosMasVendidos");
            return;
        }

        const labelsConsumible = rows.map(e => e.nom_consumible);
        const dataCantidad = rows.map(r => parseCurrency(r.total_vendido));

        const dataProductos = {
        labels: labelsConsumible,
        datasets: [{
            label: 'Unidades Vendidas',
            data: dataCantidad,
            backgroundColor: [
                'rgba(153, 102, 255, 0.2)', 'rgba(75, 192, 192, 0.2)',
                'rgba(255, 206, 86, 0.2)', 'rgba(54, 162, 235, 0.2)',
                'rgba(255, 99, 132, 0.2)'
            ],
            borderColor: [
                'rgb(153, 102, 255)', 'rgb(75, 192, 192)',
                'rgb(255, 206, 86)', 'rgb(54, 162, 235)',
                'rgb(255, 99, 132)'
            ],
            borderWidth: 1
        }]
        };

        const ctxProductosTop = document.getElementById('chartProductosTop');
        if (ctxProductosTop) {
            if (chartProductosTopInstance) {
                chartProductosTopInstance.destroy();
            }
            chartProductosTopInstance = new Chart(ctxProductosTop, {
                type: 'bar',
                data: dataProductos,
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            });
        }

        //RECAUDACION TOTAL X COMBOS
        const recaudacionTotal = document.getElementById('recaudacionTotal');
        const totCombos = rows.reduce((sum, row) => {
            const v = parseCurrency(row.total_vendido); 
            return sum + (isNaN(v) ? 0 : v);
        }, 0);
        recaudacionTotal.textContent = '$' + totCombos.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    catch(error){
        console.error("Error en getProductosMasVendidos:", error);
         Swal.fire({
            icon: 'error',
            title: 'Error al cargar Confitería',
            text: 'No se pudieron cargar los productos más vendidos.',
            background: '#1e1d2c', color: '#ffffff'
        });
    }
}

/* DISCLAIMER DE AQUI PARA ABAJO LAS COSAS PIPO NO LAS TOCO SI EL CODIGO ES MUY FEO, PIPO NO SE HACE RESPONSABLE */

//PROXIMAS FUNCIONES
async function fetchFuncionesProximas() {
  //fetch
    const res = await fetch(`${URL}/ProximasFunciones`);
        if(!res.ok){
            throw new Error("No se pudieron cargar las proximas funciones");
        }
    return await res.json();
}

function clearContainer(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
}

function createInfoRow(iconClass, text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex';

    const icon = document.createElement('i');
    icon.className = iconClass + ' me-2 icons-dashboard';
    icon.setAttribute('aria-hidden', 'true');

    const p = document.createElement('p');
    p.className = ''; // mantén estilos si quieres
    p.textContent = text;

    wrapper.appendChild(icon);
    wrapper.appendChild(p);
    return wrapper;
}

function renderFunciones(rows) {
    const grid = document.getElementById('funcionesGrid');
    const msg = document.getElementById('funcionesMsg');
    clearContainer(grid);
    msg.textContent = '';

    if (!rows || rows.length === 0) {
        msg.textContent = 'No hay próximas funciones.';
        return;
    }

    rows.forEach(row => {
        // Ajusta las propiedades según tu JSON: row.titulo, row.sala, etc.
        const item = document.createElement('div');
        item.className = 'funcion-item mb-3';

        const title = document.createElement('p');
        title.className = 'fw-bold';
        title.textContent = row.nom_pelicula || 'Título desconocido';

        item.appendChild(title);

        // Sala
        if (row.nom_sala) {
        item.appendChild(createInfoRow('bi bi-film', row.nom_sala));
        }

        // Hora
        if (row.horario) {
        item.appendChild(createInfoRow('bi bi-clock', row.horario));
        }

        // Idioma / formato
        if (row.idioma) {
        item.appendChild(createInfoRow('bi bi-translate', row.idioma));
        }

        grid.appendChild(item);
    });
}

async function loadAndRenderFunciones() {
    const grid = document.getElementById('funcionesGrid');
    const msg = document.getElementById('funcionesMsg');

    // estado loading
    clearContainer(grid);
    msg.textContent = 'Cargando...';

    try {
        const json = await fetchFuncionesProximas();

        // adapta según la estructura real: json.data o json
        const rows = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (json.rows || []));
        const top4 = rows.slice(0,4);
        renderFunciones(top4);
    } catch (err) {
        console.error('Error al cargar funciones:', err);
        clearContainer(grid);
        msg.textContent = 'Error cargando próximas funciones.';
    }
}

async function getKPIsDashboard(){
    try{
        //TOTAL ENTRADAS VENDIDAS
        const totalEntradas = await fetch(`${URL}/TotalEntradasVendidas`);
        if(!totalEntradas.ok){
            throw new Error("No se pudo cargar el total de entradas vendidas");
        }
        const jsonTotEntradas = await totalEntradas.json();
        const rowsTotEntradas = jsonTotEntradas;

        const totEntradas = document.getElementById('total-entradas-vendidas');

        totEntradas.innerHTML = rowsTotEntradas[0].entradasVendidas;

        //RECAUDACION TOTAL
        const recaudacionTotal = await fetch(`${URL}/RecaudacionTotal`);
        if(!recaudacionTotal.ok){
            throw new Error("No se pudo cargar la recaudacion total");
        }
        const jsonTotRecaudacion = await recaudacionTotal.json();
        const rowsTotRecaudacion = jsonTotRecaudacion;

        const recaudacionTot = document.getElementById('recaudacion-total');

        recaudacionTot.innerHTML = '$' + rowsTotRecaudacion[0].recaudacionTotal;

        //CANT PELICULAS EN CARTELERA
        const peliculasCartelera = await fetch(`${URL}/PeliculasEnCartelera`);
        if(!peliculasCartelera.ok){
            throw new Error("No se pudo cargar la cartelera actual");
        }
        const jsonPeliculasCart = await peliculasCartelera.json();
        const rowsPeliculasCart = jsonPeliculasCart;

        const peliculasCart = document.getElementById('peliculas-activas');

        peliculasCart.innerHTML = rowsPeliculasCart[0].peliculasCartelera;

        //TOT CLIENTES REGISTRADOS
        const clientesRegistrados = await fetch(`${URL}/TotalClientesRegistrados`);
        if(!clientesRegistrados.ok){
            throw new Error("No se pudo cargar la cartelera actual");
        }
        const jsonClientes = await clientesRegistrados.json();
        const rowsClientes = jsonClientes;

        const clientesRegis = document.getElementById('clientes-registrados');

        clientesRegis.innerHTML = rowsClientes[0].clientesRegistrados;
    }
    catch(error){
        console.error("Error", error);
    }


}

// Función principal que inicializa todo el dashboard
function initDashboardInternal() {
    console.log("Inicializando dashboard...");
    
    // --GRAFICO 1: Recaudacion Entradas Total X Dia
    getEntradasVendidas();

    // --- GRÁFICO 2: Promedio por Salas (Barras Horizontales) ---
    getPromedioXFuncion();

    // --- GRÁFICO 3: Franja Horaria (Barras) ---
    getFuncionesXHorario();

    // --- PROXIMAS FUNCIONES
    loadAndRenderFunciones();

    // --- CLIENTES FRECUENTES
    loadClientes();

    // --- TOP 5 PELICULAS MAS VISTAS
    loadPeliculas();

    // --- GRÁFICO 4: Top Productos Confitería (Horiz) ---
    getProductosMasVendidos();

    // --- KPIS
    getKPIsDashboard();
}

// Función para limpiar gráficos existentes (evita duplicados)
function clearExistingCharts() {
    console.log("Limpiando gráficos existentes...");
    // Destruir gráficos existentes si los hay
    const chartElements = ['chartEntradasDia', 'chartPromedioSalas', 'chartFranjaHoraria', 'chartProductosTop'];
    
    chartElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            // Verificar si tiene gráfico de Chart.js
            if (element.chart) {
                console.log(`Destruyendo gráfico existente: ${elementId}`);
                element.chart.destroy();
            }
            // También verificar en el registro global de Chart.js
            const chart = Chart.getChart(element);
            if (chart) {
                console.log(`Destruyendo gráfico global existente: ${elementId}`);
                chart.destroy();
            }
        }
    });
}

// Exponer la función globalmente para que se pueda llamar desde otras páginas
window.initDashboard = function() {
    console.log("window.initDashboard llamada");
    
    // Verificar que estamos en la página correcta
    if (!document.getElementById('chartEntradasDia')) {
        console.log("No estamos en la página del dashboard - elemento chartEntradasDia no encontrado");
        return;
    }
    
    console.log("Elemento chartEntradasDia encontrado, inicializando dashboard...");
    clearExistingCharts();
    // Llamar a la función interna, no a sí misma
    initDashboardInternal();
};

// También escuchar eventos de navegación si usas un router específico
document.addEventListener('pageChanged', function(event) {
    if (event.detail && event.detail.page === 'dashboard') {
        setTimeout(() => {
            if (document.getElementById('chartEntradasDia')) {
                clearExistingCharts();
                initDashboardInternal();
            }
        }, 100);
    }
});



// Hacer las funciones disponibles globalmente
window.navigateTo = navigateTo;
window.setupHomeButtonsVisibility = setupHomeButtonsVisibility;
