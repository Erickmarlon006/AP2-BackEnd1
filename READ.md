# Dev Coffee HTTP Native

API RESTful de pedidos da cafeteria Dev Coffee, construída apenas com os módulos nativos do Node.js (sem Express e sem dependências npm). Os dados ficam em memória.

## Como executar

Pré-requisito: Node.js instalado.

```bash
npm start
```

O servidor sobe em `http://localhost:3000`.

## Modelo do pedido

```json
{ "id": 1, "client": "Erick", "item": "Cappuccino", "status": "pendente" }
```

Valores aceitos em `status`: `pendente`, `pronto`, `cancelado`.

## Endpoints

| Método | Rota | Sucesso | Erros |
|---|---|---|---|
| POST | `/orders` | 201 | 400 |
| GET | `/orders` | 200 | 400 (filtro inválido) |
| GET | `/orders/:id` | 200 | 404 |
| PATCH | `/orders/:id/status` | 200 | 400, 404 |
| DELETE | `/orders/:id` | 204 | 404 |
| qualquer outro | `/*` | - | 404 |

