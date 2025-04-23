import WebSocket from "ws";
import * as readline from "readline";

const DEFAULT_PORT = 3001;

export function startClient(url: string = `ws://localhost:${DEFAULT_PORT}`) {
  const ws = new WebSocket(url);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  ws.on("open", () => {
    console.log(`Connected to ${url}`);
    rl.setPrompt("You: ");
    rl.prompt();
    rl.on("line", (line) => {
      ws.send(line);
      rl.prompt();
    });
  });

  ws.on("message", (data) => {
    process.stdout.write(`\nBroadcast: ${data}\n`);
    rl.prompt();
  });

  ws.on("close", () => {
    console.log("Disconnected from server");
    rl.close();
  });

  ws.on("error", (err) => {
    console.error("Connection error:", err.message);
    rl.close();
  });
}
