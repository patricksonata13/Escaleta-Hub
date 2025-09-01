// Variáveis globais
let currentScript = {
  title: "Roteiro Sem Título",
  content: "",
  storyboards: []
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Carregar dados salvos se existirem
  if (localStorage.getItem('scriptFlowData')) {
    try {
      currentScript = JSON.parse(localStorage.getItem('scriptFlowData'));
      document.getElementById('editor').innerHTML = currentScript.content;
      
      // Carregar storyboards se existirem
      if (currentScript.storyboards && currentScript.storyboards.length > 0) {
        currentScript.storyboards.forEach(storyboard => {
          addStoryboard(storyboard.image, storyboard.description);
        });
      }
    } catch (e) {
      console.error("Erro ao carregar dados salvos:", e);
    }
  }
  
  // Adicionar listeners para atalhos de teclado
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 's':
          e.preventDefault();
          saveText();
          break;
        case 'o':
          e.preventDefault();
          loadText();
          break;
        case 'p':
          e.preventDefault();
          exportPDF();
          break;
      }
    }
  });
});

// Funções de abas
function openTab(evt, tabId) {
  // Esconder todos os conteúdos de abas
  const tabContents = document.getElementsByClassName('tab-content');
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove('active');
  }
  
  // Desativar todos os botões de abas
  const tabButtons = document.getElementsByClassName('tabs')[0].getElementsByTagName('button');
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].classList.remove('active');
  }
  
  // Ativar a aba atual
  document.getElementById(tabId).classList.add('active');
  evt.currentTarget.classList.add('active');
}

// Funções do editor
function insertElement(type) {
  const editor = document.getElementById('editor');
  let newElement;
  
  switch(type) {
    case 'scene':
      newElement = document.createElement('div');
      newElement.className = 'scene-heading';
      newElement.contentEditable = true;
      newElement.textContent = 'INT. LOCAL - DIA';
      break;
    case 'character':
      newElement = document.createElement('div');
      newElement.className = 'character';
      newElement.contentEditable = true;
      newElement.textContent = 'NOME DO PERSONAGEM';
      break;
    case 'dialogue':
      newElement = document.createElement('div');
      newElement.className = 'dialogue';
      newElement.contentEditable = true;
      newElement.textContent = 'Diálogo do personagem...';
      break;
    case 'action':
      newElement = document.createElement('div');
      newElement.className = 'action';
      newElement.contentEditable = true;
      newElement.textContent = 'Ação ou descrição...';
      break;
    case 'transition':
      newElement = document.createElement('div');
      newElement.className = 'transition';
      newElement.contentEditable = true;
      newElement.textContent = 'CORTAR PARA:';
      break;
  }
  
  editor.appendChild(newElement);
  newElement.focus();
  
  // Salvar automaticamente
  saveToLocalStorage();
}

// Funções de salvamento e carregamento
function saveText() {
  saveToLocalStorage();
  alert('Roteiro salvo com sucesso!');
}

function loadText() {
  // Simular carregamento de arquivo (em implementação real, usaria FileReader)
  const loadConfirm = confirm('Deseja carregar o último roteiro salvo?');
  if (loadConfirm) {
    if (localStorage.getItem('scriptFlowData')) {
      try {
        currentScript = JSON.parse(localStorage.getItem('scriptFlowData'));
        document.getElementById('editor').innerHTML = currentScript.content;
        alert('Roteiro carregado com sucesso!');
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        alert('Erro ao carregar o roteiro.');
      }
    } else {
      alert('Nenhum roteiro salvo encontrado.');
    }
  }
}

function saveToLocalStorage() {
  currentScript.content = document.getElementById('editor').innerHTML;
  currentScript.lastSaved = new Date().toISOString();
  localStorage.setItem('scriptFlowData', JSON.stringify(currentScript));
}

// Funções de exportação
function exportFDX() {
  alert('Exportação para FDX será implementada em breve!');
  // Em uma implementação real, aqui seria a lógica para gerar o arquivo FDX
}

function exportPDF() {
  alert('Exportação para PDF será implementada em breve!');
  // Em uma implementação real, usaria a biblioteca jsPDF para gerar o PDF
}

// Funções do storyboard
function addStoryboard(imageData = null, description = '') {
  const storyboardContainer = document.getElementById('storyboard');
  const frameId = 'frame-' + Date.now();
  
  const frame = document.createElement('div');
  frame.className = 'storyboard-frame';
  frame.id = frameId;
  
  frame.innerHTML = `
    <div class="frame-image" onclick="triggerImageUpload('${frameId}')">
      ${imageData ? 
        `<img src="${imageData}" style="width:100%; height:100%; object-fit:cover;">` : 
        `<i class="fas fa-image fa-3x"></i><p>Clique para adicionar imagem</p>`
      }
    </div>
    <div class="frame-content">
      <textarea placeholder="Descrição da cena..." onchange="updateStoryboardDescription('${frameId}', this.value)">${description}</textarea>
    </div>
    <div class="frame-actions">
      <button onclick="removeStoryboard('${frameId}')" class="btn-remove"><i class="fas fa-trash"></i> Remover</button>
    </div>
  `;
  
  storyboardContainer.appendChild(frame);
  
  // Adicionar ao array currentScript e salvar
  currentScript.storyboards.push({
    id: frameId,
    image: imageData,
    description: description
  });
  saveToLocalStorage();
}

function triggerImageUpload(frameId) {
  // Simular upload de imagem (em implementação real, usaria input type=file)
  const useSample = confirm('Deseja usar uma imagem de exemplo?');
  if (useSample) {
    const sampleImages = [
      'https://via.placeholder.com/300x150/3498db/ffffff?text=Cena+1',
      'https://via.placeholder.com/300x150/e74c3c/ffffff?text=Cena+2',
      'https://via.placeholder.com/300x150/2ecc71/ffffff?text=Cena+3'
    ];
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    
    const frameImage = document.querySelector(`#${frameId} .frame-image`);
    frameImage.innerHTML = `<img src="${randomImage}" style="width:100%; height:100%; object-fit:cover;">`;
    
    // Atualizar no currentScript
    const frameIndex = currentScript.storyboards.findIndex(s => s.id === frameId);
    if (frameIndex !== -1) {
      currentScript.storyboards[frameIndex].image = randomImage;
      saveToLocalStorage();
    }
  }
}

function updateStoryboardDescription(frameId, description) {
  const frameIndex = currentScript.storyboards.findIndex(s => s.id === frameId);
  if (frameIndex !== -1) {
    currentScript.storyboards[frameIndex].description = description;
    saveToLocalStorage();
  }
}

function removeStoryboard(frameId) {
  const frame = document.getElementById(frameId);
  frame.parentNode.removeChild(frame);
  
  // Remover do array currentScript
  currentScript.storyboards = currentScript.storyboards.filter(s => s.id !== frameId);
  saveToLocalStorage();
}

// Funções de ajuda
function showHelp() {
  document.getElementById('help-modal').style.display = 'flex';
}

function closeHelp() {
  document.getElementById('help-modal').style.display = 'none';
}
