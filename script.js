// Salvar no localStorage do navegador
function saveText() {
  const text = document.getElementById("editor").innerHTML;
  localStorage.setItem("roteiro", text);
  alert("✅ Roteiro salvo localmente!");
}

// Carregar do localStorage
function loadText() {
  const saved = localStorage.getItem("roteiro");
  if (saved) {
    document.getElementById("editor").innerHTML = saved;
    alert("📂 Roteiro carregado!");
  } else {
    alert("Nenhum roteiro salvo ainda.");
  }
}

// Exportar para PDF
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const roteiro = document.getElementById("editor").innerText;

  doc.setFont("courier", "normal");
  doc.setFontSize(12);

  const marginLeft = 80;
  const marginTop = 60;
  const lineHeight = 20;
  let y = marginTop;

  roteiro.split("\n").forEach(line => {
    if (y > 700) { // Nova página se chegar no final
      doc.addPage();
      y = marginTop;
    }
    
    if (line.trim() === "") {
      y += lineHeight;
    } else {
      doc.text(line, marginLeft, y);
      y += lineHeight;
    }
  });

  doc.save("roteiro_scriptflow.pdf");
}

// Exportar para FDX (Final Draft) - SIMPLIFICADO
function exportFDX() {
  const content = document.getElementById("editor").innerText;
  const lines = content.split('\n');
  
  let fdxContent = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft documentType="Script" template="No" version="1">
  <Content>`;

  lines.forEach(line => {
    if (line.trim() === '') return;
    
    // Detectar tipo de elemento (simplificado)
    if (line.toUpperCase() === line && line.trim().length > 0) {
      fdxContent += `\n    <Paragraph Type="Scene Heading">\n      <Text>${line.trim()}</Text>\n    </Paragraph>`;
    } else if (line.trim().length < 30 && line === line.toUpperCase()) {
      fdxContent += `\n    <Paragraph Type="Character">\n      <Text>${line.trim()}</Text>\n    </Paragraph>`;
    } else {
      fdxContent += `\n    <Paragraph Type="Action">\n      <Text>${line.trim()}</Text>\n    </Paragraph>`;
    }
  });

  fdxContent += '\n  </Content>\n</FinalDraft>';

  // Criar download do arquivo
  const blob = new Blob([fdxContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'roteiro.fdx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Adicionar formatação de roteiro
function formatText(type) {
  const editor = document.getElementById("editor");
  const selection = window.getSelection();
  
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    let formattedText = selectedText;
    
    switch(type) {
      case 'cena':
        formattedText = `<div class="cena-heading">${selectedText.toUpperCase()}</div>`;
        break;
      case 'acao':
        formattedText = `<div class="acao">${selectedText}</div>`;
        break;
      case 'personagem':
        formattedText = `<div class="personagem">${selectedText.toUpperCase()}</div>`;
        break;
      case 'dialogo':
        formattedText = `<div class="dialogo">${selectedText}</div>`;
        break;
    }
    
    editor.innerHTML = editor.innerHTML.replace(selectedText, formattedText);
  }
}

// Carregar dados ao iniciar a página
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se há roteiro salvo
  const saved = localStorage.getItem("roteiro");
  if (saved) {
    document.getElementById("editor").innerHTML = saved;
  }
});
