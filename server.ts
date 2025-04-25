import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono();

const clients = new Map<string, WSContext<ServerWebSocket>>(); // Cambiar Set a Map

const wsApp = app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        const clientId = crypto.randomUUID(); // Generar un identificador único para el cliente
        clients.set(clientId, ws); // Asociar el identificador con el cliente
        console.log(`🟢 New client connected. Total clients: ${clients.size}`);
      },
      onMessage(event, ws) {
        console.log(`📨 Broadcasting message: ${event.data}`);
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(event.data as string);
          }
        });
      },
      onClose(event, ws) {
        const clientId = [...clients.entries()].find(
          ([, client]) => client === ws
        )?.[0]; // Encontrar el identificador del cliente
        if (clientId) {
          clients.delete(clientId); // Eliminar el cliente de la lista
        }
        console.log(`🔴 Client disconnected. Total clients: ${clients.size}`);
      },
      onError(event, ws) {
        console.error("WebSocket error:", event);
      },
    };
  })
);

export function startServer(port: number) {
  console.log(`🌐  Starting server on port ${port}...`);
  Bun.serve({
    fetch: wsApp.fetch,
    websocket,
    port,
  });
}

export type websocketApp = typeof wsApp;
