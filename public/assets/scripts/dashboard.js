// URL da API
const apiUrl = 'http://localhost:3000/modelos';

// Roda o script quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  carregarDadosParaGraficos();
});

// 1. Busca os dados da API
async function carregarDadosParaGraficos() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Falha ao buscar dados da API');
    const modelos = await response.json();

    console.log('Dados para gráficos:', modelos);

    // 2. Processa os dados e cria os gráficos
    processarGraficoMarcas(modelos);
    processarGraficoCategorias(modelos);
  } catch (error) {
    console.error('Erro ao carregar dados dos gráficos:', error);
    document.getElementById('graficoMarcas').innerHTML =
      'Erro ao carregar gráfico.';
    document.getElementById('graficoCategorias').innerHTML =
      'Erro ao carregar gráfico.';
  }
}

/**
 * Processa os dados e cria o gráfico de Marcas (Pizza)
 */
function processarGraficoMarcas(modelos) {
  const contagemMarcas = {};

  // Conta quantos modelos existem para cada marca
  modelos.forEach((modelo) => {
    const marca = modelo.marca || 'Sem Marca';
    contagemMarcas[marca] = (contagemMarcas[marca] || 0) + 1;
  });

  const labels = Object.keys(contagemMarcas);
  const data = Object.values(contagemMarcas);

  // 3. Renderiza o Gráfico de Pizza
  const ctx = document.getElementById('graficoMarcas').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Modelos por Marca',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false, // O título já está no H2
          text: 'Modelos por Marca',
        },
      },
    },
  });
}

/**
 * Processa os dados e cria o gráfico de Categorias (Barras)
 */
function processarGraficoCategorias(modelos) {
  const contagemCategorias = {};

  // Conta quantos modelos existem para cada categoria
  modelos.forEach((modelo) => {
    const categoria = modelo.categoria || 'Sem Categoria';
    contagemCategorias[categoria] = (contagemCategorias[categoria] || 0) + 1;
  });

  const labels = Object.keys(contagemCategorias);
  const data = Object.values(contagemCategorias);

  // 3. Renderiza o Gráfico de Barras
  const ctx = document.getElementById('graficoCategorias').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Nº de Modelos',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          // Garante que o eixo Y só mostre números inteiros
          ticks: {
            stepSize: 1,
          },
        },
      },
      plugins: {
        legend: {
          display: false, // Desnecessário para gráfico de 1 barra
        },
        title: {
          display: false,
          text: 'Modelos por Categoria',
        },
      },
    },
  });
}
