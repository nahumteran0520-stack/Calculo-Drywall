function generarResultados() {
    const alto = parseFloat(document.getElementById('alto').value);
    const largo = parseFloat(document.getElementById('largo').value);

    if (!alto || !largo || alto <= 0 || largo <= 0) {
        alert('Por favor, ingresa valores válidos para el alto/ancho y el largo.');
        return;
    }

    const area = alto * largo;
    let htmlTabla = '';

    // Función auxiliar para buscar en los datos de Google Sheets
    function obtenerDatosProducto(codigoBuscado) {
        const prod = listaProductos.find(p => p.codigo == codigoBuscado);
        return prod ? prod : { precio: 0, existencia: 0, descripcion: "No encontrado" };
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

        // Consultamos precios y existencias por código desde Google Sheets
        const pLaminas = obtenerDatosProducto('3020002');
        const pRiel = obtenerDatosProducto('3020106');
        const pParal = obtenerDatosProducto('3020108');

        const subtotalLaminas = cantLaminasSimple * pLaminas.precio;
        const subtotalRiel = cantRiel * pRiel.precio;
        const subtotalParal = cantParal * pParal.precio;
        const totalSimple = subtotalLaminas + subtotalRiel + subtotalParal;

        htmlTabla = `
            <tr><td colspan="6" style="background-color: #e2e8f0; font-weight: bold; color: #1a4472;">CÁLCULO NORMAL (Una sola cara)</td></tr>
            <tr style="background-color: #f8fafc; font-weight: bold; font-size: 0.85rem; color: #64748b;">
                <td>Ítem</td><td>Código</td><td>Descripción</td><td>Cant.</td><td>Precio U.</td><td>Existencia</td>
            </tr>
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3020002</td>
                <td style="text-align: left;">${pLaminas.descripcion}</td>
                <td><strong>${cantLaminasSimple}</strong></td>
                <td>$${pLaminas.precio.toFixed(2)}</td>
                <td><span style="color: ${pLaminas.existencia > 0 ? 'green' : 'red'};">${pLaminas.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Riel</strong></td>
                <td>3020106</td>
                <td style="text-align: left;">${pRiel.descripcion}</td>
                <td><strong>${cantRiel}</strong></td>
                <td>$${pRiel.precio.toFixed(2)}</td>
                <td><span style="color: ${pRiel.existencia > 0 ? 'green' : 'red'};">${pRiel.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Paral</strong></td>
                <td>3020108</td>
                <td style="text-align: left;">${pParal.descripcion} (Sep: ${distanciaParales}m)</td>
                <td><strong>${cantParal}</strong></td>
                <td>$${pParal.precio.toFixed(2)}</td>
                <td><span style="color: ${pParal.existencia > 0 ? 'green' : 'red'};">${pParal.existencia}</span></td>
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
                <td><span style="color: ${pLaminas.existencia > 0 ? 'green' : 'red'};">${pLaminas.existencia}</span></td>
            </tr>
        `;
    } else {
        // Fórmulas para Cielo Raso
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
            <tr style="background-color: #f8fafc; font-weight: bold; font-size: 0.85rem; color: #64748b;">
                <td>Ítem</td><td>Código</td><td>Descripción</td><td>Cant.</td><td>Precio U.</td><td>Existencia</td>
            </tr>
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3020001</td>
                <td style="text-align: left;">${pLaminasC.descripcion}</td>
                <td><strong>${cantLaminasCielo}</strong></td>
                <td>$${pLaminasC.precio.toFixed(2)}</td>
                <td><span style="color: ${pLaminasC.existencia > 0 ? 'green' : 'red'};">${pLaminasC.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Riel</strong></td>
                <td>3020100</td>
                <td style="text-align: left;">${pRielC.descripcion}</td>
                <td><strong>${cantRielCielo}</strong></td>
                <td>$${pRielC.precio.toFixed(2)}</td>
                <td><span style="color: ${pRielC.existencia > 0 ? 'green' : 'red'};">${pRielC.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Paral</strong></td>
                <td>3020101</td>
                <td style="text-align: left;">${pParalC.descripcion}</td>
                <td><strong>${cantParalCielo}</strong></td>
                <td>$${pParalC.precio.toFixed(2)}</td>
                <td><span style="color: ${pParalC.existencia > 0 ? 'green' : 'red'};">${pParalC.existencia}</span></td>
            </tr>
            <tr>
                <td><strong>Omega</strong></td>
                <td>3020102</td>
                <td style="text-align: left;">${pOmega.descripcion}</td>
                <td><strong>${cantOmega}</strong></td>
                <td>$${pOmega.precio.toFixed(2)}</td>
                <td><span style="color: ${pOmega.existencia > 0 ? 'green' : 'red'};">${pOmega.existencia}</span></td>
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
