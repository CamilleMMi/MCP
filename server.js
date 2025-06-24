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

app.listen(port, () => {
  console.log(`MCP test server running at http://localhost:${port}`);
});