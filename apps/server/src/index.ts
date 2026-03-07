import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { SimulationEngine } from "./SimulationEngine";

const app = express();
app.use(cors());

// Required: Health check route for cron-job.org to hit every 10 min
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow Next.js app on Vercel
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Init Simulation
const engine = new SimulationEngine((snapshot) => {
    io.emit("yard:update", snapshot);
});

// Start loop
engine.start();
console.log("Simulation Engine started...");

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
