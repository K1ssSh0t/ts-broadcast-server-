import { Command } from "commander";
import { startServer } from "./server";
import { startClient } from "./client";

const program = new Command();
const DEFAULT_PORT = 3000;

program
  .name("broadcast-server")
  .description("CLI to start a broadcast server or connect as a client")
  .version("1.0.0");

program
  .command("start")
  .description("Start the broadcast server")
  .option("-p, --port <port>", "Port to listen on", String(DEFAULT_PORT))
  .action((options) => {
    const port = parseInt(options.port, 10) || DEFAULT_PORT;
    startServer(port);
  });

program
  .command("client")
  .description("Connect to the broadcast server as a client")
  .option("-u, --url <url>", "WebSocket server URL", `ws://localhost:3001/ws`)
  .action((options) => {
    startClient(options.url);
  });

program.parse(process.argv);
