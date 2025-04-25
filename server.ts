import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono();

const clients = new Set<WSContext<ServerWebSocket>>(); // Cambiar Set a Map

const wsApp = app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        clients.add(ws); // Asociar el identificador con el cliente
        //console.log(ws);
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
        //console.log(ws);
        clients.delete(ws); // Eliminar el cliente de la lista
        // Enviar un mensaje a todos los clientes
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
