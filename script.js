// Usamos una URL de descarga directa de CSV de Google Sheets con marca de tiempo
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
        console.log("Precios cargados desde Google Sheets:", listaProductos);
    } catch (error) {
        console.warn("Usando respaldo actualizado:", error);
        // Respaldo manual con tus precios reales actuales (incluyendo los de cielo suspendido)
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
    
    if (tipo === 'pared') {
        document.getElementById('titulo-modulo').innerText = 'Paredes con Drywall';
    } else if (tipo === 'cielo_suspendido') {
        document.getElementById('titulo-modulo').innerText = 'Cielo Raso Suspendido (1.20x0.60)';
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
    } else if (tipoActual === 'cielo_suspendido') {
        // Fórmulas exactas solicitadas con redondeo hacia arriba
        const cantLaminas = Math.ceil(area / 0.72);
        const cantAngulo = Math.ceil(((alto + largo) * 2) / 3.00);
        const cantPrincipal = Math.ceil(area * 0.23);
        const cantSecundario = Math.ceil(area * 1.37);

        const pLam = obtenerDatosProducto('3015030');
        const pPrin = obtenerDatosProducto('3015002');
        const pSec = obtenerDatosProducto('3015004');
        const pAng = obtenerDatosProducto('3015008');

        const total = (cantLaminas * pLam.precio) + (cantPrincipal * pPrin.precio) + 
                      (cantSecundario * pSec.precio) + (cantAngulo * pAng.precio);

        htmlTabla = `
            <tr><td colspan="6" style="background-color: #e2e8f0; font-weight: bold; color: #1a4472;">CÁLCULO CIELO RASO SUSPENDIDO (1.20x0.60)</td></tr>
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3015030</td>
                <td style="text-align: left;">${pLam.descripcion}</td>
                <td><strong>${cantLaminas}</strong></td>
                <td>$${pLam.precio.toFixed(2)}</td>
                <td><span style="color: ${pLam.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pLam.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Perfil Principal</strong></td>
                <td>3015002</td>
                <td style="text-align: left;">${pPrin.descripcion}</td>
                <td><strong>${cantPrincipal}</strong></td>
                <td>$${pPrin.precio.toFixed(2)}</td>
                <td><span style="color: ${pPrin.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pPrin.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Perfil Secundario</strong></td>
                <td>3015004</td>
                <td style="text-align: left;">${pSec.descripcion}</td>
                <td><strong>${cantSecundario}</strong></td>
                <td>$${pSec.precio.toFixed(2)}</td>
                <td><span style="color: ${pSec.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pSec.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Perfil Ángulo</strong></td>
                <td>3015008</td>
                <td style="text-align: left;">${pAng.descripcion}</td>
                <td><strong>${cantAngulo}</strong></td>
                <td>$${pAng.precio.toFixed(2)}</td>
                <td><span style="color: ${pAng.existencia > 0 ? 'green' : 'red'}; font-weight: bold;">${pAng.existencia}</span></td>
            </tr>
            <tr>
                <td colspan="5" style="text-align: right;"><strong>ESTIMADO TOTAL:</strong></td>
                <td><strong>$${total.toFixed(2)}</strong></td>
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
            <tr><td colspan="6" style="background-color: #e2e8f0; font-weight: bold; color: #1a4472;">CÁLCULO CIELO RASO DRYWALL</td></tr>
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
                <td>$${pParalC.precio.toFixed(2)}</td>
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
