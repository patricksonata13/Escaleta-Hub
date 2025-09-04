// Troca de abas
const tabs = document.querySelectorAll('.tab');
const buttons = document.querySelectorAll('.tab-btn');
buttons.forEach(btn => {
    btn.addEventListener('click', ()=>{
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabs.forEach(tab => tab.classList.remove('active'));
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Chat Fofoca
const fofocaHeader = document.getElementById('fofoca-header');
const fofocaBody = document.getElementById('fofoca-body');
fofocaHeader.addEventListener('click', ()=>{
    fofocaBody.style.display = fofocaBody.style.display === 'flex' ? 'none' : 'flex';
});
const chatInput = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-log');
document.getElementById('send-chat').addEventListener('click', ()=>{
    if(chatInput.value.trim()!==''){
        const p = document.createElement('p');
        p.textContent = chatInput.value;
        chatLog.appendChild(p);
        chatInput.value='';
        chatLog.scrollTop = chatLog.scrollHeight;
    }
});

// Chamada de vídeo (simples usando webcam)
const chamaHeader = document.getElementById('chama-header');
const chamaBody = document.getElementById('chama-body');
const video = chamaBody.querySelector('video');
chamaHeader.addEventListener('click', ()=>{
    chamaBody.style.display = chamaBody.style.display === 'flex' ? 'none' : 'flex';
    if(chamaBody.style.display === 'flex'){
        navigator.mediaDevices.getUserMedia({ video:true, audio:false })
        .then(stream=> video.srcObject = stream)
        .catch(err=> console.log('Erro ao acessar câmera: ', err));
    } else {
        video.srcObject && video.srcObject.getTracks().forEach(t=>t.stop());
    }
});

// Salvar automaticamente no localStorage
tabs.forEach(tab=>{
    const ta = tab.querySelector('textarea');
    if (ta) {
        const key = 'scriptflow_'+tab.id;
        // Carregar
        ta.value = localStorage.getItem(key) || '';
        // Salvar
        ta.addEventListener('input', ()=> localStorage.setItem(key, ta.value));
    }
});

// ========= STORYBOARD AVANÇADO =========
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const canvas = document.getElementById('storyboardCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const addImageBtn = document.getElementById('addImageBtn');
    const drawBtn = document.getElementById('drawBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    const drawingColor = document.getElementById('drawingColor');
    const brushSize = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const canvasStatus = document.getElementById('canvasStatus');
    
    // Estado do storyboard
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentMode = 'draw';
    let images = [];
    let currentImageId = 0;
    
    // Inicialização
    setTimeout(() => {
        loadCanvas();
        setupEventListeners();
    }, 100);
    
    // Configurar event listeners
    function setupEventListeners() {
        if (!addImageBtn) return;
        
        // Eventos do canvas
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Botões
        addImageBtn.addEventListener('click', addImage);
        drawBtn.addEventListener('click', () => setMode('draw'));
        clearBtn.addEventListener('click', clearCanvas);
        exportBtn.addEventListener('click', exportCanvas);
        
        // Controles
        drawingColor.addEventListener('change', updateDrawingStyle);
        brushSize.addEventListener('input', updateBrushSize);
    }
    
    // Atualizar visualização do tamanho do pincel
    function updateBrushSize() {
        if (!brushSizeValue) return;
        brushSizeValue.textContent = `${brushSize.value}px`;
        updateDrawingStyle();
    }
    
    // Atualizar estilo de desenho
    function updateDrawingStyle() {
        ctx.strokeStyle = drawingColor.value;
        ctx.lineWidth = brushSize.value;
    }
    
    // Definir modo de operação
    function setMode(mode) {
        currentMode = mode;
        
        if (mode === 'draw') {
            canvas.style.cursor = 'crosshair';
            canvasStatus.textContent = 'Modo: Desenho';
            drawBtn.classList.add('active');
        } else {
            canvas.style.cursor = 'default';
            drawBtn.classList.remove('active');
        }
    }
    
    // Começar a desenhar
    function startDrawing(e) {
        if (currentMode !== 'draw') return;
        
        isDrawing = true;
        const pos = getMousePos(canvas, e);
        [lastX, lastY] = [pos.x, pos.y];
    }
    
    // Desenhar
    function draw(e) {
        if (!isDrawing) return;
        
        e.preventDefault();
        const pos = getMousePos(canvas, e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        [lastX, lastY] = [pos.x, pos.y];
        saveCanvas();
    }
    
    // Parar de desenhar
    function stopDrawing() {
        isDrawing = false;
    }
    
    // Obter posição do mouse no canvas
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    
    // Adicionar imagem
    function addImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    // Adicionar imagem à lista
                    const imageId = currentImageId++;
                    images.push({
                        id: imageId,
                        img: img,
                        x: 50,
                        y: 50,
                        width: img.width > 600 ? 600 : img.width,
                        height: img.height > 400 ? 400 : img.height
                    });
                    
                    // Redesenhar canvas
                    redrawCanvas();
                    saveCanvas();
                    alert('Imagem adicionada ao storyboard!');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };
    }
    
    // Redesenhar todo o canvas
    function redrawCanvas() {
        // Limpar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar todas as imagens
        images.forEach(image => {
            ctx.drawImage(image.img, image.x, image.y, image.width, image.height);
        });
    }
    
    // Limpar canvas
    function clearCanvas() {
        if (confirm('Tem certeza que deseja limpar todo o storyboard? Isso removerá todas as imagens e desenhos.')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            images = [];
            saveCanvas();
            alert('Storyboard limpo!');
        }
    }
    
    // Exportar canvas
    function exportCanvas() {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'storyboard-' + new Date().toISOString().slice(0, 10) + '.png';
        link.href = dataURL;
        link.click();
        alert('Storyboard exportado como PNG!');
    }
    
    // Salvar canvas no localStorage
    function saveCanvas() {
        const dataURL = canvas.toDataURL();
        localStorage.setItem('scriptflow_storyboard', dataURL);
        
        // Salvar também as imagens em base64
        const imagesData = images.map(img => ({
            id: img.id,
            data: img.img.src,
            x: img.x,
            y: img.y,
            width: img.width,
            height: img.height
        }));
        localStorage.setItem('scriptflow_storyboard_images', JSON.stringify(imagesData));
    }
    
    // Carregar canvas do localStorage
    function loadCanvas() {
        const savedCanvas = localStorage.getItem('scriptflow_storyboard');
        const savedImages = localStorage.getItem('scriptflow_storyboard_images');
        
        if (savedCanvas) {
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedCanvas;
        }
        
        if (savedImages) {
            try {
                const imagesData = JSON.parse(savedImages);
                imagesData.forEach(imgData => {
                    const img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, imgData.x, imgData.y, imgData.width, imgData.height);
                    };
                    img.src = imgData.data;
                    images.push({
                        id: imgData.id,
                        img: img,
                        x: imgData.x,
                        y: imgData.y,
                        width: imgData.width,
                        height: imgData.height
                    });
                });
                currentImageId = images.length > 0 ? Math.max(...images.map(img => img.id)) + 1 : 0;
            } catch (e) {
                console.error('Erro ao carregar imagens salvas:', e);
            }
        }
        
        // Configurar estilo inicial de desenho
        updateDrawingStyle();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        setMode('draw');
    }
});

