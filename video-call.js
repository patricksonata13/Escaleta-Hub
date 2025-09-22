class VideoCallSystem {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.isCallActive = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    async startCall() {
        try {
            // Solicitar permissões de mídia
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Configurar elementos de vídeo
            document.getElementById('local-video').srcObject = this.localStream;
            this.showVideoModal();
            this.isCallActive = true;

        } catch (error) {
            console.error('Erro ao acessar câmera/microfone:', error);
            alert('Não foi possível acessar a câmera/microfone');
        }
    }

    showVideoModal() {
        document.getElementById('video-call-modal').style.display = 'block';
    }

    hideVideoModal() {
        document.getElementById('video-call-modal').style.display = 'none';
    }

    async endCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        this.isCallActive = false;
        this.hideVideoModal();
    }

    setupEventListeners() {
        // Controles da videochamada
        document.getElementById('mute-btn').addEventListener('click', () => {
            const audioTrack = this.localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
        });

        document.getElementById('video-btn').addEventListener('click', () => {
            const videoTrack = this.localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
        });

        document.getElementById('end-call-btn').addEventListener('click', () => {
            this.endCall();
        });
    }
}

// HTML da Videochamada
const videoCallHTML = `
<div id="video-call-modal" class="modal">
    <div class="modal-content video-modal">
        <span class="close">&times;</span>
        <h3><i class="fas fa-video"></i> Videochamada</h3>
        
        <div id="video-container">
            <div class="video-wrapper">
                <video id="remote-video" autoplay playsinline></video>
                <small>Participante</small>
            </div>
            <div class="video-wrapper">
                <video id="local-video" autoplay muted playsinline></video>
                <small>Você</small>
            </div>
        </div>
        
        <div class="video-controls">
            <button id="mute-btn" class="btn-control">
                <i class="fas fa-microphone"></i>
            </button>
            <button id="video-btn" class="btn-control">
                <i class="fas fa-video"></i>
            </button>
            <button id="share-screen-btn" class="btn-control">
                <i class="fas fa-desktop"></i>
            </button>
            <button id="end-call-btn" class="btn-control danger">
                <i class="fas fa-phone-slash"></i>
            </button>
        </div>
    </div>
</div>

<!-- Botão para iniciar chamada -->
<button id="start-call-btn" class="btn-primary">
    <i class="fas fa-video"></i> Iniciar Videochamada
</button>
`;

// Inicialização
const videoCallSystem = new VideoCallSystem();
