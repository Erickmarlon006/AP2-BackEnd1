const http = require("node:http");

const PORT = 3000;
const STATUS_VALIDOS = ["pendente", "pronto", "cancelado"];

const orders = []; // "banco de dados" em memória
let proximoId = 1;

// Envia resposta JSON (com o Content-Type exigido); sem dados, envia só o status (204)
function responder(res, statusCode, dados) {
  if (dados === undefined) {
    res.writeHead(statusCode);
    return res.end();
  }
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(dados));
}

// Lê o body pelos eventos do stream. Retorna o objeto ou null se o JSON for inválido.
function lerBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.setEncoding("utf-8"); // evita quebrar acentos entre chunks
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(null); // JSON malformado não derruba o servidor
      }
    });
  });
}

const textoValido = (valor) => typeof valor === "string" && valor.trim() !== "";

const server = http.createServer(async (req, res) => {
  try {
    const [caminho, query] = req.url.split("?"); 
    const partes = caminho.split("/").filter(Boolean); 
    const metodo = req.method;
    const order = orders.find((o) => o.id === Number(partes[1]));

    if (partes[0] === "orders") {
      // GET /orders (aceita ?status=)
      if (metodo === "GET" && partes.length === 1) {
        const filtro = new URLSearchParams(query).get("status");
        if (filtro === null) return responder(res, 200, orders);
        if (!STATUS_VALIDOS.includes(filtro))
          return responder(res, 400, { error: "Status inválido" });
        return responder(
          res,
          200,
          orders.filter((o) => o.status === filtro),
        );
      }

      // POST /orders
      if (metodo === "POST" && partes.length === 1) {
        const dados = await lerBody(req);
        if (!dados || !textoValido(dados.client) || !textoValido(dados.item)) {
          return responder(res, 400, {
            error: "Envie 'client' e 'item' como texto em um JSON válido",
          });
        }
        const novo = {
          id: proximoId++,
          client: dados.client.trim(),
          item: dados.item.trim(),
          status: "pendente",
        };
        orders.push(novo);
        return responder(res, 201, novo);
      }

      // GET /orders/:id
      if (metodo === "GET" && partes.length === 2 && order) {
        return responder(res, 200, order);
      }

      // DELETE /orders/:id
      if (metodo === "DELETE" && partes.length === 2 && order) {
        orders.splice(orders.indexOf(order), 1);
        return responder(res, 204);
      }

      // PATCH /orders/:id/status
      if (
        metodo === "PATCH" &&
        partes.length === 3 &&
        partes[2] === "status" &&
        order
      ) {
        const dados = await lerBody(req);
        if (!dados || !STATUS_VALIDOS.includes(dados.status)) {
          return responder(res, 400, {
            error: `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}`,
          });
        }
        order.status = dados.status;
        return responder(res, 200, order);
      }
    }

    // Qualquer outra rota, verbo ou pedido inexistente
    responder(res, 404, { error: `Não encontrado: ${metodo} ${caminho}` });
  } catch (err) {
    console.error(err);
    responder(res, 500, { error: "Erro interno do servidor" });
  }
});

server.listen(PORT, () => {
  console.log(`Dev Coffee API rodando em http://localhost:${PORT}`);
});
