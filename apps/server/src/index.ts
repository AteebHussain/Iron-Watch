import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { SimulationEngine } from "./SimulationEngine";
import { YardSnapshot } from "./types";

const app = express();
app.use(cors());

// Health check route for cron-job.org keep-alive (prevents Render free-tier spin-down)
app.get("/ping", (_req, res) => {
  res.status(200).send("pong");
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Open for development — lock to Vercel domain in production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Initialize the Simulation Engine and broadcast snapshots via Socket.io
const engine = new SimulationEngine((snapshot: YardSnapshot) => {
  io.emit("yard:update", snapshot);
});

engine.start();
console.log("[IronWatch] Simulation Engine started");

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[IronWatch] Server listening on port ${PORT}`);
});
