// Configuração básica do Firebase
const firebaseConfig = {
    apiKey: "sua-api-key",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "seu-app-id"
};

// Inicialize o Firebase apenas se existir
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado');
}
// Sistema de formatação automática de roteiro
class ScriptFormatter {
    formatSceneHeading(text) {
        return text.toUpperCase().replace(/(INT\.|EXT\.)\s+(.+)\s+-\s+(DIA|NOITE)/, 
            '<div class="scene-heading">$&</div>');
    }
    
    formatCharacterName(text) {
        return text.replace(/^[A-Z\s]+$/, '<div class="character-name">$&</div>');
    }
}

// Gerenciador de cenas
class SceneManager {
    constructor() {
        this.scenes = [];
        this.currentScene = 0;
    }
    
    addScene(location, description) {
        const scene = {
            number: this.scenes.length + 1,
            location,
            description,
            characters: []
        };
        this.scenes.push(scene);
        this.updateTimeline();
    }
    
    updateTimeline() {
        const timeline = document.getElementById('scenesList');
        timeline.innerHTML = this.scenes.map(scene => `
            <div class="scene-item">
                <strong>${scene.number}. ${scene.location}</strong>
                <p>${scene.description}</p>
            </div>
        `).join('');
    }
}
