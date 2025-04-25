import WebSocket, { RawData } from "ws"; // Import RawData
import * as readline from "readline";

// Align default port with server default
const DEFAULT_PORT = 3000;

// Adjust default URL to use correct port and path ("/")
export function startClient(url: string = `ws://localhost:${DEFAULT_PORT}/`) {
  const ws = new WebSocket(url);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Handle immediate connection errors
  ws.on("error", (err) => {
    // Check if rl exists before trying to close (it might fail before rl is created)
    if (rl) {
      console.error("Connection error:", err.message);
      rl.close();
    } else {
      console.error("WebSocket creation error:", err.message);
    }
    // Exit or handle error appropriately if connection fails immediately
    process.exit(1);
  });

  ws.on("open", () => {
    console.log(`Connected to ${url}`);
    // Clear the initial error handler now that connection is open
    ws.removeAllListeners("error");
    // Add error handler for post-connection errors
    ws.on("error", (err) => {
      console.error("WebSocket error:", err.message);
      rl.close();
    });

    rl.setPrompt("You: ");
    rl.prompt();
    rl.on("line", (line) => {
      // Handle potential errors during send
      try {
        ws.send(line);
      } catch (sendError) {
        console.error("Error sending message:", sendError);
        // Decide if the client should close or try again
        rl.close();
        ws.close();
      }
      rl.prompt();
    });
  });

  // Use RawData type and convert to string
  ws.on("message", (data: RawData) => {
    // Ensure data is treated as a string
    const message = data.toString();
    // Clear current line, write message, then redraw prompt
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Broadcast: ${message}\n`);
    rl.prompt(true); // Redraw prompt
  });

  ws.on("close", () => {
    console.log("\nDisconnected from server");
    rl.close();
  });

  // Note: The initial 'error' handler is removed upon 'open'
  // The 'error' handler added within 'open' handles subsequent errors.
}
