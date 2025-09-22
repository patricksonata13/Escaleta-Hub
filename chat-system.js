class ChatSystem {
    constructor() {
        this.messages = JSON.parse(localStorage.getItem('escaleta_chat')) || [];
        this.currentUser = null;
        this.init();
    }

    init() {
        this.renderMessages();
        this.setupEventListeners();
        
        // Simular usuários online (em uma versão real, viria do backend)
        this.simulateOnlineUsers();
    }

    simulateOnlineUsers() {
        const onlineUsers = [
            { name: 'Alice Silva', role: 'Roteirista', online: true },
            { name: 'Carlos Lima', role: 'Diretor', online: true },
            { name: 'Maria Santos', role: 'Produtora', online: false }
        ];
        
        this.renderOnlineUsers(onlineUsers);
    }

    sendMessage(messageText) {
        if (!messageText.trim()) return;

        const message = {
            id: Date.now(),
            text: messageText,
            user: this.currentUser?.name || 'Usuário Anônimo',
            timestamp: new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            avatar: './assets/icons/icon-192.png'
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        this.clearInput();
        
        // Simular resposta automática (em versão real seria WebSocket)
        if (Math.random() > 0.5) {
            setTimeout(() => this.simulateResponse(), 2000);
        }
    }

    simulateResponse() {
        const responses = [
            "Concordo com essa ideia!",
            "Vamos desenvolver melhor esse ponto?",
            "Alguém tem referências para isso?",
            "Precisamos ajustar a escaleta nessa parte",
            "Ótimo ponto! Anotado no storyboard"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        const botMessage = {
            id: Date.now(),
            text: response,
            user: 'Bot Colaborativo',
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            avatar: './assets/icons/icon-192.png',
            isBot: true
        };

        this.messages.push(botMessage);
        this.saveMessages();
        this.renderMessages();
    }

    saveMessages() {
        localStorage.setItem('escaleta_chat', JSON.stringify(this.messages));
    }

    renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => `
            <div class="chat-message ${msg.isBot ? 'bot-message' : ''}">
                <img src="${msg.avatar}" alt="${msg.user}" class="message-avatar">
                <div class="message-content">
                    <div class="message-header">
                        <strong>${msg.user}</strong>
                        <span class="message-time">${msg.timestamp}</span>
                    </div>
                    <div class="message-text">${msg.text}</div>
                </div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }

    renderOnlineUsers(users) {
        const container = document.getElementById('online-users');
        if (!container) return;

        container.innerHTML = users.map(user => `
            <div class="online-user ${user.online ? 'online' : 'offline'}">
                <div class="user-status"></div>
                <img src="./assets/icons/icon-192.png" alt="${user.name}" class="user-avatar">
                <div class="user-info">
                    <strong>${user.name}</strong>
                    <span>${user.role}</span>
                </div>
            </div>
        `).join('');
    }

    clearInput() {
        const input = document.getElementById('chat-input');
        if (input) input.value = '';
    }

    setupEventListeners() {
        const sendBtn = document.getElementById('send-chat-btn');
        const chatInput = document.getElementById('chat-input');

        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage(chatInput.value);
            });

            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage(chatInput.value);
                }
            });
        }
    }
}

// HTML do Chat (adicionar ao index.html)
const chatHTML = `
<!-- Painel de Chat na Sidebar -->
<div id="chat-panel" class="sidebar-panel">
    <div class="chat-header">
        <h4><i class="fas fa-comments"></i> Chat da Equipe</h4>
        <span class="online-indicator">● <span id="online-count">2</span> online</span>
    </div>
    
    <div class="chat-messages-container">
        <div id="chat-messages" class="chat-messages"></div>
    </div>
    
    <div class="chat-input-container">
        <input type="text" id="chat-input" placeholder="Digite uma mensagem...">
        <button id="send-chat-btn" class="send-button">
            <i class="fas fa-paper-plane"></i>
        </button>
    </div>
</div>

<!-- Seção de Usuários Online -->
<div class="collab-section">
    <h3><i class="fas fa-users"></i> Equipe Online</h3>
    <div id="online-users" class="users-grid"></div>
</div>
`;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    const chatSystem = new ChatSystem();
    window.chatSystem = chatSystem; // Para acesso global
});
