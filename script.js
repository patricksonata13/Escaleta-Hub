// script.js - Escaleta Hub - Plataforma de Roteiristas

// ===== VARIÁVEIS GLOBAIS =====
let deferredPrompt;
let autosaveInterval;
let currentProject = {
    title: "Roteiro Sem Título",
    script: "",
    draft: "",
    bible: "",
    outline: "",
    lastSaved: new Date()
};

// ===== FUNÇÕES DE INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeServiceWorker();
    loadSavedData(); // Carregar dados salvos ao iniciar
    setupAutoSave(); // Iniciar sistema de auto-save
});

function initializeApp() {
    // Verificar se estamos no contexto correto
    if (!document.getElementById('openingScreen')) {
        console.error('Elementos do DOM não carregados corretamente');
        return;
    }
    
    // Inicializar contador de palavras
    updateWordCount();
    
    // Configurar modo escuro/claro se houver preferência salva
    const savedMode = localStorage.getItem('escaleta_theme');
    if (savedMode === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (savedMode === 'focus') {
        document.body.classList.add('focus-mode');
    }
}

// ===== SISTEMA DE AUTO-SAVE =====
function setupAutoSave() {
    // Parar intervalo anterior se existir
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
    }
    
    // Salvar a cada 30 segundos
    autosaveInterval = setInterval(function() {
        saveCurrentProject();
    }, 30000); // 30 segundos
    
    console.log('Sistema de auto-save iniciado');
}

function saveCurrentProject() {
    try {
        // Salvar conteúdo do roteiro
        const scriptEditor = document.getElementById('script-editor');
        if (scriptEditor) {
            currentProject.script = scriptEditor.innerHTML;
        }
        
        // Salvar conteúdo do rascunho
        const draftEditor = document.getElementById('rascunho-editor');
        if (draftEditor) {
            currentProject.draft = draftEditor.value;
        }
        
        // Salvar título do documento
        const titleInput = document.getElementById('document-title-input');
        if (titleInput) {
            currentProject.title = titleInput.value;
        }
        
        // Salvar conteúdo da bíblia (se existir)
        const bibleContent = document.getElementById('biblia-tab');
        if (bibleContent) {
            currentProject.bible = bibleContent.innerHTML;
        }
        
        // Salvar conteúdo da escaleta (se existir)
        const outlineContent = document.getElementById('escaleta-tab');
        if (outlineContent) {
            currentProject.outline = outlineContent.innerHTML;
        }
        
        // Atualizar timestamp
        currentProject.lastSaved = new Date();
        
        // Salvar no localStorage
        localStorage.setItem('escaleta_current_project', JSON.stringify(currentProject));
        
        // Atualizar UI
        updateSaveStatus();
        
        console.log('Projeto salvo automaticamente:', currentProject.lastSaved.toLocaleTimeString());
    } catch (error) {
        console.error('Erro ao salvar projeto:', error);
    }
}

function loadSavedData() {
    try {
        const savedProject = localStorage.getItem('escaleta_current_project');
        
        if (savedProject) {
            currentProject = JSON.parse(savedProject);
            
            // Carregar roteiro
            const scriptEditor = document.getElementById('script-editor');
            if (scriptEditor && currentProject.script) {
                scriptEditor.innerHTML = currentProject.script;
            }
            
            // Carregar rascunho
            const draftEditor = document.getElementById('rascunho-editor');
            if (draftEditor && currentProject.draft) {
                draftEditor.value = currentProject.draft;
            }
            
            // Carregar título
            const titleInput = document.getElementById('document-title-input');
            if (titleInput && currentProject.title) {
                titleInput.value = currentProject.title;
            }
            
            // Atualizar contagem de palavras
            updateWordCount();
            
            // Atualizar UI
            const lastSavedElement = document.getElementById('last-saved');
            const lastSavedTimeElement = document.getElementById('last-saved-time');
            
            if (lastSavedElement) {
                lastSavedElement.textContent = 'agora';
            }
            
            if (lastSavedTimeElement) {
                lastSavedTimeElement.textContent = 'agora';
            }
            
            console.log('Projeto carregado:', currentProject.lastSaved);
        }
    } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
    }
}

function updateSaveStatus() {
    const lastSavedElement = document.getElementById('last-saved');
    const lastSavedTimeElement = document.getElementById('last-saved-time');
    const autosaveStatusElement = document.getElementById('autosave-status');
    
    if (lastSavedElement) {
        lastSavedElement.textContent = 'agora';
    }
    
    if (lastSavedTimeElement) {
        lastSavedTimeElement.textContent = new Date().toLocaleTimeString();
    }
    
    if (autosaveStatusElement) {
        autosaveStatusElement.innerHTML = '<i class="fas fa-sync-alt"></i> Auto-salvo';
        
        setTimeout(() => {
            if (autosaveStatusElement) {
                autosaveStatusElement.innerHTML = '';
            }
        }, 3000);
    }
}

// ===== FUNÇÕES EXISTENTES (mantidas do seu código original) =====
function setupEventListeners() {
    // Login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Controle de abas
    document.querySelectorAll('.tab-button, .sidebar-btn[data-tab]').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Botão de instalação PWA
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', handleInstall);
    }
    
    // Botão de nova cena
    const newSceneBtn = document.getElementById('new-scene-btn');
    if (newSceneBtn) {
        newSceneBtn.addEventListener('click', addNewScene);
    }
    
    // Botões de formatação
    document.querySelectorAll('[data-format]').forEach(button => {
        button.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            document.execCommand(format, false, null);
        });
    });
    
    // Botões de modo de visualização
    const nightModeBtn = document.getElementById('night-mode-btn');
    const focusModeBtn = document.getElementById('focus-mode-btn');
    const normalModeBtn = document.getElementById('normal-mode-btn');
    
    if (nightModeBtn) nightModeBtn.addEventListener('click', () => setTheme('dark'));
    if (focusModeBtn) focusModeBtn.addEventListener('click', () => setTheme('focus'));
    if (normalModeBtn) normalModeBtn.addEventListener('click', () => setTheme('normal'));
    
    // Botão de salvar
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveCurrentProject();
            alert('Projeto salvo com sucesso!');
        });
    }
    
    // Event listener para contador de palavras
    const scriptEditor = document.getElementById('script-editor');
    if (scriptEditor) {
        scriptEditor.addEventListener('input', updateWordCount);
    }
}

function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        const openingScreen = document.getElementById('openingScreen');
        const mainPlatform = document.getElementById('mainPlatform');
        
        if (openingScreen && mainPlatform) {
            openingScreen.style.opacity = '0';
            
            setTimeout(function() {
                openingScreen.style.display = 'none';
                mainPlatform.style.display = 'flex';
            }, 1000);
        }
    } else {
        alert('Por favor, preencha todos os campos.');
    }
}

function handleLogout() {
    const openingScreen = document.getElementById('openingScreen');
    const mainPlatform = document.getElementById('mainPlatform');
    
    if (openingScreen && mainPlatform) {
        // Salvar antes de sair
        saveCurrentProject();
        
        mainPlatform.style.display = 'none';
        openingScreen.style.display = 'flex';
        openingScreen.style.opacity = '1';
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
    }
}

function switchTab(tabId) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar a aba selecionada
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Atualizar botões da aba
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.querySelectorAll(`.tab-button[data-tab="${tabId}"]`).forEach(button => {
        button.classList.add('active');
    });
    
    // Atualizar botões da sidebar
    document.querySelectorAll('.sidebar-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    document.querySelectorAll(`.sidebar-btn[data-tab="${tabId}"]`).forEach(button => {
        button.classList.add('active');
    });
    
    // Atualizar informação no footer
    const tabName = document.querySelector(`.tab-button[data-tab="${tabId}"]`)?.textContent.trim() || 'Roteiro';
    const currentTabElement = document.getElementById('current-tab');
    
    if (currentTabElement) {
        currentTabElement.textContent = tabName;
    }
    
    // Salvar mudança de aba
    saveCurrentProject();
}

function updateWordCount() {
    const text = document.getElementById('script-editor')?.innerText || '';
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const wordCountElement = document.getElementById('word-count');
    
    if (wordCountElement) {
        wordCountElement.textContent = wordCount;
    }
}

function addNewScene() {
    const editor = document.getElementById('script-editor');
    if (editor) {
        const newScene = document.createElement('div');
        newScene.className = 'scene-heading';
        newScene.contentEditable = true;
        newScene.textContent = 'INT. NOVA CENA - DIA';
        editor.appendChild(newScene);
        newScene.focus();
        
        // Atualizar estatísticas
        updateStats();
    }
}

function updateStats() {
    const sceneCount = document.querySelectorAll('.scene-heading').length;
    const pageCount = Math.max(1, Math.floor(document.getElementById('script-editor')?.textContent.length / 1800 || 1));
    const statsElement = document.querySelector('.document-stats');
    
    if (statsElement) {
        statsElement.textContent = `${sceneCount} cenas • ${pageCount} páginas • Modificado agora`;
    }
}

function setTheme(theme) {
    document.body.classList.remove('dark-mode', 'focus-mode');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        localStorage.setItem('escaleta_theme', 'dark');
    } else if (theme === 'focus') {
        document.body.classList.add('focus-mode');
        localStorage.setItem('escaleta_theme', 'focus');
    } else {
        localStorage.setItem('escaleta_theme', 'normal');
    }
}

function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registrado com sucesso: ', registration.scope);
            })
            .catch(function(err) {
                console.log('Falha ao registrar ServiceWorker: ', err);
            });
    }
}

// Event listener para PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'flex';
    }
});

function handleInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou a instalação');
            }
            
            deferredPrompt = null;
            
            const installBtn = document.getElementById('installBtn');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        });
    }
}

// ===== FUNÇÕES DE BACKUP E EXPORTAÇÃO =====
function exportProject() {
    saveCurrentProject();
    
    const dataStr = JSON.stringify(currentProject, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${currentProject.title.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importProject(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedProject = JSON.parse(e.target.result);
            currentProject = importedProject;
            
            // Recarregar a interface com os dados importados
            loadSavedData();
            
            alert('Projeto importado com sucesso!');
        } catch (error) {
            console.error('Erro ao importar projeto:', error);
            alert('Erro ao importar o arquivo. Verifique se é um arquivo válido.');
        }
    };
    
    reader.readAsText(file);
}

// Adicionar event listener para exportação
const exportBtn = document.getElementById('export-btn');
if (exportBtn) {
    exportBtn.addEventListener('click', exportProject);
}

// Adicionar event listener para importação (se tiver um input file)
const importInput = document.createElement('input');
importInput.type = 'file';
importInput.accept = '.json';
importInput.style.display = 'none';
importInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        importProject(e.target.files[0]);
    }
});

document.body.appendChild(importInput);

const importBtn = document.getElementById('import-btn');
if (importBtn) {
    importBtn.addEventListener('click', function() {
        importInput.click();
    });
}

