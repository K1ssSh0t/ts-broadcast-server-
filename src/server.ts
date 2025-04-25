import Fastify from "fastify";
import websocket from "@fastify/websocket";
// Import WebSocket type from the 'ws' library
import { WebSocket } from "ws";

export async function startServer(port: number) {
  const fastify = Fastify();
  await fastify.register(websocket);

  // Use WebSocket as the type for the Set
  const clients = new Set<WebSocket>();

  // The 'socket' parameter in wsHandler is compatible with ws.WebSocket
  fastify.get(
    "/",
    { websocket: true },
    function wsHandler(socket /* type is inferred or compatible */, req) {
      console.log("*** wsHandler invoked for a new connection ***");

      // Add client immediately when handler is invoked
      clients.add(socket);
      console.log("+++ Client added to Set +++");
      console.log(`🟢 New client connected. Total clients: ${clients.size}`);

      // Keep the open listener just for logging, to see if it ever fires
      socket.on("open", () => {
        console.log(">>> OPEN event triggered (for observation) <<<");
      });

      socket.on("message", (message) => {
        console.log(`📨 Broadcasting message: ${message.toString()}`);
        // Broadcast to all *other* connected clients in the shared Set
        clients.forEach((client) => {
          // Check if the client is still open before sending
          if (client !== socket && client.readyState === WebSocket.OPEN) {
            // Use WebSocket.OPEN
            client.send(message.toString());
          }
        });
      });

      socket.on("close", () => {
        clients.delete(socket); // Delete from the shared Set
        console.log(`🔴 Client disconnected. Total clients: ${clients.size}`);
      });

      socket.on("error", (error) => {
        console.error("WebSocket error:", error);
        clients.delete(socket); // Remove from shared Set on error
        console.log(
          `🔴 Client disconnected after error. Total clients: ${clients.size}`
        );
      });
    }
  );

  try {
    await fastify.listen({ port });
    console.log(`🚀 Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
