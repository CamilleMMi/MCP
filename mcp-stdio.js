const readline = require('readline');

const tools = {
  "tool.add": ({ a, b }) => a + b,
  "tool.hello": () => "Hello World",
  "listTools": () => Object.keys(tools),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  try {
    const { method, params } = JSON.parse(line);

    if (tools[method]) {
      const result = tools[method](params || {});
      process.stdout.write(JSON.stringify({ result }) + '\n');
    } else {
      process.stdout.write(JSON.stringify({ error: 'Unknown method' }) + '\n');
    }
  } catch (err) {
    process.stdout.write(JSON.stringify({ error: err.message }) + '\n');
  }
});