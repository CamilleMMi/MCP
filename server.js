const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

app.post("/mcp", (req, res) => {
  const { method, params } = req.body;

  if (method === "tool.add") {
    const { a, b } = params;
    return res.json({ result: a + b });
  }

  return res.status(400).json({ error: "Unknown method" });
});

app.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  const intervalId = setInterval(() => {
    const data = JSON.stringify({ message: "heartbeat", timestamp: new Date() });
    res.write(`data: ${data}\n\n`);
  }, 5000);

  req.on("close", () => {
    clearInterval(intervalId);
  });
});

app.listen(port, () => {
  console.log(`MCP server with SSE running at http://localhost:${port}`);
});