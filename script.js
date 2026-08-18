const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6bxAnT90xKGHtyk2N7TAjCPULStF16cAUZR8fUoXYzWhVTITeErATG8AHiRqPDQ/pub?gid=1537817865&single=true&output=csv';

// Precios de respaldo por si el navegador bloquea la red
let listaProductos = [
    { codigo: '3020002', descripcion: 'LÁMINA DE YESO 1/2" 1,22 X 2,4', precio: 10.50, existencia: 50 },
    { codigo: '3020106', descripcion: 'RIEL 2 1/2" X 3,05M ACERO GALV', precio: 4.20, existencia: 30 },
    { codigo: '3020108', descripcion: 'PARAL 2 1/2" X 3.05M ACERO GAL', precio: 4.80, existencia: 25 },
    { codigo: '3020001', descripcion: 'LÁMINA DE YESO 3/8" 1,22M X 2', precio: 9.00, existencia: 40 },
    { codigo: '3020100', descripcion: 'RIEL 1 5/8" X 3.05M ACERO GALV', precio: 3.50, existencia: 20 },
    { codigo: '3020101', descripcion: 'PARAL 1 5/8" X 3.05M ACERO GAL', precio: 4.00, existencia: 15 },
    { codigo: '3020102', descripcion: 'PERFIL OMEGA 3,05M ACERO GALVA', precio: 3.20, existencia: 35 }
];

let tipoActual = '';

async function obtenerPrecios() {
    try {
        const response = await fetch(urlCSV);
        if (!response.ok) throw new Error('Error al conectar');
        const data = await response.text();
        
        const lineas = data.split('\n');
        const productosRemotos = lineas.slice(1).map(linea => {
            // Detectar si usa coma o punto y coma como separador
            const separador = linea.includes(';') ? ';' : ',';
            const columnas = linea.split(separador);
            return {
                codigo: columnas[0] ? columnas[0].trim().replace(/"/g, '') : '',
                descripcion: columnas[1] ? columnas[1].trim().replace(/"/g, '') : '',
                precio: parseFloat(columnas[2] ? columnas[2].replace(',', '.') : 0) || 0,
                existencia: parseInt(columnas[3]) || 0
            };
        }).filter(p => p.codigo);
        
        if (productosRemotos.length > 0) {
            listaProductos = productosRemotos;
            console.log("Precios cargados desde Google Sheets exitosamente.");
        }
    } catch (error) {
        console.warn("Usando datos locales de respaldo por restricciones de red.", error);
    }
}

document.addEventListener('DOMContentLoaded', obtenerPrecios);

function seleccionarModulo(tipo) {
    tipoActual = tipo;
    document.getElementById('seccion-menu').classList.add('hidden');
    document.getElementById('seccion-calculo').classList.remove('hidden');
    
    if (tipo === 'pared') {
        document.getElementById('titulo-modulo').innerText = 'Paredes con Drywall';
    } else {
        document.getElementById('titulo-modulo').innerText = 'Cielo Raso Drywall';
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
        alert('Por favor, ingresa valores válidos para el alto/ancho y el largo.');
        return;
    }

    const area = alto * largo;
    let htmlTabla = '';

    function obtenerDatosProducto(codigoBuscado) {
        const prod = listaProductos.find(p => p.codigo === codigoBuscado);
        return prod ? prod : { precio: 0, existencia: 0, descripcion: "Artículo no disponible" };
    }

    if (tipoActual === 'pared') {
        const rendimientoLamina = 2.976; 
        const largoParal = 3.0;
        const largoRiel = 3.0;

        const distanciaParales = alto > 3 ? 0.41 : 0.61;
        const paralesBase = (largo / distanciaParales) * (alto / largoParal);
        const cantParal = Math.ceil(paralesBase + 2);
        const cantRiel = Math.ceil((largo * 2) / largoRiel);
        const laminasBase = Math.ceil(area / rendimientoLamina);
        const cantLaminasSimple = laminasBase;
        const cantLaminasDobleCara = laminasBase * 2;

        const pLaminas = obtenerDatosProducto('3020002');
        const pRiel = obtenerDatosProducto('3020106');
        const pParal = obtenerDatosProducto('3020108');

        const totalSimple = (cantLaminasSimple * pLaminas.precio) + (cantRiel * pRiel.precio) + (cantParal * pParal.precio);

        htmlTabla = `
            <tr><td colspan="6" style="background-color: #e2e8f0; font-weight: bold; color: #1a4472;">CÁLCULO NORMAL (Una sola cara)</td></tr>
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3020002</td>
                <td style="text-align: left;">${pLaminas.descripcion}</td>
                <td><strong>${cantLaminasSimple}</strong></td>
                <td>$${pLaminas.precio.toFixed(2)}</td>
                <td><span style="color: ${pLaminas.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pLaminas.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Riel</strong></td>
                <td>3020106</td>
                <td style="text-align: left;">${pRiel.descripcion}</td>
                <td><strong>${cantRiel}</strong></td>
                <td>$${pRiel.precio.toFixed(2)}</td>
                <td><span style="color: ${pRiel.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pRiel.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Paral</strong></td>
                <td>3020108</td>
                <td style="text-align: left;">${pParal.descripcion} (Sep: ${distanciaParales}m)</td>
                <td><strong>${cantParal}</strong></td>
                <td>$${pParal.precio.toFixed(2)}</td>
                <td><span style="color: ${pParal.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pParal.existencia}</span></td>
            </tr>
            <tr>
                <td colspan="5" style="text-align: right;"><strong>ESTIMADO TOTAL:</strong></td>
                <td><strong>$${totalSimple.toFixed(2)}</strong></td>
            </tr>

            <tr><td colspan="6" style="background-color: #cbd5e1; font-weight: bold; color: #1a4472;">CÁLCULO POR AMBOS LADOS (Doble cara)</td></tr>
            <tr>
                <td><strong>Laminas (Doble)</strong></td>
                <td>3020002</td>
                <td style="text-align: left;">${pLaminas.descripcion}</td>
                <td><strong>${cantLaminasDobleCara}</strong></td>
                <td>$${pLaminas.precio.toFixed(2)}</td>
                <td><span style="color: ${pLaminas.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pLaminas.existencia}</span></td>
            </tr>
        `;
    } else {
        const anchoArea = alto; 
        const largoArea = largo;
        const rendimientoLamina = 2.976;
        const largoPerfil = 3.0;

        const cantLaminasCielo = Math.ceil(area / rendimientoLamina);
        const cantRielCielo = Math.ceil(((anchoArea + largoArea) / largoPerfil) * 2);
        const cantParalCielo = Math.ceil((largoArea / largoPerfil) * (anchoArea / 1.20));
        const cantOmega = Math.ceil((anchoArea / largoPerfil) * (largoArea / 0.40));

        const pLaminasC = obtenerDatosProducto('3020001');
        const pRielC = obtenerDatosProducto('3020100');
        const pParalC = obtenerDatosProducto('3020101');
        const pOmega = obtenerDatosProducto('3020102');

        const totalCielo = (cantLaminasCielo * pLaminasC.precio) + 
                           (cantRielCielo * pRielC.precio) + 
                           (cantParalCielo * pParalC.precio) + 
                           (cantOmega * pOmega.precio);

        htmlTabla = `
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3020001</td>
                <td style="text-align: left;">${pLaminasC.descripcion}</td>
                <td><strong>${cantLaminasCielo}</strong></td>
                <td>$${pLaminasC.precio.toFixed(2)}</td>
                <td><span style="color: ${pLaminasC.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pLaminasC.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Riel</strong></td>
                <td>3020100</td>
                <td style="text-align: left;">${pRielC.descripcion}</td>
                <td><strong>${cantRielCielo}</strong></td>
                <td>$${pRielC.precio.toFixed(2)}</td>
                <td><span style="color: ${pRielC.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pRielC.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Paral</strong></td>
                <td>3020101</td>
                <td style="text-align: left;">${pParalC.descripcion}</td>
                <td><strong>${cantParalCielo}</strong></td>
                <td>$${pParalC.precio.toFixed(2)}</td> <!-- Corregido aquí -->
                <td><span style="color: ${pParalC.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pParalC.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Omega</strong></td>
                <td>3020102</td>
                <td style="text-align: left;">${pOmega.descripcion}</td>
                <td><strong>${cantOmega}</strong></td>
                <td>$${pOmega.precio.toFixed(2)}</td>
                <td><span style="color: ${pOmega.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pOmega.existencia}</span></td>
            </tr>
            <tr>
                <td colspan="5" style="text-align: right;"><strong>ESTIMADO TOTAL:</strong></td>
                <td><strong>$${totalCielo.toFixed(2)}</strong></td>
            </tr>
        `;
    }

    document.getElementById('tabla-cuerpo').innerHTML = htmlTabla;
    document.getElementById('seccion-calculo').classList.add('hidden');
    document.getElementById('seccion-resultados').classList.remove('hidden');
}
