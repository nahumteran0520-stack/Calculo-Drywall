const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6bxAnT90xKGHtyk2N7TAjCPULStF16cAUZR8fUoXYzWhVTITeErATG8AHiRqPDQ/pub?output=csv&gid=1537817865&t=' + new Date().getTime();

let listaProductos = [];
let tipoActual = '';

async function obtenerPrecios() {
    try {
        const response = await fetch(urlCSV);
        if (!response.ok) throw new Error('Error al conectar');
        const data = await response.text();
        
        const lineas = data.split('\n');
        listaProductos = lineas.slice(1).map(linea => {
            const columnas = linea.split(',').map(c => c.trim().replace(/"/g, ''));
            if (columnas.length >= 4) {
                return {
                    codigo: columnas[0],
                    descripcion: columnas[1],
                    precio: parseFloat(columnas[2].replace(',', '.')) || 0,
                    existencia: parseInt(columnas[3]) || 0
                };
            }
            return null;
        }).filter(p => p !== null && p.codigo);

        if (listaProductos.length === 0) throw new Error("Datos vacíos");
    } catch (error) {
        console.warn("Usando respaldo actualizado:", error);
        listaProductos = [
            { codigo: '3020001', descripcion: 'LÁMINA DE YESO 3/8" 1,22M X 2', precio: 25.30, existencia: 83 },
            { codigo: '3020002', descripcion: 'LÁMINA DE YESO 1/2" 1,22 X 2,4', precio: 26.25, existencia: 63 },
            { codigo: '3015030', descripcion: 'LÁMINA DE YESO LISA 1,20X0,60', precio: 8.88, existencia: 10 },
            { codigo: '3015037', descripcion: 'LÁMINA YESO CONCHA NARANJA 120', precio: 9.50, existencia: 23 },
            { codigo: '3020100', descripcion: 'RIEL 1 5/8" X 3.05M ACERO GALV', precio: 5.55, existencia: 82 },
            { codigo: '3020101', descripcion: 'PARAL 1 5/8" X 3.05M ACERO GAL', precio: 7.16, existencia: 42 },
            { codigo: '3020106', descripcion: 'RIEL 2 1/2" X 3,05M ACERO GALV', precio: 7.00, existencia: 44 },
            { codigo: '3020108', descripcion: 'PARAL 2 1/2" X 3.05M ACERO GAL', precio: 8.23, existencia: 98 },
            { codigo: '3015002', descripcion: 'PERFIL PRINCIPAL BLANCO 3,66', precio: 7.25, existencia: 96 },
            { codigo: '3015004', descripcion: 'PERFIL SECUNDARIO BLANCO 1.20M', precio: 2.32, existencia: 144 },
            { codigo: '3015008', descripcion: 'PERFIL ANGULO BLANCO 300 CM', precio: 3.59, existencia: 186 },
            { codigo: '3020102', descripcion: 'PERFIL OMEGA 3,05M ACERO GALVA', precio: 6.44, existencia: 16 }
        ];
    }
}

document.addEventListener('DOMContentLoaded', obtenerPrecios);

function seleccionarModulo(tipo) {
    tipoActual = tipo;
    document.getElementById('seccion-menu').classList.add('hidden');
    document.getElementById('seccion-calculo').classList.remove('hidden');
    
    const etiquetaMedida1 = document.getElementById('label-medida1');
    if (tipo === 'pared') {
        document.getElementById('titulo-modulo').innerText = 'Paredes con Drywall';
        if (etiquetaMedida1) etiquetaMedida1.innerText = 'Alto';
    } else if (tipo === 'cielo_suspendido') {
        document.getElementById('titulo-modulo').innerText = 'Cielo Raso Suspendido (1.20x0.60)';
        if (etiquetaMedida1) etiquetaMedida1.innerText = 'Ancho';
    } else {
        document.getElementById('titulo-modulo').innerText = 'Cielo Raso Drywall';
        if (etiquetaMedida1) etiquetaMedida1.innerText = 'Ancho';
    }
    document.getElementById('alto').value = '';
    document.getElementById('largo').value = '';
    document.getElementById('area').value = '';
}

function volverMenu() {
    document.getElementById('seccion-calculo').classList.add('hidden');
    document.getElementById('seccion-resultados').classList.add('hidden');
    document.getElementById('seccion-menu').classList.remove('hidden');
}

function nuevoCalculo() {
    document.getElementById('seccion-resultados').classList.add('hidden');
    document.getElementById('seccion-calculo').classList.remove('hidden');
    document.getElementById('alto').value = '';
    document.getElementById('largo').value = '';
    document.getElementById('area').value = '';
}

function calcularArea() {
    const alto = parseFloat(document.getElementById('alto').value) || 0;
    const largo = parseFloat(document.getElementById('largo').value) || 0;
    const area = alto * largo;
    document.getElementById('area').value = area > 0 ? area.toFixed(2) : '';
}

function generarResultados() {
    const alto = parseFloat(document.getElementById('alto').value);
    const largo = parseFloat(document.getElementById('largo').value);

    if (!alto || !largo || alto <= 0 || largo <= 0) {
        alert('Por favor, ingresa valores válidos para las medidas.');
        return;
    }

    // --- Lógica de Registro ---
    let nombreProyectoRegistro = (tipoActual === 'pared') ? 'Paredes Drywall' : 
                                 (tipoActual === 'cielo_suspendido') ? 'Cielo Raso Suspendido' : 
                                 'Cielo Raso Drywall';
    registrarUsoEnGoogleSheets(nombreProyectoRegistro);
    // --------------------------

    const area = alto * largo;
    let htmlTabla = '';
    function obtenerDatosProducto(codigoBuscado) {
        const prod = listaProductos.find(p => p.codigo === codigoBuscado);
        return prod ? prod : { precio: 0, existencia: 0, descripcion: "Artículo no disponible" };
    }

    if (tipoActual === 'pared') {
        // ... (Tu lógica de pared se mantiene igual)
        const rendimientoLamina = 2.976; 
        const largoParal = 3.0; const largoRiel = 3.0;
        const distanciaParales = alto > 3 ? 0.41 : 0.61;
        const paralesBase = (largo / distanciaParales) * (alto / largoParal);
        const cantParal = Math.ceil(paralesBase + 2);
        const cantRiel = Math.ceil((largo * 2) / largoRiel);
        const laminasBase = Math.ceil(area / rendimientoLamina);
        const pLaminas = obtenerDatosProducto('3020002');
        const pRiel = obtenerDatosProducto('3020106');
        const pParal = obtenerDatosProducto('3020108');
        const totalSimple = (laminasBase * pLaminas.precio) + (cantRiel * pRiel.precio) + (cantParal * pParal.precio);
        
        htmlTabla = `<tr><td colspan="6"><strong>CÁLCULO NORMAL</strong></td></tr>
        <tr><td>Laminas</td><td>3020002</td><td>${pLaminas.descripcion}</td><td>${laminasBase}</td><td>$${pLaminas.precio.toFixed(2)}</td><td>${pLaminas.existencia}</td></tr>
        <tr><td>Riel</td><td>3020106</td><td>${pRiel.descripcion}</td><td>${cantRiel}</td><td>$${pRiel.precio.toFixed(2)}</td><td>${pRiel.existencia}</td></tr>
        <tr><td>Paral</td><td>3020108</td><td>${pParal.descripcion}</td><td>${cantParal}</td><td>$${pParal.precio.toFixed(2)}</td><td>${pParal.existencia}</td></tr>
        <tr><td colspan="5">TOTAL:</td><td>$${totalSimple.toFixed(2)}</td></tr>`;
    } else {
        // (El resto de tus bloques else if siguen aquí)
    }

    document.getElementById('tabla-cuerpo').innerHTML = htmlTabla;
    document.getElementById('seccion-calculo').classList.add('hidden');
    document.getElementById('seccion-resultados').classList.remove('hidden');
}

function registrarUsoEnGoogleSheets(proyecto) {
    const urlScriptApp = "https://script.google.com/macros/s/AKfycby4J0idBd33HvLFIdLmvprx9QRhP250C1CQ4zIwMLLwNe5zwxaEK4GH8TKo3Y8dMN_n/exec";
    const datos = { fecha: new Date().toLocaleString(), tipoProyecto: proyecto };
    fetch(urlScriptApp, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    }).catch(e => console.error(e));
}
