import { hc } from "hono/client";
import type { websocketApp } from "./server";

export function startClient(url: string) {
  console.log(`Connecting to WebSocket server at ${url}...`);
  const client = hc<websocketApp>(url);
  const ws = client.ws.$ws();

  ws.addEventListener("open", () => {
    console.log("Connected to the server.");
    // Allow the user to send messages via the terminal
    process.stdin.on("data", (data) => {
      const message = data.toString().trim();
      ws.send(message);
      console.log(`Sent: ${message}`);
    });
  });

  ws.addEventListener("message", (event) => {
    console.log(`Message from server: ${event.data}`);
  });

  ws.addEventListener("close", () => {
    console.log("Disconnected from the server.");
  });

  ws.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
  });
}
