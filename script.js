<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ScriptFlow - Plataforma de Roteiro</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: Arial, sans-serif;}
    body { background:#1c1c1c; color:#fff; }
    header { background:#111; padding:10px 20px; display:flex; justify-content:space-between; align-items:center; }
    header h1 { font-size:1.5em; color:#f39c12; }
    nav { display:flex; gap:10px; }
    nav button { background:#222; border:none; color:#fff; padding:8px 12px; cursor:pointer; border-radius:5px; }
    nav button.active { background:#f39c12; color:#111; }
    main { padding:20px; }
    .tab { display:none; }
    .tab.active { display:block; }
    textarea { width:100%; height:400px; background:#222; color:#fff; border:none; padding:10px; border-radius:5px; resize:none; font-family: monospace; }
    /* Chat Fofoca */
    #fofoca { position:fixed; bottom:20px; right:20px; width:300px; max-height:400px; background:#222; border-radius:10px; box-shadow:0 0 10px #000; display:flex; flex-direction:column; }
    #fofoca-header { padding:10px; background:#111; cursor:pointer; display:flex; justify-content:space-between; align-items:center; border-top-left-radius:10px; border-top-right-radius:10px; }
    #fofoca-body { flex:1; display:none; flex-direction:column; padding:10px; overflow-y:auto; }
    #fofoca-body textarea { height:100px; margin-top:10px; }
    /* Chamada de vídeo */
    #chama { position:fixed; bottom:20px; left:20px; width:250px; max-height:350px; background:#222; border-radius:10px; box-shadow:0 0 10px #000; display:flex; flex-direction:column; }
    #chama-header { padding:10px; background:#111; cursor:pointer; display:flex; justify-content:space-between; align-items:center; border-top-left-radius:10px; border-top-right-radius:10px; }
    #chama-body { flex:1; display:none; padding:10px; }
    #chama-body video { width:100%; border-radius:5px; background:#000; }
</style>
</head>
<body>

<header>
    <h1>ScriptFlow</h1>
    <nav>
        <button class="tab-btn active" data-tab="argumento">Argumento</button>
        <button class="tab-btn" data-tab="escaleta">Escaleta</button>
        <button class="tab-btn" data-tab="roteiro">Roteiro</button>
        <button class="tab-btn" data-tab="tratamento">Tratamento</button>
        <button class="tab-btn" data-tab="biblia">Bíblia</button>
        <button class="tab-btn" data-tab="sala">Sala de Roteiro</button>
        <button class="tab-btn" data-tab="storyboard">Storyboard</button>
    </nav>
</header>

<main>
    <div id="argumento" class="tab active">
        <textarea placeholder="Escreva o Argumento..."></textarea>
    </div>
    <div id="escaleta" class="tab">
        <textarea placeholder="Escreva a Escaleta..."></textarea>
    </div>
    <div id="roteiro" class="tab">
        <textarea placeholder="Escreva o Roteiro..."></textarea>
    </div>
    <div id="tratamento" class="tab">
        <textarea placeholder="Escreva o Tratamento..."></textarea>
    </div>
    <div id="biblia" class="tab">
        <textarea placeholder="Escreva a Bíblia do projeto..."></textarea>
    </div>
    <div id="sala" class="tab">
        <textarea placeholder="Sala de Roteiro colaborativa..."></textarea>
    </div>
    <div id="storyboard" class="tab">
        <textarea placeholder="Storyboard / Anotações visuais..."></textarea>
    </div>
</main>

<!-- Chat Fofoca -->
<div id="fofoca">
    <div id="fofoca-header"><span>Fofoca 💬</span><i class="fa fa-chevron-down"></i></div>
    <div id="fofoca-body">
        <div id="chat-log" style="flex:1; overflow-y:auto; margin-bottom:10px;"></div>
        <textarea id="chat-input" placeholder="Escreva uma mensagem..."></textarea>
        <button id="send-chat">Enviar</button>
    </div>
</div>

<!-- Chamada de vídeo -->
<div id="chama">
    <div id="chama-header"><span>Chama 📹</span><i class="fa fa-chevron-down"></i></div>
    <div id="chama-body">
        <video autoplay muted></video>
    </div>
</div>

<script>
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
        const key = 'scriptflow_'+tab.id;
        // Carregar
        ta.value = localStorage.getItem(key) || '';
        // Salvar
        ta.addEventListener('input', ()=> localStorage.setItem(key, ta.value));
    });
</script>

</body>
</html>

