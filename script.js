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
    
    // Limpiar campos
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
        // Resultados para Paredes (según tu imagen anterior)
        const cantLaminas = Math.ceil((area * 2) / 2.88); 
        const cantRiel = Math.ceil((largo * 2) / 3.05);  
        const cantParal = Math.ceil((largo / 0.60) + 1); 

        htmlTabla = `
            <tr>
                <td><strong>Laminas</strong></td>
                <td>3020002</td>
                <td style="text-align: left;">LÁMINA DE YESO 1/2" 1,22 X 2,4</td>
                <td><strong>${cantLaminas}</strong></td>
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
                <td style="text-align: left;">PARAL 2 1/2" X 3.05M ACERO GAL</td>
                <td><strong>${cantParal}</strong></td>
            </tr>
        `;
    } else {
        // Resultados para Cielo Raso (con Láminas de 3/8", Rieles, Parales y Omegas según tu nueva imagen)
        const cantLaminasCielo = Math.ceil(area / 2.88);
        const cantRielCielo = Math.ceil((largo * 2) / 3.05);
        const cantParalCielo = Math.ceil((largo / 0.60) + 1);
        const cantOmega = Math.ceil((area / 0.5) / 3.05); // Cálculo estimado basado en separación de omegas

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
