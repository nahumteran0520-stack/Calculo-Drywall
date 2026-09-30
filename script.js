const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6bxAnT90xKGHtyk2N7TAjCPULStF16cAUZR8fUoXYzWhVTITeErATG8AHiRqPDQ/pub?gid=1537817865&single=true&output=csv';
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
            { codigo: '3020001', descripcion: 'LÁMINA DE YESO 3/8" 1,22M X 2', precio: 23.9 },
            { codigo: '3020002', descripcion: 'LÁMINA DE YESO 1/2" 1,22 X 2,4', precio: 24.9 },
            { codigo: '3015030', descripcion: 'LÁMINA DE YESO LISA 1,20X0,60', precio: 8.88 },
            { codigo: '3015037', descripcion: 'LÁMINA YESO CONCHA NARANJA 120', precio: 12.8},
            { codigo: '3020100', descripcion: 'RIEL 1 5/8" X 3.05M ACERO GALV', precio: 5.55 },
            { codigo: '3020101', descripcion: 'PARAL 1 5/8" X 3.05M ACERO GAL', precio: 7.16 },
            { codigo: '3020106', descripcion: 'RIEL 2 1/2" X 3,05M ACERO GALV', precio: 7.00 },
            { codigo: '3020108', descripcion: 'PARAL 2 1/2" X 3.05M ACERO GAL', precio: 8.23 },
            { codigo: '3015002', descripcion: 'PERFIL PRINCIPAL BLANCO 3,66', precio: 7.25 },
            { codigo: '3015004', descripcion: 'PERFIL SECUNDARIO BLANCO 1.20M', precio: 2.32 },
            { codigo: '3015008', descripcion: 'PERFIL ANGULO BLANCO 300 CM', precio: 3.59 },
            { codigo: '3020102', descripcion: 'PERFIL OMEGA 3,05M ACERO GALVA', precio: 6.44 }
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
    document.getElementById('seccion-esquema').classList.add('hidden');
    document.getElementById('seccion-menu').classList.remove('hidden');
}

function nuevoCalculo() {
    document.getElementById('seccion-resultados').classList.add('hidden');
    document.getElementById('seccion-esquema').classList.add('hidden');
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

    let nombreProyectoRegistro = '';
    if (tipoActual === 'pared') {
        nombreProyectoRegistro = 'Paredes Drywall';
    } else if (tipoActual === 'cielo_suspendido') {
        nombreProyectoRegistro = 'Cielo Raso Suspendido';
    } else {
        nombreProyectoRegistro = 'Cielo Raso Drywall';
    }
    registrarUsoEnGoogleSheets(nombreProyectoRegistro);

    const area = alto * largo;
    let htmlTabla = '';

    function obtenerDatosProducto(codigoBuscado) {
        const prod = listaProductos.find(p => p.codigo === codigoBuscado);
        return prod ? prod : { precio: 0, descripcion: "Artículo no disponible" };
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
        const totalDoble = (cantLaminasDobleCara * pLaminas.precio) + (cantRiel * pRiel.precio) + (cantParal * pParal.precio);

        htmlTabla = `
            <tr><td colspan="5" style="background-color: #e2e8f0; font-weight: bold; color: #1a4472;">CÁLCULO NORMAL (Una sola cara)</td></tr>
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3020002</td>
                <td style="text-align: left;">${pLaminas.descripcion}</td>
                <td><strong>${cantLaminasSimple}</strong></td>
                <td style="width: 120px;">$${pLaminas.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Riel</strong></td>
                <td>3020106</td>
                <td style="text-align: left;">${pRiel.descripcion}</td>
                <td><strong>${cantRiel}</strong></td>
                 <td style="width: 120px;">$${pRiel.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Paral</strong></td>
                <td>3020108</td>
                <td style="text-align: left;">${pParal.descripcion} (Sep: ${distanciaParales}m)</td>
                <td><strong>${cantParal}</strong></td>
                 <td style="width: 120px;">$${pParal.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="4" style="text-align: right;"><strong>ESTIMADO TOTAL:</strong></td>
                <td><strong>$${totalSimple.toFixed(2)}</strong></td>
            </tr>

            <tr><td colspan="5" style="background-color: #cbd5e1; font-weight: bold; color: #1a4472;">CÁLCULO POR AMBOS LADOS (Doble cara)</td></tr>
            <tr>
                <td><strong>Laminas (Doble)</strong></td>
                <td>3020002</td>
                <td style="text-align: left;">${pLaminas.descripcion}</td>
                <td><strong>${cantLaminasDobleCara}</strong></td>
               <td style="width: 120px;">$${pLaminas.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="4" style="text-align: right;"><strong>ESTIMADO TOTAL (DOBLE CARA):</strong></td>
                <td><strong>$${totalDoble.toFixed(2)}</strong></td>
            </tr>
        `;
    } else if (tipoActual === 'cielo_suspendido') {
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
            <tr><td colspan="5" style="background-color: #e2e8f0; font-weight: bold; color: #1a4472;">CÁLCULO CIELO RASO SUSPENDIDO (1.20x0.60)</td></tr>
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3015030</td>
                <td style="text-align: left;">${pLam.descripcion}</td>
                <td><strong>${cantLaminas}</strong></td>
                 <td style="width: 120px;">$${pLam.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Perfil Principal</strong></td>
                <td>3015002</td>
                <td style="text-align: left;">${pPrin.descripcion}</td>
                <td><strong>${cantPrincipal}</strong></td>
                <td style="width: 120px;">$${pPrin.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Perfil Secundario</strong></td>
                <td>3015004</td>
                <td style="text-align: left;">${pSec.descripcion}</td>
                <td><strong>${cantSecundario}</strong></td>
                <td style="width: 120px;">$${pSec.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Perfil Ángulo</strong></td>
                <td>3015008</td>
                <td style="text-align: left;">${pAng.descripcion}</td>
                <td><strong>${cantAngulo}</strong></td>
                <td style="width: 120px;">$${pAng.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="4" style="text-align: right;"><strong>ESTIMADO TOTAL:</strong></td>
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
            <tr><td colspan="5" style="background-color: #e2e8f0; font-weight: bold; color: #1a4472;">CÁLCULO CIELO RASO DRYWALL</td></tr>
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3020001</td>
                <td style="text-align: left;">${pLaminasC.descripcion}</td>
                <td><strong>${cantLaminasCielo}</strong></td>
                <td style="width: 120px;">$${pLaminasC.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Riel</strong></td>
                <td>3020100</td>
                <td style="text-align: left;">${pRielC.descripcion}</td>
                <td><strong>${cantRielCielo}</strong></td>
                 <td style="width: 120px;">$${pRielC.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Paral</strong></td>
                <td>3020101</td>
                <td style="text-align: left;">${pParalC.descripcion}</td>
                <td><strong>${cantParalCielo}</strong></td>
                 <td style="width: 120px;">$${pParalC.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Omega</strong></td>
                <td>3020102</td>
                <td style="text-align: left;">${pOmega.descripcion}</td>
                <td><strong>${cantOmega}</strong></td>
                 <td style="width: 120px;">$${pOmega.precio.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="4" style="text-align: right;"><strong>ESTIMADO TOTAL:</strong></td>
                <td><strong>$${totalCielo.toFixed(2)}</strong></td>
            </tr>
        `;
    }

    document.getElementById('tabla-cuerpo').innerHTML = htmlTabla;
    document.getElementById('seccion-calculo').classList.add('hidden');
    document.getElementById('seccion-resultados').classList.remove('hidden');
}

// Función que dibuja el esquema técnico detallado con Riel, Paral y Omega
function verEsquemaVisual() {
    const tituloEsquema = document.getElementById('titulo-esquema');
    const canvas = document.getElementById('canvas-esquema');
    const ctx = canvas.getContext('2d');
    const leyendaContainer = document.getElementById('leyenda-esquema');

    const alto = parseFloat(document.getElementById('alto').value) || 2.5;
    const largo = parseFloat(document.getElementById('largo').value) || 3.0;

    document.getElementById('seccion-resultados').classList.add('hidden');
    document.getElementById('seccion-esquema').classList.remove('hidden');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 45;
    const drawWidth = canvas.width - (padding * 2);
    const drawHeight = canvas.height - (padding * 2);

    let scale = Math.min(drawWidth / largo, drawHeight / alto);
    const rectWidth = largo * scale;
    const rectHeight = alto * scale;
    const startX = (canvas.width - rectWidth) / 2;
    const startY = (canvas.height - rectHeight) / 2;

    // Fondo del área
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX, startY, rectWidth, rectHeight);

    if (tipoActual === 'cielo') {
        tituloEsquema.innerText = 'Esquema: Cielo Raso Drywall';

        // 1. OMEGAS a lo ancho (distancia 0.40m)
        ctx.strokeStyle = '#2563eb'; // Azul claro/medio para Omega
        ctx.lineWidth = 2;
        let pasoOmega = 0.40 * scale;
        for (let y = startY + pasoOmega; y < startY + rectHeight - 2; y += pasoOmega) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(startX + rectWidth, y);
            ctx.stroke();
        }

        // 2. PARALES a lo largo (distancia 1.20m)
        ctx.strokeStyle = '#d97706'; // Naranja para Paral
        ctx.lineWidth = 3;
        let pasoParal = 1.20 * scale;
        for (let x = startX + pasoParal; x < startX + rectWidth - 2; x += pasoParal) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, startY + rectHeight);
            ctx.stroke();
        }

        // 3. RIEL (Marco perimetral)
        ctx.strokeStyle = '#001a40'; // Azul oscuro institucional para el Riel
        ctx.lineWidth = 5;
        ctx.strokeRect(startX, startY, rectWidth, rectHeight);

        // Leyenda para Cielo Drywall
        leyendaContainer.innerHTML = `
            <div class="leyenda-item"><span class="punto-color" style="background:#001a40;"></span> Riel (Marco)</div>
            <div class="leyenda-item"><span class="punto-color" style="background:#d97706;"></span> Paral (Cada 1.20m)</div>
            <div class="leyenda-item"><span class="punto-color" style="background:#2563eb;"></span> Omega (Cada 0.40m)</div>
        `;

    } else if (tipoActual === 'pared') {
        tituloEsquema.innerText = 'Esquema: Pared con Drywall';

        // Parales verticales (cada 0.61m)
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        let pasoParalPared = 0.61 * scale;
        for (let x = startX + pasoParalPared; x < startX + rectWidth - 2; x += pasoParalPared) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, startY + rectHeight);
            ctx.stroke();
        }

        // Riel superior e inferior
        ctx.strokeStyle = '#001a40';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + rectWidth, startY);
        ctx.moveTo(startX, startY + rectHeight);
        ctx.lineTo(startX + rectWidth, startY + rectHeight);
        ctx.stroke();
        
        ctx.strokeRect(startX, startY, rectWidth, rectHeight);

        leyendaContainer.innerHTML = `
            <div class="leyenda-item"><span class="punto-color" style="background:#001a40;"></span> Riel Superior e Inferior</div>
            <div class="leyenda-item"><span class="punto-color" style="background:#d97706;"></span> Paral Vertical</div>
        `;

    } else {
        tituloEsquema.innerText = 'Esquema: Cielo Raso Suspendido';

        // Cuadrícula cuadriculada típica (1.20 x 0.60)
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        let pX = 1.2 * scale;
        let pY = 0.6 * scale;

        for (let x = startX; x <= startX + rectWidth; x += pX) {
            ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, startY + rectHeight); ctx.stroke();
        }
        for (let y = startY; y <= startY + rectHeight; y += pY) {
            ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(startX + rectWidth, y); ctx.stroke();
        }

        ctx.strokeStyle = '#001a40';
        ctx.lineWidth = 3;
        ctx.strokeRect(startX, startY, rectWidth, rectHeight);

        leyendaContainer.innerHTML = `
            <div class="leyenda-item"><span class="punto-color" style="background:#001a40;"></span> Perfil Ángulo (Borde)</div>
            <div class="leyenda-item"><span class="punto-color" style="background:#64748b;"></span> Cuadrícula Principal/Secundaria</div>
        `;
    }

    // Acotaciones de medidas exteriores
    ctx.fillStyle = '#001a40';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Largo: ${largo} m`, startX + (rectWidth / 2), startY + rectHeight + 18);

    ctx.save();
    ctx.translate(startX - 22, startY + (rectHeight / 2));
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`Ancho/Alto: ${alto} m`, 0, 0);
    ctx.restore();
}

function volverResultados() {
    document.getElementById('seccion-esquema').classList.add('hidden');
    document.getElementById('seccion-resultados').classList.remove('hidden');
}

function registrarUsoEnGoogleSheets(proyecto) {
    const urlScriptApp = "https://script.google.com/macros/s/AKfycbye2stKEpDnShv-dVjcJ6sBSf8qN7x4xqTgsm8PY_0lq9zbEv0KP_-445wbJpP5tXly/exec";
    
    const iframeId = 'hidden-sheet-iframe';
    let iframe = document.getElementById(iframeId);
    
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    
    iframe.src = `${urlScriptApp}?proyecto=${encodeURIComponent(proyecto)}&nocache=${new Date().getTime()}`;
}
