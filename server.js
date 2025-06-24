const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

let clients = [];

app.get("/mcp", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter(client => client !== res);
  });
});

app.post("/mcp-message", (req, res) => {
  const { method, params } = req.body;

  let result;
  if (method === "tool.add") {
    const { a, b } = params;
    result = a + b;
  } else {
    return res.status(400).json({ error: "Unknown method" });
  }

  const message = `data: ${JSON.stringify({ result })}\n\n`;
  clients.forEach(client => client.write(message));

  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`MCP server with SSE running at http://localhost:${port}`);
});