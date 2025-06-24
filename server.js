const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let clients = [];

app.get("/mcp", (req, res) => {
  console.log("🔌 New SSE client connected");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`event: connected\ndata: MCP SSE ready\n\n`);
  clients.push(res);

  req.on("close", () => {
    console.log("SSE client disconnected");
    clients = clients.filter(c => c !== res);
  });
});

app.post("/mcp-message", (req, res) => {
  const { method, params } = req.body;
  console.log("📩 Message received:", method, params);

  let result;

  if (method === "tool.add") {
    const { a, b } = params;
    result = { result: a + b };
  } else if (method === "tool.hello") {
    result = { result: "Hello World" };
  } else if (method === "listTools") {
    result = {
      result: [
        { name: "tool.add", description: "Additionne deux nombres." },
        { name: "tool.hello", description: "Renvoie Hello World." }
      ]
    };
  } else {
    result = { error: "Unknown method" };
  }

  const payload = `data: ${JSON.stringify(result)}\n\n`;
  clients.forEach(client => client.write(payload));
  console.log("Sent to all clients:", result);

  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`MCP server running on port ${port}`);
});