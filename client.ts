export function startClient(url: string) {
  console.log(`Connecting to WebSocket server at ${url}...`);
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("Connected to the server.");
    ws.send("Hello from the client!");
    // console.log(ws);
    // Allow the user to send messages via the terminal
    process.stdin.on("data", (data) => {
      const message = data.toString().trim();
      ws.send(message);
      console.log(`Sent: ${message}`);
    });
  };

  ws.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
  };

  ws.onclose = () => {
    console.log("Disconnected from the server.");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}
