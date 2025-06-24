const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const clients = [];

app.get("/mcp", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`event: connected\ndata: MCP SSE ready\n\n`);

  const client = res;
  clients.push(client);

  req.on("close", () => {
    const index = clients.indexOf(client);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

app.post("/mcp-message", (req, res) => {
  const { method, params } = req.body;

  if (method === "tool.add") {
    const { a, b } = params;
    const result = a + b;

    const message = {
      method,
      result
    };

    clients.forEach(client => {
      client.write(`data: ${JSON.stringify(message)}\n\n`);
    });

    return res.json({ status: "ok" });
  }

  return res.status(400).json({ error: "Unknown method" });
});

app.listen(port, () => {
  console.log(`MCP server running at http://localhost:${port}`);
});