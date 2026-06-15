export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = process.env.API_CANGACEIROS;

  if (!url) {
    return res.status(500).json({ sucesso: false, mensagem: "API não configurada" });
  }

  try {
    if (req.method === "GET") {
      const resposta = await fetch(url);
      const texto = await resposta.text();
      return res.status(200).setHeader("Content-Type", "application/json").send(texto);
    }

    if (req.method === "POST") {
      // Pega o body bruto como veio do frontend
      let bodyString;
      
      if (typeof req.body === 'string') {
        bodyString = req.body;
      } else if (req.body && typeof req.body === 'object') {
        // Reconstrói a string no formato que o Apps Script espera
        bodyString = Object.keys(req.body).map(key => 
          `${key}=${encodeURIComponent(req.body[key])}`
        ).join('&');
      } else {
        bodyString = '';
      }
      
      console.log("Body recebido:", bodyString);

      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyString
      });

      const texto = await resposta.text();
      console.log("Resposta:", texto);

      return res.status(200).setHeader("Content-Type", "application/json").send(texto);
    }

    return res.status(405).json({ erro: "Método não permitido" });

  } catch (erro) {
    console.error("Erro:", erro);
    return res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
}