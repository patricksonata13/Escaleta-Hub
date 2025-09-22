class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('escaleta_users')) || [];
        this.init();
    }

    init() {
        // Verificar se usuário está logado
        const savedUser = localStorage.getItem('escaleta_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showUserPanel();
        }
    }

    register(email, password, name) {
        if (this.users.find(u => u.email === email)) {
            throw new Error('Email já cadastrado');
        }

        const user = { 
            id: Date.now(), 
            email, 
            password: btoa(password), // Criptografia básica
            name, 
            projects: [],
            createdAt: new Date().toISOString()
        };
        
        this.users.push(user);
        localStorage.setItem('escaleta_users', JSON.stringify(this.users));
        return user;
    }

    login(email, password) {
        const user = this.users.find(u => 
            u.email === email && 
            u.password === btoa(password)
        );
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('escaleta_current_user', JSON.stringify(user));
            this.showUserPanel();
            this.dispatchEvent('authChange', { user, action: 'login' });
            return user;
        }
        throw new Error('Email ou senha inválidos');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('escaleta_current_user');
        this.showLoginPanel();
        this.dispatchEvent('authChange', { user: null, action: 'logout' });
    }

    showUserPanel() {
        // Atualizar UI para usuário logado
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('user-panel').style.display = 'block';
        document.getElementById('user-name').textContent = this.currentUser.name;
    }

    showLoginPanel() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('user-panel').style.display = 'none';
    }

    // Event system para comunicação entre módulos
    addEventListener(event, callback) {
        this.events = this.events || {};
        this.events[event] = this.events[event] || [];
        this.events[event].push(callback);
    }

    dispatchEvent(event, data) {
        if (this.events && this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

// Interface de Login/Registro (HTML adicional)
const authHTML = `
<!-- Adicionar no seu HTML existente -->
<div id="auth-modals">
    <!-- Modal de Login -->
    <div id="login-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Login no Escaleta Hub</h3>
            <form id="login-form">
                <input type="email" placeholder="Email" required>
                <input type="password" placeholder="Senha" required>
                <button type="submit">Entrar</button>
            </form>
            <p>Não tem conta? <a href="#" id="show-register">Cadastre-se</a></p>
        </div>
    </div>

    <!-- Modal de Registro -->
    <div id="register-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Criar Conta</h3>
            <form id="register-form">
                <input type="text" placeholder="Nome completo" required>
                <input type="email" placeholder="Email" required>
                <input type="password" placeholder="Senha" required>
                <button type="submit">Criar Conta</button>
            </form>
        </div>
    </div>
</div>

<!-- User Panel na Sidebar -->
<div id="user-panel" class="sidebar-panel" style="display: none;">
    <div class="user-info">
        <img src="./assets/icons/icon-192.png" alt="Avatar">
        <span id="user-name"></span>
        <button id="logout-btn" class="btn-small">Sair</button>
    </div>
</div>
`;

// Inicialização
const authSystem = new AuthSystem();

// Adicionar HTML ao DOM
document.addEventListener('DOMContentLoaded', function() {
    document.body.insertAdjacentHTML('beforeend', authHTML);
    
    // Event Listeners
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;
        
        try {
            authSystem.login(email, password);
            this.reset();
        } catch (error) {
            alert(error.message);
        }
    });
});
