import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { WebSocketServer, WebSocket } from "ws";

const DEFAULT_PORT = 3000;
const WS_PORT = 3001;

export function startServer(
  port: number = DEFAULT_PORT,
  wsPort: number = WS_PORT
) {
  const app = new Hono();
  app.use(logger());
  app.get("/", (c) => c.text("Broadcast server running"));

  // Start HTTP server with Hono
  serve({ fetch: app.fetch, port });
  console.log(`🚀 HTTP server listening at: http://localhost:${port}`);

  // Start WebSocket server on a different port
  const wss = new WebSocketServer({ port: wsPort });
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log(`🟢 New client connected. Total clients: ${clients.size}`);
    ws.on("message", (message) => {
      console.log(`📨 Broadcasting message: ${message}`);
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(message);
        }
      }
    });
    ws.on("close", () => {
      clients.delete(ws);
      console.log(`🔴 Client disconnected. Total clients: ${clients.size}`);
    });
  });

  console.log(`🌐 WebSocket server listening at: ws://localhost:${wsPort}`);
}
