import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./db/db.js";
import { initSocket } from "./sockets/index.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 API + Socket.IO → http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
};

startServer();
