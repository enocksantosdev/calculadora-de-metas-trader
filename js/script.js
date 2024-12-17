document.getElementById('gerarAgenda').addEventListener('click', function () {
    const banca = parseFloat(document.getElementById('banca').value);
    const meta = parseFloat(document.getElementById('meta').value);
    const dias = parseInt(document.getElementById('dias').value);
    const mensagem = document.getElementById('mensagem');
    const resultados = document.getElementById('resultados');

    if (isNaN(banca) || isNaN(meta) || isNaN(dias) || banca <= 0 || meta <= 0 || dias <= 0) {
        mensagem.textContent = "Por favor, insira valores válidos!";
        return;
    }

    mensagem.textContent = "";
    resultados.innerHTML = "";

    const porcentagemDiaria = ((meta / banca) ** (1 / dias) - 1) * 100;
    const stopLoss = banca * 0.2;

    let resultado = `<p><span>Porcentagem Diária Necessária:</span> ${porcentagemDiaria.toFixed(2)}%</p>`;
    resultado += `<p><span>Stop Loss Diário:</span> R$ ${stopLoss.toFixed(2)}</p>`;
    resultado += `<table id="resultTable"><tr><th>Dia</th><th>Saldo (R$)</th><th>Necessário (R$)</th></tr>`;

    let saldo = banca;
    let tableData = []; // Array to store table data

    for (let i = 1; i <= dias; i++) {
        const necessario = saldo * (porcentagemDiaria / 100);
        saldo += necessario;
        resultado += `<tr><td><span>Dia ${i}</span></td><td>R$ ${saldo.toFixed(2)}</td><td>R$ ${necessario.toFixed(2)}</td></tr>`;
        // Add row data to tableData array
        tableData.push([`Dia ${i}`, saldo.toFixed(2), necessario.toFixed(2)]);
    }
    resultado += `</table>`;

    resultados.innerHTML = resultado;

    // Function to export table data to Excel
    document.getElementById('btnExportar').addEventListener('click', function () {
        const ws = XLSX.utils.aoa_to_sheet([
            ['Dia', 'Saldo (R$)', 'Necessário (R$)'], // Headers
            ...tableData // Data rows
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Agenda de Metas');
        XLSX.writeFile(wb, 'agenda_de_metas.xlsx');
    });
});
