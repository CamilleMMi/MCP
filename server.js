const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const tools = {
  "tool.add": {
    name: "Addition Tool",
    description: "Adds two numbers.",
    params: ["a", "b"],
  },
  "tool.hello": {
    name: "Hello Tool",
    description: "Returns Hello World.",
    params: [],
  },
};

app.post("/mcp", (req, res) => {
  const { method, params } = req.body;

  if (method === "listTools") {
    return res.json({ result: tools });
  }

  if (method === "tool.add") {
    const { a, b } = params;
    return res.json({ result: Number(a) + Number(b) });
  }

  if (method === "tool.hello") {
    return res.json({ result: "Hello World" });
  }

  return res.status(400).json({ error: "Unknown method" });
});

app.listen(port, () => {
  console.log(`MCP server running at http://localhost:${port}`);
});