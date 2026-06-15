const API_URL = "/api/pedidos";
let ocupados = [];
let carrinho = [];
let enviando = false;

const CARRINHO_STORAGE_KEY = "cangaceiros_carrinho";

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

function salvarCarrinho() {
  const dadosParaSalvar = carrinho.map(item => ({
    id: item.id,
    qtd: item.qtd
  }));
  localStorage.setItem(CARRINHO_STORAGE_KEY, JSON.stringify(dadosParaSalvar));
}

function carregarCarrinhoSalvo() {
  const salvo = localStorage.getItem(CARRINHO_STORAGE_KEY);
  if (!salvo) return;
  
  try {
    const dadosSalvos = JSON.parse(salvo);
    carrinho = [];
    dadosSalvos.forEach(itemSalvo => {
      const produtoOriginal = produtos.find(p => p.id === itemSalvo.id);
      if (produtoOriginal) {
        carrinho.push({ ...produtoOriginal, qtd: itemSalvo.qtd });
      }
    });
    atualizarCarrinho();
    renderizarProdutos();
  } catch (err) {
    console.error("Erro ao carregar carrinho salvo:", err);
  }
}

function limparCarrinhoSalvo() {
  localStorage.removeItem(CARRINHO_STORAGE_KEY);
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarProdutos();
  carregarCarrinhoSalvo();
  carregarNumeros();
  carregarNumerosNaoAtleta();
  atualizarCarrinho();
  document.getElementById("btn").addEventListener("click", enviarPedido);
  toggleAtleta();
  
  const comprovanteInput = document.getElementById("comprovante");
  if (comprovanteInput) {
    comprovanteInput.addEventListener("change", previewComprovante);
  }
});

function mostrarLoading() {
  const btn = document.getElementById("btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Enviando pedido...';
  btn.style.opacity = "0.7";
  btn.style.cursor = "not-allowed";
}

function esconderLoading() {
  const btn = document.getElementById("btn");
  btn.disabled = false;
  btn.innerHTML = 'Confirmar Pedido';
  btn.style.opacity = "1";
  btn.style.cursor = "pointer";
}

function toggleTema() {
  const html = document.documentElement;
  const temaAtual = html.getAttribute("data-theme");
  html.setAttribute("data-theme", temaAtual === "dark" ? "light" : "dark");
}

function carrinhoTemCamisa() {
  return carrinho.some(item => item.ehCamisa);
}

function toggleAtleta() {
  const souAtleta = document.getElementById("souAtleta").checked;
  const temCamisa = carrinhoTemCamisa();
  
  document.getElementById("camposAtleta").style.display = (souAtleta && temCamisa) ? "block" : "none";
  document.getElementById("camposNaoAtleta").style.display = (souAtleta && temCamisa) ? "none" : "block";
  
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
  
  validarTamanho();
}

function toggleRepetirNumero() {
  const repetir = document.getElementById("repetirNumero").checked;
  document.getElementById("avisoRepetir").style.display = repetir ? "block" : "none";
  document.getElementById("camposNumeroNovo").style.display = repetir ? "none" : "block";
}

function validarTamanho() {
  const temCamisa = carrinhoTemCamisa();
  const tamanhoSelect = document.getElementById("tamanho");
  const opcaoNaoSeAplica = Array.from(tamanhoSelect.options).find(opt => opt.value === "Não se aplica");
  
  if (opcaoNaoSeAplica) {
    if (temCamisa) {
      opcaoNaoSeAplica.style.display = "none";
      if (tamanhoSelect.value === "Não se aplica") {
        tamanhoSelect.value = "M";
      }
    } else {
      opcaoNaoSeAplica.style.display = "block";
    }
  }
}

function apenasNumeros(event) {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
    return false;
  }
  return true;
}

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

function previewComprovante(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const previewAntigo = document.querySelector(".comprovante-preview");
    if (previewAntigo) previewAntigo.remove();
    
    const previewContainer = document.createElement("div");
    previewContainer.className = "comprovante-preview";
    
    const img = document.createElement("img");
    img.src = e.target.result;
    
    const info = document.createElement("div");
    info.innerHTML = `<strong>${file.name}</strong><br>${(file.size / 1024).toFixed(1)} KB`;
    
    const removerBtn = document.createElement("button");
    removerBtn.textContent = "✕";
    removerBtn.onclick = () => {
      previewContainer.remove();
      document.getElementById("comprovante").value = "";
    };
    
    previewContainer.appendChild(img);
    previewContainer.appendChild(info);
    previewContainer.appendChild(removerBtn);
    
    document.getElementById("pixBox").appendChild(previewContainer);
  };
  reader.readAsDataURL(file);
}

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

function adicionarAoCarrinho(id) {
  const item = carrinho.find(c => c.id === id);
  if (item) {
    item.qtd++;
  } else {
    const produto = produtos.find(p => p.id === id);
    carrinho.push({ ...produto, qtd: 1 });
  }
  salvarCarrinho();
  atualizarCarrinho();
  renderizarProdutos();
  validarTamanho();
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
  salvarCarrinho();
  atualizarCarrinho();
  renderizarProdutos();
  validarTamanho();
}

function aumentarQtd(id) {
  const item = carrinho.find(c => c.id === id);
  if (item) item.qtd++;
  salvarCarrinho();
  atualizarCarrinho();
  renderizarProdutos();
  validarTamanho();
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(c => c.id !== id);
  salvarCarrinho();
  atualizarCarrinho();
  renderizarProdutos();
  validarTamanho();
}

function esvaziarCarrinho() {
  if (carrinho.length === 0) return;
  
  const modal = document.createElement("div");
  modal.className = "confirmacao-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    z-index: 350;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  `;
  
  modal.innerHTML = `
    <div style="
      background: var(--bg-card);
      border-radius: 16px;
      max-width: 400px;
      width: 90%;
      padding: 1.5rem;
      border: 1px solid var(--borda-card);
      text-align: center;
    ">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🗑️</div>
      <h3 style="margin-bottom: 0.5rem;">Esvaziar carrinho?</h3>
      <p style="color: var(--texto-claro); margin-bottom: 1.5rem;">
        Todos os ${carrinho.reduce((s, c) => s + c.qtd, 0)} itens serão removidos.
      </p>
      <div style="display: flex; gap: 1rem;">
        <button id="confirmarEsvaziarBtn" style="flex:1; background: #c44; color: white;">
          ✅ Sim, esvaziar
        </button>
        <button id="cancelarEsvaziarBtn" style="flex:1; background: var(--bg-input); color: var(--texto); border: 1px solid var(--borda);">
          ✕ Cancelar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById("confirmarEsvaziarBtn").onclick = () => {
    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();
    renderizarProdutos();
    validarTamanho();
    modal.remove();
  };
  
  document.getElementById("cancelarEsvaziarBtn").onclick = () => {
    modal.remove();
  };
  
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
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
  document.body.classList.add("checkout-aberto");
  document.getElementById("checkoutOverlay").scrollIntoView({ behavior: "smooth" });
  
  mostrarCamposCamisa(temCamisa);
  
  toggleAtleta();
  carregarNumeros();
  carregarNumerosNaoAtleta();
  validarTamanho();
}

function mostrarCamposCamisa(temCamisa) {
  const checkboxAtleta = document.getElementById("souAtleta").parentElement;
  checkboxAtleta.style.display = temCamisa ? "flex" : "none";
  
  document.getElementById("camposAtleta").style.display = temCamisa ? "block" : "none";
  document.getElementById("camposNaoAtleta").style.display = temCamisa ? "block" : "none";
  
  document.getElementById("tamanho").style.display = temCamisa ? "block" : "none";
  document.getElementById("nomeCamisa").style.display = temCamisa ? "block" : "none";
  
  const labels = document.querySelectorAll(".card > label");
  labels.forEach(label => {
    if (label.textContent.includes("Tamanho")) {
      label.style.display = temCamisa ? "block" : "none";
    }
    if (label.textContent.includes("Nome na camisa")) {
      label.style.display = temCamisa ? "block" : "none";
    }
  });
}

function voltarParaLoja() {
  document.getElementById("checkoutOverlay").style.display = "none";
  document.body.classList.remove("checkout-aberto");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function voltarParaLojaPosSucesso() {
  document.getElementById("sucessoOverlay").style.display = "none";
  document.body.classList.remove("checkout-aberto");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validarCamposObrigatorios() {
  const temCamisa = carrinhoTemCamisa();
  const souAtleta = temCamisa ? document.getElementById("souAtleta").checked : false;
  
  if (temCamisa) {
    const tamanho = document.getElementById("tamanho").value;
    if (!tamanho || tamanho === "Não se aplica") {
      return "❌ Tamanho da camisa é obrigatório.";
    }
    
    const nomeCamisa = document.getElementById("nomeCamisa").value.trim();
    if (!nomeCamisa) {
      return "❌ Nome na camisa é obrigatório.";
    }
    
    if (souAtleta) {
      const repetirNumero = document.getElementById("repetirNumero").checked;
      
      if (repetirNumero) {
        const numeroRepetir = document.getElementById("numeroRepetir").value;
        if (!numeroRepetir || numeroRepetir === "") {
          return "❌ Digite o número da sua camisa.";
        }
      } else {
        const numero = document.getElementById("numero").value;
        if (!numero || numero === "") {
          return "❌ Selecione um número para sua camisa.";
        }
        
        const categoria = document.getElementById("categoria").value;
        if (!categoria) {
          return "❌ Selecione a categoria (Masculino/Feminino).";
        }
      }
    }
  }
  
  return null;
}

async function carregarNumeros() {
  const select = document.getElementById("numero");
  try {
    const res = await fetch(API_URL);
    ocupados = await res.json();
    const categoria = document.getElementById("categoria").value;
    select.innerHTML = "";
    
    for (let i = 0; i <= 100; i++) {
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
    for (let i = 0; i <= 100; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      select.appendChild(opt);
    }
  } catch (err) {
    console.error(err);
  }
}

function trocarPagamento() {
  const tipo = document.getElementById("pagamento").value;
  document.getElementById("pixBox").style.display = tipo === "pix" ? "block" : "none";
  document.getElementById("cartaoBox").style.display = tipo === "cartao" ? "block" : "none";
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

async function enviarPedido() {
  if (enviando) {
    console.log("Já está enviando...");
    return;
  }
  
  const erroValidacao = validarCamposObrigatorios();
  if (erroValidacao) {
    const msg = document.getElementById("msg");
    msg.innerText = erroValidacao;
    msg.style.color = "#c44";
    return;
  }
  
  enviando = true;
  mostrarLoading();
  
  const msg = document.getElementById("msg");
  msg.innerText = "";
  
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
        const numRepetir = document.getElementById("numeroRepetir").value;
        if (numRepetir === "0") {
          numero = "0";
        } else {
          numero = numRepetir ? Number(numRepetir) : "";
        }
      } else {
        categoria = document.getElementById("categoria").value;
        numero = Number(document.getElementById("numero").value);
      }
    } else {
      categoria = document.getElementById("categoriaNaoAtleta").value || "Não informado";
      const numNaoAtleta = document.getElementById("numeroNaoAtleta").value;
      numero = numNaoAtleta ? Number(numNaoAtleta) : "";
    }
  } else {
    categoria = "Não se aplica";
    numero = "";
  }

  if (!nome) {
    msg.innerText = "❌ Nome é obrigatório.";
    msg.style.color = "#c44";
    enviando = false;
    esconderLoading();
    return;
  }

  if (telefone.length < 10 || telefone.length > 11) {
    msg.innerText = "❌ Telefone inválido! Digite DDD + número (ex: 81999999999)";
    msg.style.color = "#c44";
    enviando = false;
    esconderLoading();
    return;
  }

  try {
    if (pagamento === "cartao") {
      const produtosPedido = carrinho.map(c => `${c.nome} x${c.qtd}`).join(", ");
      const totalPedido = carrinho.reduce((s, c) => s + (c.preco * c.qtd), 0);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "data=" + encodeURIComponent(JSON.stringify({
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
        }))
      });

      const data = await res.json();
      
      if (data.sucesso) {
        document.getElementById("checkoutOverlay").style.display = "none";
        limparFormulario();
        esconderLoading();
        
        const mensagemWpp = `Olá! Finalizei meu pedido na Lojinha Cangaceiros e quero pagar com cartão.%0A%0A` +
          `*Nome:* ${nome}%0A` +
          `*Telefone:* ${telefone}%0A` +
          `*Produtos:* ${produtosPedido}%0A` +
          (temCamisa ? `*Tamanho:* ${tamanho}%0A` : "") +
          (temCamisa && numero !== "" && numero !== "0" ? `*Número:* ${numero}%0A` : "") +
          (temCamisa && numero === "0" ? `*Número:* 0 (Goleiro)%0A` : "") +
          (temCamisa ? `*Nome na camisa:* ${nomeCamisa || 'Não informado'}%0A` : "") +
          `*Observação:* ${observacao || 'Nenhuma'}%0A` +
          `*Total:* R$ ${totalPedido.toFixed(2)}%0A%0A` +
          `Aguardo contato para finalizar o pagamento! 🦎`;
        
        window.open(`https://wa.me/5581989413959?text=${mensagemWpp}`, "_blank");
      } else {
        msg.innerText = data.mensagem || "❌ Erro ao salvar pedido";
        msg.style.color = "#c44";
        esconderLoading();
      }
      return;
    }

    const file = document.getElementById("comprovante").files[0];
    if (!file) {
      msg.innerText = "❌ Envie o comprovante do PIX.";
      msg.style.color = "#c44";
      enviando = false;
      esconderLoading();
      return;
    }

    const comprovante = await toBase64(file);
    const produtosPedido = carrinho.map(c => `${c.nome} x${c.qtd}`).join(", ");

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "data=" + encodeURIComponent(JSON.stringify({
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
      }))
    });

    const data = await res.json();
    
    if (data.sucesso) {
      document.getElementById("checkoutOverlay").style.display = "none";
      document.getElementById("sucessoOverlay").style.display = "flex";
      limparFormulario();
      esconderLoading();
    } else {
      msg.innerText = data.mensagem || "❌ Erro no pedido";
      msg.style.color = "#c44";
      esconderLoading();
    }
    
  } catch (err) {
    console.error("Erro ao enviar:", err);
    msg.innerText = "❌ Erro ao enviar pedido";
    msg.style.color = "#c44";
    esconderLoading();
  } finally {
    enviando = false;
  }
}

function limparFormulario() {
  carrinho = [];
  limparCarrinhoSalvo();
  atualizarCarrinho();
  renderizarProdutos();
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("nomeCamisa").value = "";
  document.getElementById("observacao").value = "";
  document.getElementById("comprovante").value = "";
  
  const preview = document.querySelector(".comprovante-preview");
  if (preview) preview.remove();
  
  carregarNumeros();
  carregarNumerosNaoAtleta();
}
