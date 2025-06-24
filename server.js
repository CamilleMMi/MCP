const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const clients = [];

app.get('/mcp', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.flushHeaders();

  clients.push(res);

  res.write(`event: connected\ndata: MCP SSE ready\n\n`);

  req.on('close', () => {
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

app.post('/mcp-message', (req, res) => {
  const { method, params } = req.body;

  let dataToSend = null;

  if (method === 'listTools') {
    dataToSend = { tools: ['add', 'hello'] };
  } else if (method === 'tool.add') {
    const { a, b } = params;
    dataToSend = a + b;
  } else if (method === 'tool.hello') {
    dataToSend = 'Hello World';
  } else {
    res.status(400).json({ error: 'Unknown method' });
    return;
  }

  const message = `data: ${JSON.stringify({ method, result: dataToSend })}\n\n`;
  clients.forEach(client => client.write(message));

  res.json({ status: 'ok' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MCP SSE server running on port ${port}`);
});