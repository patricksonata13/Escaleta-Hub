// Alternar abas
function openTab(evt, tabId) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
}

// Inserir elementos no editor
function insertElement(type) {
  const editor = document.getElementById('editor');
  let el = document.createElement('div');
  switch(type) {
    case 'scene': el.className='scene-heading'; el.textContent='INT. LOCAL - DIA'; break;
    case 'character': el.className='character'; el.textContent='PERSONAGEM'; break;
    case 'dialogue': el.className='dialogue'; el.textContent='Fala do personagem'; break;
    case 'action': el.className='action'; el.textContent='Descrição da ação'; break;
    case 'transition': el.className='transition'; el.textContent='CORTE PARA:'; break;
  }
  editor.appendChild(el);
  el.focus();
}

// Salvar e carregar (localStorage)
function saveText() {
  localStorage.setItem("roteiro", document.getElementById("editor").innerHTML);
  alert("Roteiro salvo!");
}
function loadText() {
  const saved = localStorage.getItem("roteiro");
  if (saved) document.getElementById("editor").innerHTML = saved;
  else alert("Nenhum roteiro salvo!");
}

// Exportar FDX
function exportFDX() {
  const roteiro = document.getElementById("editor").innerText.split("\n");
  let fdx = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Version="1">
  <Content>\n`;

  roteiro.forEach(line => {
    if (line.trim()==="") fdx+=`<Paragraph Type="Action"></Paragraph>\n`;
    else if (line.startsWith("INT.")||line.startsWith("EXT.")) fdx+=`<Paragraph Type="Scene Heading"><Text>${line}</Text></Paragraph>\n`;
    else if (line===line.toUpperCase()) fdx+=`<Paragraph Type="Character"><Text>${line}</Text></Paragraph>\n`;
    else if (line.endsWith(":")) fdx+=`<Paragraph Type="Transition"><Text>${line}</Text></Paragraph>\n`;
    else fdx+=`<Paragraph Type="Action"><Text>${line}</Text></Paragraph>\n`;
  });

  fdx+=`</Content></FinalDraft>`;
  const blob=new Blob([fdx],{type:"application/xml"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="roteiro.fdx";
  link.click();
}

// Exportar PDF
async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("courier","normal");
  const text = document.getElementById("editor").innerText;
  doc.text(text, 10, 10);
  doc.save("roteiro.pdf");
}

// Storyboard
function addStoryboard() {
  const sb = document.getElementById("storyboard");
  const card=document.createElement("div");
  card.className="storyboard-card";
  card.innerHTML=`
    <input type="file" accept="image/*" onchange="previewImage(event,this)">
    <img style="display:none">
    <textarea placeholder="Descrição da cena"></textarea>`;
  sb.appendChild(card);
}
function previewImage(event,input) {
  const img=input.nextElementSibling;
  const file=event.target.files[0];
  if(file){
    img.src=URL.createObjectURL(file);
    img.style.display="block";
  }
}
function showHelp(){alert("Bem-vindo ao ScriptFlow! Use os botões para inserir elementos e exportar seu roteiro.");}
