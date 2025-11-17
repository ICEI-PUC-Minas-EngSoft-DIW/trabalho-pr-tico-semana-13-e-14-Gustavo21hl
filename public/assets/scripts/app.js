// URL base da sua API (onde o json-server está rodando)
const apiUrl = 'http://localhost:3000/modelos';

// Função principal que roda quando o DOM está carregado
document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log('TenisBlog - App carregado');

  const path = window.location.pathname;

  if (
    path.includes('index.html') ||
    path === '/' ||
    path.endsWith('/public/')
  ) {
    console.log('Carregando página inicial');
    carregarModelos();
  } else if (path.includes('detalhes.html')) {
    console.log('Carregando página de detalhes');
    carregarDetalhes();
  } else if (path.includes('cadastro_modelo.html')) {
    console.log('Carregando página de cadastro/edição');
    initFormulario();
  }
}

// READ (Todos) - Carrega os modelos na página inicial
async function carregarModelos() {
  const container = document.querySelector('.dividir_modelos');
  if (!container) {
    console.error('Container de modelos não encontrado');
    return;
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Falha ao buscar dados da API');
    const dados = await response.json();

    console.log('Dados JSON carregados via API:', dados);
    container.innerHTML = ''; // Limpa o container

    dados.forEach((item) => {
      const card = `
        <a href="detalhes.html?id=${item.id}" class="card-link">
          <div class="modelo">
            <img src="${item.imagem}" alt="${item.titulo}" />
            <h3>${item.titulo}</h3>
            <p>${item.valor}</p>
          </div>
        </a>
      `;
      container.innerHTML += card;
    });
    console.log('Modelos carregados com sucesso');
  } catch (error) {
    console.error('Erro ao carregar modelos:', error);
    container.innerHTML =
      '<p>Erro ao carregar os modelos. Tente novamente.</p>';
  }
}

// READ (Um) - Carrega os detalhes do produto (COM GALERIA)
async function carregarDetalhes() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const container = document.getElementById('detalhes-container');

  console.log('ID do produto:', id);

  if (!id) {
    container.innerHTML = '<p>Produto não encontrado (ID não fornecido).</p>';
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${id}`);
    if (!response.ok) throw new Error('Produto não encontrado na API');
    const produto = await response.json();

    console.log('Produto encontrado:', produto);

    // --- Bloco 1: HTML Principal do Produto ---
    const detalhesHTML = `
      <div class="detalhes-produto">
        <div class="detalhes-imagem">
          <img src="${produto.imagemDetalhe || produto.imagem}" alt="${
      produto.titulo
    }" />
        </div>
        <div class="detalhes-info">
          <h1>${produto.titulo}</h1>
          <p class="marca">Marca: ${produto.marca}</p>
          <p class="valor">${produto.valor}</p>
          <p class="descricao">${produto.descricao}</p>
          <div class="conteudo">
            <h3>Detalhes do Produto</h3>
            <p>${produto.conteudo}</p>
          </div>
          <div class="categoria">
            <strong>Categoria:</strong> ${produto.categoria}
          </div>
          <div class="acoes">
            <a href="${produto.linkCompra}" target="_blank" class="btn-comprar">
              🛒 Comprar Agora
            </a>
            <a href="cadastro_modelo.html?id=${produto.id}" class="btn-editar">
              ✏️ Editar
            </a>
            <button id="btn-deletar" data-id="${
              produto.id
            }" class="btn-deletar">
              🗑️ Deletar
            </button>
            <a href="index.html" class="btn-voltar">← Voltar</a>
          </div>
        </div>
      </div>
    `;

    // --- Bloco 2: HTML da Galeria de Fotos (NOVO) ---
    let galeriaHTML = '';
    // Verifica se a galeria existe e não está vazia
    if (produto.fotosDetalhe && produto.fotosDetalhe.length > 0) {
      galeriaHTML = `
        <div class="fotos-vinculadas">
          <h3>Mais Detalhes</h3>
          <div class="fotos-grid">
            ${produto.fotosDetalhe
              .map(
                (foto) => `
              <div class="foto-item">
                <img src="${foto.img}" alt="${foto.legenda}" />
                <p>${foto.legenda}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    // --- Bloco 3: Juntar tudo e renderizar ---
    // O container principal (detalhes-container) recebe os dois blocos
    container.innerHTML = detalhesHTML + galeriaHTML;

    // Adiciona o listener para o botão de deletar
    document
      .getElementById('btn-deletar')
      .addEventListener('click', deletarModelo);
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    container.innerHTML = '<p>Produto não encontrado.</p>';
  }
}

// Inicializa o formulário (para CREATE e UPDATE)
async function initFormulario() {
  const form = document.getElementById('form-modelo');
  const h1 = document.querySelector('.form-container h1');
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  // *** LÓGICA DE UPLOAD DE IMAGEM PRINCIPAL (BASE64) ***
  const inputImagem = document.getElementById('imagem-file');
  const hiddenInputImagem = document.getElementById('imagem');
  const previewImagem = document.getElementById('imagem-preview');

  inputImagem.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // 1. Ler o arquivo como Data URL (Base64)
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      // 2. Salvar a string Base64 no input escondido
      hiddenInputImagem.value = base64String;
      // 3. Mostrar a pré-visualização
      previewImagem.src = base64String;
      previewImagem.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
  // *** FIM DA LÓGICA DE UPLOAD ***

  if (id) {
    // Modo Edição (UPDATE)
    h1.textContent = 'Editar Modelo';
    try {
      const response = await fetch(`${apiUrl}/${id}`);
      const modelo = await response.json();

      // Preenche o formulário com os dados existentes
      document.getElementById('modelo-id').value = modelo.id;
      document.getElementById('titulo').value = modelo.titulo;
      document.getElementById('marca').value = modelo.marca;
      document.getElementById('valor').value = modelo.valor;
      document.getElementById('descricao').value = modelo.descricao;
      document.getElementById('conteudo').value = modelo.conteudo;
      document.getElementById('categoria').value = modelo.categoria;
      document.getElementById('linkCompra').value = modelo.linkCompra;

      // Preenche os dados da imagem (Base64)
      const imagemBase64 = modelo.imagemDetalhe || modelo.imagem;
      hiddenInputImagem.value = imagemBase64;
      if (imagemBase64) {
        previewImagem.src = imagemBase64;
        previewImagem.style.display = 'block';
      }
    } catch (error) {
      console.error('Erro ao buscar modelo para edição:', error);
    }
  } else {
    // Modo Cadastro (CREATE)
    h1.textContent = 'Cadastrar Novo Modelo';
  }

  // Listener para salvar (CREATE ou UPDATE)
  form.addEventListener('submit', salvarModelo);
}

// CREATE / UPDATE - Salva o modelo
async function salvarModelo(event) {
  event.preventDefault(); // Impede o envio padrão do formulário

  const id = document.getElementById('modelo-id').value; // Pega o ID (se existir)
  const imagemBase64 = document.getElementById('imagem').value;

  // Validação simples de imagem
  if (!imagemBase64) {
    alert('Por favor, faça o upload de uma imagem.');
    return;
  }

  // Monta o objeto com os dados do formulário
  const modelo = {
    titulo: document.getElementById('titulo').value,
    marca: document.getElementById('marca').value,
    valor: document.getElementById('valor').value,
    descricao: document.getElementById('descricao').value,
    conteudo: document.getElementById('conteudo').value,
    categoria: document.getElementById('categoria').value,
    linkCompra: document.getElementById('linkCompra').value,
    data: new Date().toISOString().split('T')[0], // Adiciona data atual
    // Salva a imagem Base64 em ambos os campos para consistência
    imagem: imagemBase64,
    imagemDetalhe: imagemBase64,
  };

  let method = 'POST'; // Método padrão (CREATE)
  let url = apiUrl;

  if (id) {
    // Se tem ID, é UPDATE
    method = 'PUT';
    url = `${apiUrl}/${id}`;
    modelo.id = parseInt(id);

    // *** MANUTENÇÃO DA GALERIA (IMPORTANTE) ***
    // Ao editar, precisamos buscar a galeria antiga para não perdê-la.
    try {
      const resAntigo = await fetch(`${apiUrl}/${id}`);
      const modeloAntigo = await resAntigo.json();
      if (modeloAntigo.fotosDetalhe) {
        modelo.fotosDetalhe = modeloAntigo.fotosDetalhe;
      }
    } catch (e) {
      console.warn(
        'Não foi possível buscar galeria antiga. Será mantida em branco.'
      );
    }
  } else {
    // Se é um item NOVO, inicializa a galeria de fotos vazia
    modelo.fotosDetalhe = [];
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modelo),
    });

    if (!response.ok) throw new Error('Erro ao salvar o modelo');

    alert(`Modelo ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
    window.location.href = 'index.html'; // Redireciona para a home
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Falha ao salvar o modelo. Tente novamente.');
  }
}

// DELETE - Deleta um modelo
async function deletarModelo(event) {
  const id = event.target.dataset.id;

  if (!confirm(`Tem certeza que deseja deletar o modelo com ID ${id}?`)) {
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Erro ao deletar o modelo');

    alert('Modelo deletado com sucesso!');
    window.location.href = 'index.html'; // Redireciona para a home
  } catch (error) {
    console.error('Erro ao deletar:', error);
    alert('Falha ao deletar o modelo. Tente novamente.');
  }
}
