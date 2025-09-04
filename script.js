// ========= VARIÁVEIS GLOBAIS PARA VÍDEO =========
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let availableCameras = [];
let currentCameraIndex = 0;
let isRecording = false;
let recordingTimer = null;
let recordingDuration = 0;
let screenStream = null;

// ========= FUNÇÕES APERFEIÇOADAS PARA VÍDEO =========

// Inicializar câmera com mais opções
async function initializeCamera() {
    try {
        // Parar stream atual se existir
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        
        // Obter dispositivos de mídia disponíveis
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameras = devices.filter(device => device.kind === 'videoinput');
        
        if (availableCameras.length === 0) {
            throw new Error('Nenhuma câmera encontrada');
        }
        
        // Configurações avançadas da câmera
        const constraints = {
            video: {
                deviceId: availableCameras[currentCameraIndex].deviceId ? 
                         { exact: availableCameras[currentCameraIndex].deviceId } : 
                         true,
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 60 }
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        };
        
        // Obter stream de mídia
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        const localVideo = document.getElementById('localVideo');
        
        if (localVideo) {
            localVideo.srcObject = mediaStream;
        }
        
        // Atualizar interface
        updateCameraStatus(true);
        notify('Câmera ativada com sucesso!');
        
        return true;
    } catch (error) {
        console.error('Erro ao inicializar câmera:', error);
        updateCameraStatus(false);
        notify('Erro ao acessar a câmera: ' + error.message);
        return false;
    }
}

// Alternar entre câmeras
async function switchCamera() {
    if (availableCameras.length <= 1) {
        notify('Apenas uma câmera disponível');
        return;
    }
    
    currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
    await initializeCamera();
    notify(`Câmera ${currentCameraIndex + 1} de ${availableCameras.length} ativa`);
}

// Alternar estado do vídeo
function toggleVideo() {
    if (!mediaStream) return;
    
    const videoTrack = mediaStream.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const toggleVideoBtn = document.getElementById('toggleVideoBtn');
        if (toggleVideoBtn) {
            toggleVideoBtn.innerHTML = videoTrack.enabled ? 
                '<i class="fas fa-video"></i>' : 
                '<i class="fas fa-video-slash"></i>';
            toggleVideoBtn.style.background = videoTrack.enabled ? '#3498db' : '#e74c3c';
        }
        notify(`Vídeo ${videoTrack.enabled ? 'ligado' : 'desligado'}`);
    }
}

// Alternar estado do áudio
function toggleAudio() {
    if (!mediaStream) return;
    
    const audioTrack = mediaStream.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const toggleAudioBtn = document.getElementById('toggleAudioBtn');
        if (toggleAudioBtn) {
            toggleAudioBtn.innerHTML = audioTrack.enabled ? 
                '<i class="fas fa-microphone"></i>' : 
                '<i class="fas fa-microphone-slash"></i>';
            toggleAudioBtn.style.background = audioTrack.enabled ? '#3498db' : '#e74c3c';
        }
        notify(`Áudio ${audioTrack.enabled ? 'ligado' : 'desligado'}`);
    }
}

// Compartilhar tela
async function shareScreen() {
    try {
        // Parar gravação se estiver ativa
        if (isRecording) {
            stopRecording();
        }
        
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always",
                displaySurface: "window"
            },
            audio: true
        });
        
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = screenStream;
        }
        
        // Atualizar interface
        const screenShareBtn = document.getElementById('screenShareBtn');
        if (screenShareBtn) {
            screenShareBtn.innerHTML = '<i class="fas fa-times"></i>';
            screenShareBtn.style.background = '#e67e22';
            screenShareBtn.onclick = stopScreenShare;
        }
        
        // Quando a tela compartilhada for interrompida
        screenStream.getVideoTracks()[0].onended = stopScreenShare;
        
        notify('Compartilhamento de tela ativado');
    } catch (error) {
        console.error('Erro ao compartilhar tela:', error);
        notify('Erro ao compartilhar tela: ' + error.message);
    }
}

// Parar compartilhamento de tela
function stopScreenShare() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
    }
    
    // Restaurar câmera
    if (mediaStream) {
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = mediaStream;
        }
    }
    
    // Restaurar botão
    const screenShareBtn = document.getElementById('screenShareBtn');
    if (screenShareBtn) {
        screenShareBtn.innerHTML = '<i class="fas fa-desktop"></i>';
        screenShareBtn.style.background = '#3498db';
        screenShareBtn.onclick = shareScreen;
    }
    
    notify('Compartilhamento de tela desativado');
}

// Iniciar gravação
function startRecording() {
    if (!mediaStream && !screenStream) {
        notify('Nenhuma fonte de vídeo disponível para gravar');
        return;
    }
    
    const streamToRecord = screenStream || mediaStream;
    recordedChunks = [];
    
    // Configurar o media recorder com opções avançadas
    const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
    };
    
    try {
        mediaRecorder = new MediaRecorder(streamToRecord, options);
    } catch (e) {
        try {
            // Fallback para codec mais compatível
            options.mimeType = 'video/webm;codecs=vp8,opus';
            mediaRecorder = new MediaRecorder(streamToRecord, options);
        } catch (e2) {
            notify('Seu navegador não suporta gravação de vídeo: ' + e2.message);
            return;
        }
    }
    
    // Evento quando dados estiverem disponíveis
    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    
    // Evento quando a gravação for parada
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        
        // Criar download automático
        const a = document.createElement('a');
        a.href = videoURL;
        a.download = `gravacao-${new Date().toISOString().replace(/[:.]/g,'-')}.webm`;
        a.click();
        
        // Limpar
        URL.revokeObjectURL(videoURL);
        isRecording = false;
        recordingDuration = 0;
        clearInterval(recordingTimer);
        
        // Atualizar interface
        updateRecordingStatus(false);
        notify('Gravação salva com sucesso!');
    };
    
    // Iniciar gravação
    mediaRecorder.start(1000); // Coletar dados a cada 1 segundo
    isRecording = true;
    
    // Iniciar temporizador
    recordingDuration = 0;
    recordingTimer = setInterval(() => {
        recordingDuration++;
        updateRecordingTime();
    }, 1000);
    
    // Atualizar interface
    updateRecordingStatus(true);
    notify('Gravação iniciada');
}

// Parar gravação
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
}

// Atualizar status da câmera na interface
function updateCameraStatus(isActive) {
    const toggleVideoBtn = document.getElementById('toggleVideoBtn');
    const toggleAudioBtn = document.getElementById('toggleAudioBtn');
    const startRecordingBtn = document.getElementById('recBtn');
    
    if (isActive) {
        if (toggleVideoBtn) toggleVideoBtn.disabled = false;
        if (toggleAudioBtn) toggleAudioBtn.disabled = false;
        if (startRecordingBtn) startRecordingBtn.disabled = false;
    } else {
        if (toggleVideoBtn) toggleVideoBtn.disabled = true;
        if (toggleAudioBtn) toggleAudioBtn.disabled = true;
        if (startRecordingBtn) startRecordingBtn.disabled = true;
    }
}

// Atualizar status da gravação na interface
function updateRecordingStatus(recording) {
    const recBtn = document.getElementById('recBtn');
    const recordingIndicator = document.getElementById('recordingIndicator');
    
    if (recBtn) {
        if (recording) {
            recBtn.innerHTML = '<i class="fas fa-stop"></i>';
            recBtn.style.background = '#e74c3c';
            recBtn.onclick = stopRecording;
        } else {
            recBtn.innerHTML = '<i class="fas fa-record-vinyl"></i>';
            recBtn.style.background = '#3498db';
            recBtn.onclick = startRecording;
        }
    }
    
    if (recordingIndicator) {
        recordingIndicator.style.display = recording ? 'block' : 'none';
    }
}

// Atualizar tempo de gravação
function updateRecordingTime() {
    const recordingTime = document.getElementById('recordingTime');
    if (recordingTime) {
        const minutes = Math.floor(recordingDuration / 60);
        const seconds = recordingDuration % 60;
        recordingTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Fechar chamada e limpar recursos
function endCall() {
    // Parar gravação se estiver ativa
    if (isRecording) {
        stopRecording();
    }
    
    // Parar compartilhamento de tela se estiver ativo
    if (screenStream) {
        stopScreenShare();
    }
    
    // Parar stream de mídia
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    // Limpar interface
    const localVideo = document.getElementById('localVideo');
    if (localVideo) {
        localVideo.srcObject = null;
    }
    
    updateCameraStatus(false);
    updateRecordingStatus(false);
    
    notify('Chamada encerrada');
}

// ========= INICIALIZAÇÃO DO PAINEL CHAMA =========

// Inicializar o painel de vídeo quando aberto
function initVideoPanel() {
    const videoPanel = document.getElementById('videoPanel');
    
    if (videoPanel) {
        // Adicionar indicador de gravação (se não existir)
        if (!document.getElementById('recordingIndicator')) {
            const recordingIndicator = document.createElement('div');
            recordingIndicator.id = 'recordingIndicator';
            recordingIndicator.style.cssText = 'position:absolute; top:10px; left:10px; background:#e74c3c; color:white; padding:4px 8px; border-radius:4px; font-size:12px; display:none;';
            recordingIndicator.innerHTML = '<i class="fas fa-circle"></i> <span id="recordingTime">00:00</span>';
            videoPanel.querySelector('.video-box').appendChild(recordingIndicator);
        }
        
        // Configurar event listeners para os botões
        document.getElementById('toggleVideoBtn').addEventListener('click', toggleVideo);
        document.getElementById('toggleAudioBtn').addEventListener('click', toggleAudio);
        document.getElementById('screenShareBtn').addEventListener('click', shareScreen);
        document.getElementById('recBtn').addEventListener('click', startRecording);
        document.getElementById('endCallBtn').addEventListener('click', endCall);
        
        // Inicializar câmera quando o painel é aberto
        if (videoPanel.style.display !== 'none') {
            initializeCamera();
        }
    }
}

// Adicionar à inicialização principal
document.addEventListener('DOMContentLoaded', function() {
    // ... seu código existente ...
    
    // Inicializar painel de vídeo
    initVideoPanel();
    
    // Re-inicializar câmera quando o painel é aberto
    const videoOpenBtn = document.getElementById('openVideoFab');
    if (videoOpenBtn) {
        videoOpenBtn.addEventListener('click', function() {
            setTimeout(initializeCamera, 300); // Pequeno delay para o painel abrir
        });
    }
});
}
