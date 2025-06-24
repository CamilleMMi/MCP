const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let clients = [];

app.get("/mcp", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  res.flushHeaders();
  res.write("event: connected\ndata: MCP SSE ready\n\n");

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
});

app.post("/mcp-message", (req, res) => {
  const { method, params } = req.body;

  if (method === "tool.add") {
    const { a, b } = params;
    const result = a + b;

    const response = {
      method,
      result
    };

    const message = `data: ${JSON.stringify(response)}\n\n`;
    clients.forEach(c => c.write(message));

    return res.json({ status: "ok" });
  }

  return res.status(400).json({ error: "Unknown method" });
});

app.listen(port, () => {
  console.log(`MCP server running on port ${port}`);
});