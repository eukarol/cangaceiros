export default async function handler(req, res) {
  const url = process.env.API_CANGACEIROS;

  if (!url) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "API_CANGACEIROS não configurada"
    });
  }

  try {
    if (req.method === "GET") {
      // Para GET, apenas redireciona
      const resposta = await fetch(url);
      const texto = await resposta.text();
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(texto);
    }

    // Para POST, envia os dados corretamente
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    
    console.log("Enviando para Apps Script:", body);

    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    });

    const texto = await resposta.text();
    console.log("Resposta Apps Script:", texto);

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(texto);

  } catch (erro) {
    console.error("Erro no proxy:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: erro.message
    });
  }
}