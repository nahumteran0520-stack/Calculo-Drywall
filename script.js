} else if (tipoActual === 'pared') {
        tituloEsquema.innerText = 'Esquema: Pared con Drywall';

        // Determinamos la separación de parales exactamente igual que en el cálculo de resultados
        let distanciaParalesPared = alto > 3 ? 0.41 : 0.61;
        let pasoParalPared = distanciaParalesPared * scale;

        // Parales verticales (incluyendo extremos y distribución correcta)
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;

        // Dibujamos desde el inicio (extremo izquierdo) hasta el final (extremo derecho)
        for (let x = startX; x <= startX + rectWidth + 1; x += pasoParalPared) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, startY + rectHeight);
            ctx.stroke();
        }

        // Asegurarnos de pintar explícitamente el último paral del extremo derecho si el bucle por redondeo milimétrico queda al límite
        let xFinal = startX + rectWidth;
        ctx.beginPath();
        ctx.moveTo(xFinal, startY);
        ctx.lineTo(xFinal, startY + rectHeight);
        ctx.stroke();

        // Rieles arriba y abajo únicamente (a lo largo)
        ctx.strokeStyle = '#001a40';
        ctx.lineWidth = 6;
        ctx.beginPath();
        // Riel Superior
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + rectWidth, startY);
        // Riel Inferior
        ctx.moveTo(startX, startY + rectHeight);
        ctx.lineTo(startX + rectWidth, startY + rectHeight);
        ctx.stroke();
        
        // Cierre lateral sutil del marco de referencia
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(startX, startY); ctx.lineTo(startX, startY + rectHeight);
        ctx.moveTo(startX + rectWidth, startY); ctx.lineTo(startX + rectWidth, startY + rectHeight);
        ctx.stroke();

        leyendaContainer.innerHTML = `
            <div class="leyenda-item"><span class="punto-color" style="background:#001a40;"></span> Riel Superior e Inferior (Marco)</div>
            <div class="leyenda-item"><span class="punto-color" style="background:#d97706;"></span> Paral Vertical (Cada ${distanciaParalesPared}m / Incluye extremos)</div>
        `;
