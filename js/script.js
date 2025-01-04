// Função para calcular a porcentagem diária necessária e o stop loss diário
function calcularMetas(bancaInicial, metaTotal, diasRestantes) {
    if (diasRestantes <= 0 || bancaInicial <= 0 || metaTotal <= 0) {
        return { porcentagemDiaria: 0, stopLoss: 0 };
    }

    // Cálculo da porcentagem diária necessária
    const porcentagemDiaria = ((metaTotal / bancaInicial) ** (1 / diasRestantes) - 1) * 100;

    // Cálculo do stop loss diário (20% do valor da banca)
    const stopLoss = bancaInicial * 0.2;

    return { porcentagemDiaria, stopLoss };
}

// Função para gerar a tabela de progresso
function gerarTabela(bancaInicial, metaTotal, diasRestantes) {
    const tabelaBody = document.querySelector('#tabelaProgresso tbody');
    tabelaBody.innerHTML = ''; // Limpar a tabela antes de preencher

    let bancaAtual = bancaInicial;
    const { porcentagemDiaria, stopLoss } = calcularMetas(bancaInicial, metaTotal, diasRestantes);

    // Verificar se a porcentagem diária é válida
    if (isNaN(porcentagemDiaria) || isNaN(stopLoss) || porcentagemDiaria <= 0 || stopLoss <= 0) {
        document.getElementById('mensagem').textContent = "Houve um erro nos cálculos. Verifique os dados informados.";
        return;
    }

    // Exibir as informações de progresso (sem duplicação)
    let resultado = ` 
        <p><span>Porcentagem Diária Necessária:</span> ${porcentagemDiaria.toFixed(2)}%</p>
        <p><span>Stop Loss Diário:</span> R$ ${stopLoss.toFixed(2)}</p>
    `;

    // Adicionar o cabeçalho da tabela apenas uma vez
    resultado += ` 
        <table id="resultTable">
            <tr><th>Dia</th><th>Saldo (R$)</th><th>Necessário (R$)</th></tr>
    `;

    // Calcular os valores para a tabela
    let saldo = bancaInicial;
    let tableData = []; // Array para armazenar os dados da tabela

    // Calcular e adicionar as linhas da tabela
    for (let i = 1; i <= diasRestantes; i++) {
        const necessario = saldo * (porcentagemDiaria / 100);
        saldo += necessario;
    
        // Verificar se o saldo atingiu ou ultrapassou a meta
        if (saldo >= metaTotal) {
            // Adicionar a linha final com o saldo exato e parar o loop
            resultado += `<tr><td>Dia ${i}</td><td>R$ ${metaTotal.toFixed(2)}</td><td>R$ ${(metaTotal - (saldo - necessario)).toFixed(2)}</td></tr>`;
            tableData.push([`Dia ${i}`, metaTotal.toFixed(2), (metaTotal - (saldo - necessario)).toFixed(2)]);
            break;
        }
    
        // Adicionar as linhas da tabela
        resultado += `<tr><td>Dia ${i}</td><td>R$ ${saldo.toFixed(2)}</td><td>R$ ${necessario.toFixed(2)}</td></tr>`;
        tableData.push([`Dia ${i}`, saldo.toFixed(2), necessario.toFixed(2)]);
    }
    

    // Fechar a tabela
    resultado += `</table>`;

    // Exibir as informações de progresso
    document.getElementById('resultados').innerHTML = resultado;

    // Exportar os dados da tabela para Excel
    document.getElementById('btnExportar').addEventListener('click', function () {
        if (tableData.length === 0) {
            alert('Nenhum dado disponível para exportar!');
            return;
        }
        const ws = XLSX.utils.aoa_to_sheet([['Dia', 'Saldo (R$)', 'Necessário (R$)'], ...tableData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Agenda de Metas');
        XLSX.writeFile(wb, 'agenda_de_metas.xlsx');
    });

    // Exibir a tabela de progresso
    document.getElementById('informacoes-tabela').style.display = 'block';
}

// Função para gerar o gráfico de evolução com crescimento exponencial
function gerarGrafico(bancaInicial, metaTotal, diasRestantes) {
    const valores = [];
    let bancaAtual = bancaInicial;
    const porcentagemDiaria = ((metaTotal / bancaInicial) ** (1 / diasRestantes) - 1) * 100;

    // Se já houver um gráfico existente, destrua-o
    if (window.chartInstance) {
        window.chartInstance.destroy();
    }

    for (let i = 0; i <= diasRestantes; i++) {
        // Calcular o valor para o dia i com base no crescimento exponencial
        bancaAtual += bancaAtual * (porcentagemDiaria / 100);
        valores.push(bancaAtual.toFixed(2));
    }

    const dadosGrafico = {
        labels: Array.from({ length: diasRestantes + 1 }, (_, i) => i + 1),
        datasets: [{
            label: 'Progresso da Banca',
            data: valores,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            fill: true,
            tension: 0.4
        }]
    };

    const ctx = document.getElementById('graficoEvolucao').getContext('2d');
    // Criar um novo gráfico
    window.chartInstance = new Chart(ctx, {
        type: 'line',
        data: dadosGrafico,
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Dia'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Banca (R$)'
                    }
                }
            }
        }
    });

    // Exibir o gráfico
    document.getElementById('grafico-container').style.display = 'block';
}

// Adicionando eventos ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    const gerarAgendaBtn = document.getElementById('gerarAgenda');
    const btnExportar = document.getElementById('btnExportar');

    gerarAgendaBtn.addEventListener('click', function () {
        const banca = parseFloat(document.getElementById('banca').value);
        const meta = parseFloat(document.getElementById('meta').value);
        const dias = parseInt(document.getElementById('dias').value);

        if (isNaN(banca) || isNaN(meta) || isNaN(dias) || banca <= 0 || meta <= 0 || dias <= 0) {
            document.getElementById('mensagem').textContent = 'Por favor, preencha todos os campos corretamente!';
            return;
        }

        document.getElementById('mensagem').textContent = ''; // Limpar a mensagem de erro

        // Gerar a tabela e o gráfico
        gerarTabela(banca, meta, dias);
        gerarGrafico(banca, meta, dias);
    });
});
