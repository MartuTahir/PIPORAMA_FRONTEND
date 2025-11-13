

const URL = "https://localhost:7169/api/Dashboard";

async function getEntradasVendidas() {
    try{

        //Entradas y Recaudacion X Dia
        const entradasVendidasXDia = await fetch(`${URL}/EntradasRecaudacionXDia`);
        if(!entradasVendidasXDia.ok){
            throw new Error("No se pudo cargar la recaudación");
        }
        const json = await entradasVendidasXDia.json();
        const rows = json;
        const labelsDia = rows.map(r => r.fecha);
        const dataEntradas = rows.map(e => Number(e.entradas_vendidas) );
        const dataRecaudacion = rows.map(t => Number(t.recaudacion_total) );

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
        if (ctxEntradasDia) { // Verificamos que exista antes de crear el gráfico
            new Chart(ctxEntradasDia, {
                type: 'line',
                data: dataDia,
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            });
        }

        //Entradas Total
        const entradasTotal = document.getElementById('totalEntradas');
        const totEnt = rows.reduce((sum, row) => {
            const v = Number(row.entradas_vendidas);
            return sum + (isNaN(v) ? 0 : v);
        }, 0);

        entradasTotal.textContent = totEnt;

        //Recaudacion Total
        const recaudacionTotal = document.getElementById('totalRecaudacion');
        const totRec = rows.reduce((sum, row) => {
            const v = Number(row.recaudacion_total);
            return sum + (isNaN(v) ? 0 : v);
        }, 0);

        recaudacionTotal.textContent = '$' + totRec;
    }
    catch(error){
        console.error("Error", error);
    }
}

//GRAFICO 2 
async function getPromedioXFuncion(){
    try{
        const promedioXFuncion = await fetch(`${URL}/PromedioEntradasVendidasXSala`);
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
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)'
            ],
            borderWidth: 1
        }]
        };

        const ctxPromedioSalas = document.getElementById('chartPromedioSalas');
        if (ctxPromedioSalas) {
            new Chart(ctxPromedioSalas, {
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
        console.error("Error", error);
    }
}

//GRAFICO 3
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

//PROXIMAS FUNCIONES
async function fetchFuncionesProximas() {
  //fetch
    const res = await fetch(`${URL}/ProximasFunciones`);
        if(!res.ok){
            throw new Error("No se pudieron cargar las proximas funciones");
        }
    return await res.json();
}

//
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


//CLIENTES FRECUENTES


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
        td.textContent = 'No hay clientes frecuentes.';
        tr.appendChild(td);
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
    // mostrar el total exactamente como viene en el JSON, sin parseos ni formateos
    tdTotal.textContent = r.total_compras || "-";

    tr.appendChild(tdNombre);
    tr.appendChild(tdApellido);
    tr.appendChild(tdTotal);

    tbody.appendChild(tr);
    });
}

async function fetchClientesFrecuentes() {
    //fetch
    const res = await fetch(`${URL}/ClientesFrecuentes`);
        if(!res.ok){
            throw new Error("No se pudieron cargar las proximas funciones");
        }
    return res.json();
}

async function loadClientes() {
    const tbody = document.getElementById('clientesBody');
    const msg = document.getElementById('clientesMsg');
    clearContainer(tbody);
    msg.textContent = 'Cargando...';

    try {
        const json = await fetchClientesFrecuentes();
        const rows = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (Array.isArray(json.rows) ? json.rows : []));

        // tomar las primeras 5 tal cual vienen (no se reordenan ni se parsean los totales)
        const top5 = rows.slice(0, 5);

        renderRows(top5);
    } catch (err) {
        console.error('Error al cargar clientes frecuentes:', err);
        clearContainer(tbody);
        msg.textContent = 'Error cargando datos.';
    }
}



//PELICULAS MAS VISTAS
function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }


function renderPeliculas(rows) {
    const ul = document.getElementById('peliculasLista');
    const msg = document.getElementById('peliculasMsg');
    clear(ul);
    msg.textContent = '';

    if (!rows || rows.length === 0) {
        msg.textContent = 'No hay datos de películas.';
        return;
    }

    rows.forEach(r => {
        const li = document.createElement('li');

        const spanNombre = document.createElement('span');
        spanNombre.className = 'pelicula-nombre';
        // mostrar título tal cual viene (ajusta la clave si tu JSON usa 'titulo'/'name' etc.)
        spanNombre.textContent = r.nom_pelicula ??  '';

        const spanDato = document.createElement('span');
        spanDato.className = 'pelicula-dato';
        // mostrar las entradas exactamente como vienen en el JSON, sin formateo
        // (ajusta la clave: 'entradas' / 'cantidad' / 'tickets' según tu API)
        spanDato.textContent = 'Entradas: ' + (r.total_entradas ??  '');

        li.appendChild(spanNombre);
        li.appendChild(spanDato);
        ul.appendChild(li);
    });
}

async function fetchPeliculas() {
    //fetch
    const res = await fetch(`${URL}/PeliculasMasVistas`);
        if(!res.ok){
            throw new Error("No se pudieron cargar las proximas funciones");
        }
    return res.json();
}

async function loadPeliculas() {
    const msg = document.getElementById('peliculasMsg');
    clear(document.getElementById('peliculasLista'));
    msg.textContent = 'Cargando...';

    try {
        const json = await fetchPeliculas();
        // detectar array en json.data o json directamente
        let rows = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (Array.isArray(json.rows) ? json.rows : []));


        renderPeliculas(rows);
    } catch (err) {
        console.error('Error cargando películas:', err);
        document.getElementById('peliculasMsg').textContent = 'Error cargando datos.';
    }
}


//GRAFICO 4
async function getProductosMasVendidos(){
    try{
        const productosMasVendidos = await fetch(`${URL}/ProductosMasVendidos`);
        if(!productosMasVendidos.ok){
            throw new Error("No se pudieron cargar los productos mas vendidos");
        }
        const json = await productosMasVendidos.json();
        const rows = json;
        const labelsConsumible = rows.map(e => e.nom_consumible);
        const dataCantidad = rows.map(r => Number(r.total_vendido));

        const dataProductos = {
        labels: labelsConsumible,
        datasets: [{
            label: 'Unidades Vendidas',
            data: dataCantidad,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgb(153, 102, 255)',
            borderWidth: 1
        }]
    };

    const ctxProductosTop = document.getElementById('chartProductosTop');
    if (ctxProductosTop) {
        new Chart(ctxProductosTop, {
            type: 'bar',
            data: dataProductos,
            options: {
                indexAxis: 'y', // <-- Horizontal
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });
    }

    //RECAUDACION TOTAL X COMBOS
    const recaudacionTotal = document.getElementById('recaudacionTotal');
        const totCombos = rows.reduce((sum, row) => {
            const v = Number(row.ingresos_generados);
            return sum + (isNaN(v) ? 0 : v);
        }, 0);

        recaudacionTotal.textContent = '$' + totCombos;
    }
    catch(error){
        console.error("Error", error);
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



/* ---
Usamos "DOMContentLoaded" para asegurarnos de que este script
se ejecute SOLO DESPUÉS de que todo el HTML esté cargado.
Esto evita errores de "no se puede encontrar el elemento".
--- */
document.addEventListener("DOMContentLoaded", function(){

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
    //TOTAL ENTRADAS VENDIDAS
    getKPIsDashboard();
    

    /* NOTA: Tu HTML tiene un canvas 'grafico-ejemplo' que parece ser
    un duplicado de 'chartEntradasDia'. Lo he ignorado para evitar
    confusión y he usado los IDs que comentaste en tu HTML.
    */

});