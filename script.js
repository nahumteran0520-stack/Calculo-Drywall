document.getElementById('btnCalcular').addEventListener('click', function() {
    const tipo = document.getElementById('tipoProyecto').value;
    const largo = parseFloat(document.getElementById('largo').value);
    const alto = parseFloat(document.getElementById('alto').value);
    const contenedorResultados = document.getElementById('listaResultados');

    // Validaciones básicas
    if (!largo || !alto || largo <= 0 || alto <= 0) {
        alert('Por favor, ingresa valores válidos mayores a cero.');
        return;
    }

    const areaTotal = largo * alto;
    let htmlResultados = `<p><strong>Área total:</strong> ${areaTotal.toFixed(2)} m²</p><br>`;

    if (tipo === 'pared') {
        // Fórmulas estimadas estándar para tabique / pared de drywall (considerando ambas caras)
        const factorPlacas = (areaTotal * 2) / 2.88; // Placa estándar de 1.22 x 2.44m = 2.97m² (aprox 2.88 útiles) con 10% desperdicio
        const parales = Math.ceil((largo / 0.60) + 1); // cada 60 cm + inicial
        const rieles = Math.ceil((largo * 2) / 3); // Soleras superior e inferior (tiras de 3m)
        const tornillosT2 = Math.ceil(areaTotal * 20); // Aprox 20 por m²
        const tornillosFijacion = Math.ceil(areaTotal * 8);
        const masillaKg = (areaTotal * 0.8).toFixed(1);
        const cintaMetros = Math.ceil(areaTotal * 1.5);

        htmlResultados += `
            <div class="material-item"><span class="material-name">Placas de Yeso (1/2"):</span><span class="material-qty">${Math.ceil(factorPlacas)} unids.</span></div>
            <div class="material-item"><span class="material-name">Parales (Montantes):</span><span class="material-qty">${parales} unids.</span></div>
            <div class="material-item"><span class="material-name">Rieles (Soleras):</span><span class="material-qty">${rieles} unids.</span></div>
            <div class="material-item"><span class="material-name">Tornillos T2 (Fijación placa):</span><span class="material-qty">${tornillosT2} unids.</span></div>
            <div class="material-item"><span class="material-name">Tornillos T1 (Estructura):</span><span class="material-qty">${tornillosFijacion} unids.</span></div>
            <div class="material-item"><span class="material-name">Masilla para juntas:</span><span class="material-qty">${masillaKg} kg</span></div>
            <div class="material-item"><span class="material-name">Cinta de papel:</span><span class="material-qty">${cintaMetros} mts</span></div>
        `;

    } else {
        // Fórmulas para Cielo Raso (Suspendido / Junta Invisible)
        const factorPlacasCielo = areaTotal / 2.88;
        const solerasCielo = Math.ceil((largo * alto) / 3); // Perfilería principal/perimetral aproximada
        const fijacionesCielo = Math.ceil(areaTotal * 12);
        const tornillosCielo = Math.ceil(areaTotal * 15);
        const masillaCielo = (areaTotal * 0.5).toFixed(1);
        const cintaCielo = Math.ceil(areaTotal * 1.2);

        htmlResultados += `
            <div class="material-item"><span class="material-name">Placas de Yeso (Cielo Raso):</span><span class="material-qty">${Math.ceil(factorPlacasCielo)} unids.</span></div>
            <div class="material-item"><span class="material-name">Perfiles / Soleras perimetrales:</span><span class="material-qty">${solerasCielo} unids.</span></div>
            <div class="material-item"><span class="material-name">Tornillos T2:</span><span class="material-qty">${tornillosCielo} unids.</span></div>
            <div class="material-item"><span class="material-name">Tarugos y Tornillos fijación:</span><span class="material-qty">${fijacionesCielo} unids.</span></div>
            <div class="material-item"><span class="material-name">Masilla:</span><span class="material-qty">${masillaCielo} kg</span></div>
            <div class="material-item"><span class="material-name">Cinta de papel:</span><span class="material-qty">${cintaCielo} mts</span></div>
        `;
    }

    contenedorResultados.innerHTML = htmlResultados;
});
