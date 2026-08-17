let tipoActual = '';

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
        alert('Por favor, ingresa valores válidos para el alto y el largo.');
        return;
    }

    const area = alto * largo;
    let htmlTabla = '';

    if (tipoActual === 'pared') {
        // Fórmulas exactas indicadas para Paredes
        const rendimientoLamina = 2.976; 
        const largoParal = 3.0;
        const largoRiel = 3.0;

        // Distancia entre parales según altura (> 3m usa 0.41m, sino 0.61m)
        const distanciaParales = alto > 3 ? 0.41 : 0.61;

        // Cálculo base de parales por tu fórmula: (Largo / distancia) * (Alto / largoParal) + 2 de punta
        const paralesBase = (largo / distanciaParales) * (alto / largoParal);
        const cantParal = Math.ceil(paralesBase + 2);

        // Rieles: (Largo * 2) / largo del riel
        const cantRiel = Math.ceil((largo * 2) / largoRiel);

        // Láminas base (una sola cara)
        const laminasBase = Math.ceil(area / rendimientoLamina);
        const cantLaminasSimple = laminasBase;
        const cantLaminasDobleCara = laminasBase * 2;

        htmlTabla = `
            <tr><td colspan="4" style="background-color: #e2e8f0; font-weight: bold; color: #1a4472;">CÁLCULO NORMAL (Una sola cara)</td></tr>
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3020002</td>
                <td style="text-align: left;">LÁMINA DE YESO 1/2" 1,22 X 2,4</td>
                <td><strong>${cantLaminasSimple}</strong></td>
            </tr>
            <tr>
                <td><strong>Riel</strong></td>
                <td>3020106</td>
                <td style="text-align: left;">RIEL 2 1/2" X 3,05M ACERO GALV</td>
                <td><strong>${cantRiel}</strong></td>
            </tr>
            <tr>
                <td><strong>Paral</strong></td>
                <td>3020108</td>
                <td style="text-align: left;">PARAL 2 1/2" X 3.05M ACERO GAL (Separación: ${distanciaParales}m)</td>
                <td><strong>${cantParal}</strong></td>
            </tr>

            <tr><td colspan="4" style="background-color: #cbd5e1; font-weight: bold; color: #1a4472;">CÁLCULO POR AMBOS LADOS (Doble cara)</td></tr>
            <tr>
                <td><strong>Laminas (Doble Cara)</strong></td>
                <td>3020002</td>
                <td style="text-align: left;">LÁMINA DE YESO 1/2" 1,22 X 2,4</td>
                <td><strong>${cantLaminasDobleCara}</strong></td>
            </tr>
            <tr>
                <td><strong>Riel / Paral</strong></td>
                <td>-</td>
                <td style="text-align: left;">Estructura metálica (Mismas cantidades de perfilería)</td>
                <td><strong>Igual</strong></td>
            </tr>
        `;
    } else {
        // Cálculo por defecto para Cielo Raso (con omegas)
        const areaCubrir = area;
        const cantLaminasCielo = Math.ceil(areaCubrir / 2.976);
        const cantRielCielo = Math.ceil((largo * 2) / 3.05);
        const cantParalCielo = Math.ceil((largo / 0.61) + 1);
        const cantOmega = Math.ceil((areaCubrir / 0.5) / 3.05);

        htmlTabla = `
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3020001</td>
                <td style="text-align: left;">LÁMINA DE YESO 3/8" 1,22M X 2</td>
                <td><strong>${cantLaminasCielo}</strong></td>
            </tr>
            <tr>
                <td><strong>Riel</strong></td>
                <td>3020100</td>
                <td style="text-align: left;">RIEL 1 5/8" X 3.05M ACERO GALV</td>
                <td><strong>${cantRielCielo}</strong></td>
            </tr>
            <tr>
                <td><strong>Paral</strong></td>
                <td>3020101</td>
                <td style="text-align: left;">PARAL 1 5/8" X 3.05M ACERO GAL</td>
                <td><strong>${cantParalCielo}</strong></td>
            </tr>
            <tr>
                <td><strong>Omega</strong></td>
                <td>3020102</td>
                <td style="text-align: left;">PERFIL OMEGA 3,05M ACERO GALVA</td>
                <td><strong>${cantOmega}</strong></td>
            </tr>
        `;
    }

    document.getElementById('tabla-cuerpo').innerHTML = htmlTabla;
    document.getElementById('seccion-calculo').classList.add('hidden');
    document.getElementById('seccion-resultados').classList.remove('hidden');
}
