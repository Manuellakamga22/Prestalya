require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const initSocket = require("./socket/chatSocket");
const connectMongo = require("./config/mongo");
const { setIo } = require("./config/ioInstance");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectMongo();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  setIo(io);
  initSocket(io);

  server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Erreur démarrage serveur :", err.message);
  process.exit(1);
});
