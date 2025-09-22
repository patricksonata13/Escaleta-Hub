// Configuração do Firebase (versão gratuita)
const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyForFreeTier123456",
    authDomain: "escaleta-hub-free.firebaseapp.com",
    projectId: "escaleta-hub-free",
    storageBucket: "escaleta-hub-free.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Inicialização condicional do Firebase
class FirebaseManager {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Verificar se Firebase está disponível
        if (typeof firebase !== 'undefined') {
            try {
                firebase.initializeApp(firebaseConfig);
                this.isInitialized = true;
                console.log('Firebase inicializado com sucesso');
                
                // Inicializar outros serviços
                this.initAuth();
                this.initFirestore();
                
            } catch (error) {
                console.warn('Firebase não disponível, usando localStorage:', error);
                this.fallbackToLocalStorage();
            }
        } else {
            this.fallbackToLocalStorage();
        }
    }

    initAuth() {
        this.auth = firebase.auth();
        
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('Usuário logado:', user.email);
                this.dispatchEvent('authStateChanged', { user, isLoggedIn: true });
            } else {
                console.log('Usuário deslogado');
                this.dispatchEvent('authStateChanged', { user: null, isLoggedIn: false });
            }
        });
    }

    initFirestore() {
        this.db = firebase.firestore();
        
        // Configuração para desenvolvimento
        if (window.location.hostname === "localhost") {
            this.db.useEmulator("localhost", 8080);
        }
    }

    fallbackToLocalStorage() {
        console.log('Usando localStorage como fallback');
        this.isInitialized = false;
        
        // Sistema de eventos para manter compatibilidade
        window.addEventListener('authStateChanged', (event) => {
            console.log('Evento de auth capturado:', event.detail);
        });
    }

    // Método universal para salvar dados
    async saveData(collection, data) {
        if (this.isInitialized && this.db) {
            try {
                const docRef = await this.db.collection(collection).add({
                    ...data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return docRef.id;
            } catch (error) {
                console.error('Erro ao salvar no Firestore:', error);
                return this.saveToLocalStorage(collection, data);
            }
        } else {
            return this.saveToLocalStorage(collection, data);
        }
    }

    saveToLocalStorage(collection, data) {
        const key = `firestore_${collection}`;
        const existingData = JSON.parse(localStorage.getItem(key)) || [];
        
        const newItem = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        existingData.push(newItem);
        localStorage.setItem(key, JSON.stringify(existingData));
        
        return Promise.resolve(newItem.id);
    }

    // Sistema de eventos
    dispatchEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
}

// Inicialização
const firebaseManager = new FirebaseManager();
