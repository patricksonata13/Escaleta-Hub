// Alternar abas
function openTab(evt, tabId) {
  const contents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < contents.length; i++) {
    contents[i].classList.remove("active");
  }
  const tabs = document.querySelectorAll(".tabs button");
  tabs.forEach(btn => btn.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
}

// Inserir elementos no editor
function insertElement(type) {
  const editor = document.getElementById("editor");
  let el = document.createElement("div");

  switch (type) {
    case "scene":
      el.className = "scene-heading";
      el.textContent = "INT. LOCAL - DIA";
      break;
    case "character":
      el.className = "character";
      el.textContent = "NOME DO PERSONAGEM";
      break;
    case "dialogue":
      el.className = "dialogue";
      el.textContent = "Texto do diálogo...";
      break;
    case "action":
      el.className = "action";
      el.textContent = "Descrição da ação...";
      break;
    case "transition":
      el.className = "transition";
      el.textContent = "CORTE PARA:";
      break;
  }
  editor.appendChild(el);
}

// Salvar no navegador
function saveText() {
  localStorage.setItem("roteiro", document.getElementById("editor").innerHTML);
  alert("Roteiro salvo no navegador!");
}

// Carregar do navegador
function loadText() {
  const content = localStorage.getItem("roteiro");
  if (content) {
    document.getElementById("editor").innerHTML = content;
    alert("Roteiro carregado!");
  } else {
    alert("Nenhum roteiro salvo ainda.");
  }
}

// Mostrar ajuda
function showHelp() {
  alert("Use os botões para inserir elementos de roteiro. Salve seu trabalho e exporte para PDF ou FDX.");
}

// Exportar para PDF
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("Courier", "normal");
  doc.setFontSize(12);
  doc.text(document.getElementById("editor").innerText, 10, 10);
  doc.save("roteiro.pdf");
}

// Exportar para Final Draft (.fdx)
function exportFDX() {
  const texto = document.getElementById("editor").innerText.split("\n");
  let fdxContent = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>\n`;

  texto.forEach(line => {
    if (line.toUpperCase().startsWith("INT.") || line.toUpperCase().startsWith("EXT.")) {
      fdxContent += `<Paragraph Type="Scene Heading"><Text>${line}</Text></Paragraph>\n`;
    } else if (line === line.toUpperCase() && line.length > 2) {
      fdxContent += `<Paragraph Type="Character"><Text>${line}</Text></Paragraph>\n`;
    } else {
      fdxContent += `<Paragraph Type="Action"><Text>${line}</Text></Paragraph>\n`;
    }
  });

  fdxContent += "  </Content>\n</FinalDraft>";

  const blob = new Blob([fdxContent], { type: "application/xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "roteiro.fdx";
  link.click();
}

// Adicionar storyboard
function addStoryboard() {
  const container = document.getElementById("storyboard");
  const card = document.createElement("div");
  card.className = "storyboard-card";

  const img = document.createElement("input");
  img.type = "file";
  img.accept = "image/*";
  img.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        const imageEl = document.createElement("img");
        imageEl.src = ev.target.result;
        card.insertBefore(imageEl, textarea);
        img.remove();
      };
      reader.readAsDataURL(file);
    }
  };

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Descrição da cena...";

  card.appendChild(img);
  card.appendChild(textarea);
  container.appendChild(card);
}

