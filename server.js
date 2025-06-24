const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const clients = new Map();

const tools = {
  add: {
    description: "Add two numbers",
    parameters: { a: "number", b: "number" },
    handler: ({ a, b }) => ({ result: a + b }),
  },
  hello: {
    description: "Say hello",
    parameters: {},
    handler: () => ({ result: "Hello World" }),
  },
};

app.get("/mcp", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  const clientId = randomUUID();
  clients.set(clientId, res);

  console.log(`[SSE] Client connected: ${clientId}`);
  res.write(`event: connected\ndata: MCP SSE ready\n\n`);

  req.on("close", () => {
    clients.delete(clientId);
    console.log(`[SSE] Client disconnected: ${clientId}`);
  });
});

app.post("/mcp-message", (req, res) => {
  const { method, params } = req.body;

  console.log(`[POST] Received message: ${JSON.stringify(req.body)}`);

  if (method === "tool.add") {
    const result = tools.add.handler(params);
    broadcast({ type: "result", method, result });
    return res.json({ status: "ok" });
  }

  if (method === "tool.hello") {
    const result = tools.hello.handler();
    broadcast({ type: "result", method, result });
    return res.json({ status: "ok" });
  }

  if (method === "listTools") {
    const result = Object.keys(tools).map((name) => ({
      name,
      description: tools[name].description,
      parameters: tools[name].parameters,
    }));
    broadcast({ type: "result", method, result });
    return res.json({ status: "ok" });
  }

  return res.status(400).json({ error: "Unknown method" });
});

function broadcast(message) {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  for (const [id, res] of clients.entries()) {
    try {
      res.write(data);
      console.log(`[SSE] Sent to ${id}: ${data}`);
    } catch (e) {
      console.error(`[SSE] Error sending to ${id}: ${e.message}`);
      clients.delete(id);
    }
  }
}

app.listen(port, () => {
  console.log(`MCP SSE server running on port ${port}`);
});