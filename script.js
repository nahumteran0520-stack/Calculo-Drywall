// Usamos una URL de descarga directa de CSV de Google Sheets
const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6bxAnT90xKGHtyk2N7TAjCPULStF16cAUZR8fUoXYzWhVTITeErATG8AHiRqPDQ/pub?output=csv&gid=1537817865&t=' + new Date().getTime();

let listaProductos = [];
let tipoActual = '';

async function obtenerPrecios() {
    try {
        const response = await fetch(urlCSV);
        if (!response.ok) throw new Error('Error al conectar');
        const data = await response.text();
        
        // Procesamos el CSV: saltamos la cabecera y convertimos filas en objetos
        const lineas = data.split('\n');
        listaProductos = lineas.slice(1).map(linea => {
            const columnas = linea.split(',').map(c => c.trim().replace(/"/g, ''));
            // Ajustamos según la estructura que vi en tu hoja: Col E(0), F(1), G(2), H(3)
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
        // Respaldo manual con tus precios actuales reales para que la calculadora no falle
        listaProductos = [
            { codigo: '3020001', descripcion: 'LÁMINA DE YESO 3/8" 1,22M X 2', precio: 25.30, existencia: 83 },
            { codigo: '3020002', descripcion: 'LÁMINA DE YESO 1/2" 1,22 X 2,4', precio: 26.25, existencia: 63 },
            { codigo: '3020100', descripcion: 'RIEL 1 5/8" X 3.05M ACERO GALV', precio: 5.55, existencia: 82 },
            { codigo: '3020101', descripcion: 'PARAL 1 5/8" X 3.05M ACERO GAL', precio: 7.16, existencia: 42 },
            { codigo: '3020102', descripcion: 'PERFIL OMEGA 3,05M ACERO GALVA', precio: 6.44, existencia: 16 },
            { codigo: '3020106', descripcion: 'RIEL 2 1/2" X 3,05M ACERO GALV', precio: 7.00, existencia: 44 },
            { codigo: '3020108', descripcion: 'PARAL 2 1/2" X 3.05M ACERO GAL', precio: 8.23, existencia: 98 }
        ];
    }
}

document.addEventListener('DOMContentLoaded', obtenerPrecios);

// ... (Tus funciones de seleccionarModulo, volverMenu, etc., permanecen iguales)
function seleccionarModulo(tipo) {
    tipoActual = tipo;
    document.getElementById('seccion-menu').classList.add('hidden');
    document.getElementById('seccion-calculo').classList.remove('hidden');
    document.getElementById('titulo-modulo').innerText = tipo === 'pared' ? 'Paredes con Drywall' : 'Cielo Raso Drywall';
}

function volverMenu() {
    document.getElementById('seccion-calculo').classList.add('hidden');
    document.getElementById('seccion-resultados').classList.add('hidden');
    document.getElementById('seccion-menu').classList.remove('hidden');
}

function obtenerDatosProducto(codigoBuscado) {
    const prod = listaProductos.find(p => p.codigo == codigoBuscado);
    return prod ? prod : { precio: 0, existencia: 0, descripcion: "Artículo no disponible" };
}

function generarResultados() {
    const alto = parseFloat(document.getElementById('alto').value);
    const largo = parseFloat(document.getElementById('largo').value);
    if (!alto || !largo) return alert('Ingresa valores válidos');

    const area = alto * largo;
    let htmlTabla = '';

    if (tipoActual === 'pared') {
        const cantLaminas = Math.ceil(area / 2.976);
        const pLaminas = obtenerDatosProducto('3020002');
        const pRiel = obtenerDatosProducto('3020106');
        const pParal = obtenerDatosProducto('3020108');
        
        htmlTabla = `<tr><td>Laminas</td><td>${pLaminas.descripcion}</td><td>${cantLaminas}</td><td>$${pLaminas.precio.toFixed(2)}</td><td>${pLaminas.existencia}</td></tr>`;
        // ... (resto de tu lógica de tabla)
    } else {
        const pLaminasC = obtenerDatosProducto('3020001');
        const pRielC = obtenerDatosProducto('3020100');
        const pParalC = obtenerDatosProducto('3020101');
        const pOmega = obtenerDatosProducto('3020102');
        // ... (resto de tu lógica)
    }
    document.getElementById('tabla-cuerpo').innerHTML = htmlTabla;
    document.getElementById('seccion-resultados').classList.remove('hidden');
    document.getElementById('seccion-calculo').classList.add('hidden');
}
