const API_URL = "https://script.google.com/macros/s/AKfycbwD-oxumRBcYtbmSBCT4cGiMohyv97r6fTLOyviuRTw91rOg7tDxKu1QKwJqDX8Qmo9Sg/exec";

let ocupados = [];
let carrinho = [];

// Catálogo de produtos
const produtos = [
   { id: "kit-atleta", nome: "Kit Atleta", preco: 150, img: "img/kit-atleta.jpg", desc: "Kit exclusivo para atletas", ehCamisa: true },
  { id: "camisa-jogador", nome: "Camisa Jogador", preco: 95, img: "img/camisa-jogador.jpg", desc: "Camisa oficial de jogo", ehCamisa: true },
  { id: "camisa-goleiro", nome: "Camisa Goleiro", preco: 95, img: "img/camisa-goleiro.jpg", desc: "Camisa exclusiva para goleiros", ehCamisa: true },
  { id: "kit", nome: "Kit Caneca + Tirante", preco: 40, img: "img/kit.jpg", desc: "Kit completo de acessórios", ehCamisa: false },
  { id: "bandana-preta", nome: "Bandana Preta", preco: 25, img: "img/bandana-preta.jpg", desc: "Bandana preta oficial", ehCamisa: false },
  { id: "bandana-laranja", nome: "Bandana Laranja", preco: 25, img: "img/bandana-laranja.jpg", desc: "Bandana laranja oficial", ehCamisa: false },
  { id: "tirante", nome: "Tirante", preco: 15, img: "img/tirante.jpg", desc: "Tirante para canecas", ehCamisa: false },
  { id: "bucket", nome: "Bucket", preco: 30, img: "img/bucket.jpg", desc: "Bucket personalizado", ehCamisa: false }
];

/* ========== INIT ========== */
document.addEventListener("DOMContentLoaded", () => {
  renderizarProdutos();
  carregarNumeros();
  carregarNumerosNaoAtleta();
  atualizarCarrinho();
  document.getElementById("btn").addEventListener("click", enviarPedido);
  toggleAtleta();
});

/* ========== TEMA ========== */
function toggleTema() {
  const html = document.documentElement;
  const temaAtual = html.getAttribute("data-theme");
  html.setAttribute("data-theme", temaAtual === "dark" ? "light" : "dark");
}

/* ========== VERIFICA SE O CARRINHO TEM CAMISA ========== */
function carrinhoTemCamisa() {
  return carrinho.some(item => item.ehCamisa);
}

/* ========== TOGGLE ATLETA ========== */
function toggleAtleta() {
  const souAtleta = document.getElementById("souAtleta").checked;
  const temCamisa = carrinhoTemCamisa();
  
  // Só mostra campos de atleta se tiver camisa no carrinho
  document.getElementById("camposAtleta").style.display = (souAtleta && temCamisa) ? "block" : "none";
  document.getElementById("camposNaoAtleta").style.display = (souAtleta && temCamisa) ? "none" : "block";
  
  // Se não tem camisa, esconde tudo relacionado a camisa
  if (!temCamisa) {
    document.getElementById("camposAtleta").style.display = "none";
    document.getElementById("camposNaoAtleta").style.display = "none";
    document.getElementById("souAtleta").parentElement.style.display = "none";
  } else {
    document.getElementById("souAtleta").parentElement.style.display = "flex";
  }
  
  if (!souAtleta) {
    document.getElementById("repetirNumero").checked = false;
    toggleRepetirNumero();
  }
}

function toggleRepetirNumero() {
  const repetir = document.getElementById("repetirNumero").checked;
  document.getElementById("avisoRepetir").style.display = repetir ? "block" : "none";
  document.getElementById("camposNumeroNovo").style.display = repetir ? "none" : "block";
}

/* ========== COPIAR PIX ========== */
function copiarPix() {
  const codigo = document.getElementById("pixCodigo").textContent;
  
  navigator.clipboard.writeText(codigo).then(() => {
    const btn = document.querySelector(".btn-copiar");
    btn.textContent = "✅ Copiado!";
    btn.classList.add("copiado");
    setTimeout(() => {
      btn.textContent = "📋 Copiar";
      btn.classList.remove("copiado");
    }, 2000);
  }).catch(() => {
    const textArea = document.createElement("textarea");
    textArea.value = codigo;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    
    const btn = document.querySelector(".btn-copiar");
    btn.textContent = "✅ Copiado!";
    btn.classList.add("copiado");
    setTimeout(() => {
      btn.textContent = "📋 Copiar";
      btn.classList.remove("copiado");
    }, 2000);
  });
}

/* ========== RENDERIZAR PRODUTOS ========== */
function renderizarProdutos() {
  const grid = document.getElementById("produtosGrid");
  grid.innerHTML = "";

  produtos.forEach((produto) => {
    const card = document.createElement("div");
    card.className = "produto-card";
    card.onclick = (e) => {
      if (!e.target.closest("button")) {
        adicionarAoCarrinho(produto.id);
      }
    };

    const itemCarrinho = carrinho.find(c => c.id === produto.id);
    const qtd = itemCarrinho ? itemCarrinho.qtd : 0;

    card.innerHTML = `
      <div class="produto-imagem-wrapper">
        <img src="${produto.img}" alt="${produto.nome}" class="produto-imagem" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
        <div class="produto-imagem-placeholder" style="display:none;">📸</div>
      </div>
      <div class="produto-info">
        <h3 class="produto-nome">${produto.nome}</h3>
        <p class="produto-descricao">${produto.desc}</p>
        <span class="produto-preco">R$ ${produto.preco.toFixed(2)}</span>
        <div class="produto-botoes">
          ${qtd > 0 ? `
            <div class="qtd-controle" onclick="event.stopPropagation()">
              <button class="qtd-btn" onclick="diminuirQtd('${produto.id}')">−</button>
              <span class="qtd-valor">${qtd}</span>
              <button class="qtd-btn" onclick="aumentarQtd('${produto.id}')">+</button>
            </div>
            <button class="btn-adicionar remover" onclick="event.stopPropagation(); removerDoCarrinho('${produto.id}')">🗑</button>
          ` : `
            <button class="btn-adicionar" onclick="event.stopPropagation(); adicionarAoCarrinho('${produto.id}')">
              🛒 Adicionar
            </button>
          `}
        </div>
      </div>
    `;

    if (qtd > 0) card.classList.add("selecionado");
    grid.appendChild(card);
  });
}

/* ========== CARRINHO ========== */
function adicionarAoCarrinho(id) {
  const item = carrinho.find(c => c.id === id);
  if (item) {
    item.qtd++;
  } else {
    const produto = produtos.find(p => p.id === id);
    carrinho.push({ ...produto, qtd: 1 });
  }
  atualizarCarrinho();
  renderizarProdutos();
}

function diminuirQtd(id) {
  const item = carrinho.find(c => c.id === id);
  if (item) {
    item.qtd--;
    if (item.qtd <= 0) {
      removerDoCarrinho(id);
      return;
    }
  }
  atualizarCarrinho();
  renderizarProdutos();
}

function aumentarQtd(id) {
  const item = carrinho.find(c => c.id === id);
  if (item) item.qtd++;
  atualizarCarrinho();
  renderizarProdutos();
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(c => c.id !== id);
  atualizarCarrinho();
  renderizarProdutos();
}

function atualizarCarrinho() {
  const badge = document.getElementById("carrinhoBadge");
  const painel = document.getElementById("carrinhoPainel");
  const itensContainer = document.getElementById("carrinhoItens");
  const resumo = document.getElementById("carrinhoResumo");
  const subtotalEl = document.getElementById("subtotal");
  const totalFinalEl = document.getElementById("totalFinal");

  const totalItens = carrinho.reduce((s, c) => s + c.qtd, 0);
  const subtotal = carrinho.reduce((s, c) => s + (c.preco * c.qtd), 0);

  badge.textContent = totalItens;

  if (carrinho.length === 0) {
    painel.classList.remove("ativo");
  } else {
    painel.classList.add("ativo");
  }

  itensContainer.innerHTML = "";
  if (carrinho.length === 0) {
    itensContainer.innerHTML = '<p class="carrinho-vazio">Nenhum item adicionado ainda</p>';
    resumo.style.display = "none";
  } else {
    carrinho.forEach(item => {
      const div = document.createElement("div");
      div.className = "carrinho-item";
      div.innerHTML = `
        <img src="${item.img}" alt="${item.nome}" class="carrinho-item-img" onerror="this.style.display='none'"/>
        <div class="carrinho-item-info">
          <p class="carrinho-item-nome">${item.nome}</p>
          <p class="carrinho-item-preco">R$ ${(item.preco * item.qtd).toFixed(2)}</p>
          <p class="carrinho-item-qtd">Qtd: ${item.qtd}</p>
        </div>
        <button class="carrinho-item-remover" onclick="removerDoCarrinho('${item.id}')">✕</button>
      `;
      itensContainer.appendChild(div);
    });
    resumo.style.display = "block";
    subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
    totalFinalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
  }
}

function abrirCarrinho() {
  const painel = document.getElementById("carrinhoPainel");
  if (painel.classList.contains("ativo")) {
    painel.scrollIntoView({ behavior: "smooth" });
  }
}

function fecharCarrinho() {}

/* ========== CHECKOUT ========== */
function irParaCheckout() {
  if (carrinho.length === 0) return;

  const checkoutResumo = document.getElementById("checkoutResumo");
  const subtotal = carrinho.reduce((s, c) => s + (c.preco * c.qtd), 0);
  const temCamisa = carrinhoTemCamisa();

  checkoutResumo.innerHTML = carrinho.map(c => `
    <div class="checkout-item-resumo">
      <span>${c.nome} x${c.qtd}</span>
      <span>R$ ${(c.preco * c.qtd).toFixed(2)}</span>
    </div>
  `).join("") + `
    <div class="checkout-total-resumo">
      <span>Total</span>
      <span>R$ ${subtotal.toFixed(2)}</span>
    </div>
  `;

  document.getElementById("checkoutOverlay").style.display = "block";
  document.getElementById("checkoutOverlay").scrollIntoView({ behavior: "smooth" });
  
  // Mostra/esconde campos baseado se tem camisa
  mostrarCamposCamisa(temCamisa);
  
  toggleAtleta();
  carregarNumeros();
  carregarNumerosNaoAtleta();
}

function mostrarCamposCamisa(temCamisa) {
  const camposCamisa = [
    "souAtleta",
    "camposAtleta",
    "camposNaoAtleta",
    "tamanho",
    "nomeCamisa"
  ];
  
  // Checkbox de atleta
  const checkboxAtleta = document.getElementById("souAtleta").parentElement;
  checkboxAtleta.style.display = temCamisa ? "flex" : "none";
  
  // Campos de atleta/não atleta
  document.getElementById("camposAtleta").style.display = temCamisa ? "block" : "none";
  document.getElementById("camposNaoAtleta").style.display = temCamisa ? "block" : "none";
  
  // Label e select de tamanho
  const labelTamanho = document.querySelector("label[for='tamanho']") || document.getElementById("tamanho").previousElementSibling;
  if (labelTamanho) labelTamanho.style.display = temCamisa ? "block" : "none";
  document.getElementById("tamanho").style.display = temCamisa ? "block" : "none";
  document.getElementById("tamanho").parentElement.querySelector("label").style.display = temCamisa ? "block" : "none";
  
  // Label e input de nome na camisa
  const labelNomeCamisa = document.querySelector("label[for='nomeCamisa']") || document.getElementById("nomeCamisa").previousElementSibling;
  if (labelNomeCamisa) labelNomeCamisa.style.display = temCamisa ? "block" : "none";
  document.getElementById("nomeCamisa").style.display = temCamisa ? "block" : "none";
  
  // Ajusta labels anteriores
  const labels = document.querySelectorAll(".card > label");
  labels.forEach(label => {
    const input = label.nextElementSibling;
    if (input && input.id === "tamanho") {
      label.style.display = temCamisa ? "block" : "none";
    }
    if (input && input.id === "nomeCamisa") {
      label.style.display = temCamisa ? "block" : "none";
    }
  });
}

function voltarParaLoja() {
  document.getElementById("checkoutOverlay").style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function voltarParaLojaPosSucesso() {
  document.getElementById("sucessoOverlay").style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ========== NÚMEROS ========== */
async function carregarNumeros() {
  const select = document.getElementById("numero");
  try {
    const res = await fetch(API_URL);
    ocupados = await res.json();
    const categoria = document.getElementById("categoria").value;
    select.innerHTML = "";
    
    for (let i = 1; i <= 100; i++) {
      const chave = categoria + "-" + i;
      const ocupado = ocupados.includes(chave);
      
      const opt = document.createElement("option");
      opt.value = i;
      
      if (ocupado) {
        opt.textContent = i + " (já em uso)";
        opt.disabled = true;
        opt.style.color = "#999";
        opt.style.backgroundColor = "transparent";
      } else {
        opt.textContent = i;
      }
      
      select.appendChild(opt);
    }
  } catch (err) {
    console.error(err);
    select.innerHTML = "<option>Erro ao carregar</option>";
  }
}

async function carregarNumerosNaoAtleta() {
  const select = document.getElementById("numeroNaoAtleta");
  try {
    const res = await fetch(API_URL);
    const todosOcupados = await res.json();
    select.innerHTML = '<option value="">Não se aplica</option>';
    for (let i = 1; i <= 100; i++) {
      const chaveM = "M-" + i;
      const chaveF = "F-" + i;
      const ocupado = todosOcupados.includes(chaveM) || todosOcupados.includes(chaveF);
      const opt = document.createElement("option");
      opt.value = i;
      
      if (ocupado) {
        opt.textContent = i + " (já em uso)";
        opt.disabled = true;
        opt.style.color = "#999";
      } else {
        opt.textContent = i;
      }
      
      select.appendChild(opt);
    }
  } catch (err) {
    console.error(err);
  }
}

/* ========== PAGAMENTO ========== */
function trocarPagamento() {
  const tipo = document.getElementById("pagamento").value;
  document.getElementById("pixBox").style.display = tipo === "pix" ? "block" : "none";
  document.getElementById("cartaoBox").style.display = tipo === "cartao" ? "block" : "none";
}

/* ========== ENVIAR PEDIDO ========== */
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

async function enviarPedido() {
  const msg = document.getElementById("msg");
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const temCamisa = carrinhoTemCamisa();
  const souAtleta = temCamisa ? document.getElementById("souAtleta").checked : false;
  const repetirNumero = temCamisa ? document.getElementById("repetirNumero").checked : false;
  const nomeCamisa = temCamisa ? document.getElementById("nomeCamisa").value.trim() : "";
  const tamanho = temCamisa ? document.getElementById("tamanho").value : "Não se aplica";
  const observacao = document.getElementById("observacao").value.trim();
  const pagamento = document.getElementById("pagamento").value;

  let categoria, numero;
  
  if (temCamisa) {
    if (souAtleta) {
      if (repetirNumero) {
        categoria = document.getElementById("categoria").value;
        numero = Number(document.getElementById("numeroRepetir").value);
      } else {
        categoria = document.getElementById("categoria").value;
        numero = Number(document.getElementById("numero").value);
      }
    } else {
      categoria = document.getElementById("categoriaNaoAtleta").value || "Não informado";
      const numNaoAtleta = document.getElementById("numeroNaoAtleta").value;
      numero = numNaoAtleta || 0;
    }
  } else {
    categoria = "Não se aplica";
    numero = 0;
  }

  if (!nome || !telefone) {
    msg.innerText = "❌ Nome e telefone são obrigatórios.";
    msg.style.color = "#c44";
    return;
  }

  if (carrinho.length === 0) {
    msg.innerText = "❌ Seu carrinho está vazio.";
    msg.style.color = "#c44";
    return;
  }

  // Se for cartão, salva o pedido e redireciona para WhatsApp
  if (pagamento === "cartao") {
    const produtosPedido = carrinho.map(c => `${c.nome} x${c.qtd}`).join(", ");
    const totalPedido = carrinho.reduce((s, c) => s + (c.preco * c.qtd), 0);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          nome,
          telefone,
          categoria,
          tipoCamisa: "",
          nomeCamisa,
          produto: produtosPedido,
          tamanho,
          numero,
          tirantesExtras: "0",
          pagamento: "Cartão",
          comprovante: "",
          souAtleta,
          repetirNumero,
          observacao
        })
      });

      const data = await res.json();
      if (data.sucesso) {
        document.getElementById("checkoutOverlay").style.display = "none";
        
        msg.innerText = "";
        carrinho = [];
        atualizarCarrinho();
        renderizarProdutos();
        document.getElementById("nome").value = "";
        document.getElementById("telefone").value = "";
        document.getElementById("nomeCamisa").value = "";
        document.getElementById("observacao").value = "";
        
        const mensagemWpp = `Olá! Finalizei meu pedido na Lojinha Cangaceiros e quero pagar com cartão.%0A%0A` +
          `*Nome:* ${nome}%0A` +
          `*Telefone:* ${telefone}%0A` +
          `*Produtos:* ${produtosPedido}%0A` +
          (temCamisa ? `*Tamanho:* ${tamanho}%0A` : "") +
          (temCamisa ? `*Número:* ${numero !== 0 ? numero : 'Não se aplica'}%0A` : "") +
          (temCamisa ? `*Nome na camisa:* ${nomeCamisa || 'Não informado'}%0A` : "") +
          `*Observação:* ${observacao || 'Nenhuma'}%0A` +
          `*Total:* R$ ${totalPedido.toFixed(2)}%0A%0A` +
          `Aguardo contato para finalizar o pagamento! 🦎`;
        
        window.open(`https://wa.me/5581989413959?text=${mensagemWpp}`, "_blank");
      } else {
        msg.innerText = data.mensagem || "❌ Erro ao salvar pedido";
        msg.style.color = "#c44";
      }
    } catch (err) {
      console.error(err);
      msg.innerText = "❌ Erro ao enviar pedido";
      msg.style.color = "#c44";
    }
    return;
  }

  // Pagamento via PIX
  const file = document.getElementById("comprovante").files[0];
  if (pagamento === "pix" && !file) {
    msg.innerText = "❌ Envie o comprovante do PIX.";
    msg.style.color = "#c44";
    return;
  }

  let comprovante = "";
  if (file) comprovante = await toBase64(file);

  const produtosPedido = carrinho.map(c => `${c.nome} x${c.qtd}`).join(", ");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        nome,
        telefone,
        categoria,
        tipoCamisa: "",
        nomeCamisa,
        produto: produtosPedido,
        tamanho,
        numero,
        tirantesExtras: "0",
        pagamento,
        comprovante,
        souAtleta,
        repetirNumero,
        observacao
      })
    });

    const data = await res.json();
    if (data.sucesso) {
      document.getElementById("checkoutOverlay").style.display = "none";
      document.getElementById("sucessoOverlay").style.display = "flex";
      
      msg.innerText = "";
      carrinho = [];
      atualizarCarrinho();
      renderizarProdutos();
      document.getElementById("nome").value = "";
      document.getElementById("telefone").value = "";
      document.getElementById("nomeCamisa").value = "";
      document.getElementById("observacao").value = "";
      document.getElementById("comprovante").value = "";
      carregarNumeros();
      carregarNumerosNaoAtleta();
    } else {
      msg.innerText = data.mensagem || "❌ Erro no pedido";
      msg.style.color = "#c44";
    }
  } catch (err) {
    console.error(err);
    msg.innerText = "❌ Erro ao enviar pedido";
    msg.style.color = "#c44";
  }
}