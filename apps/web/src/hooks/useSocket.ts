"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Core state snapshot sent every 1000ms by the Simulation Engine
export interface YardSnapshot {
  assets: {
    id: string;
    type: "FORKLIFT" | "WORKER";
    pos_x: number;
    pos_y: number;
    pos_z: number;
    heading: number;
    status: string;
    name: string;
  }[];
  events: {
    id: string;
    type: "BREACH" | "OBSTACLE" | "REROUTE";
    pos_x: number;
    pos_y: number;
    pos_z: number;
    asset_id?: string;
    zone_id?: string;
  }[];
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  // We use a React Ref for the snapshot because we do not want React to 
  // trigger a full DOM re-render every 1 second when 100 assets move.
  // The Three.js render loop will read directly from this Ref.
  const snapshotRef = useRef<YardSnapshot | null>(null);
  
  // Explicitly tracked events array for the UI React components (Alert Feed)
  const [latestEvents, setLatestEvents] = useState<YardSnapshot["events"]>([]);

  useEffect(() => {
    const socket: Socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to Simulation Engine");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Simulation Engine");
      setIsConnected(false);
    });

    socket.on("yard:update", (data: YardSnapshot) => {
      // 1. Silent update for Three.js
      snapshotRef.current = data;
      
      // 2. State update for React (Alerts / Feed) if there are new events
      if (data.events && data.events.length > 0) {
        setLatestEvents((prev) => [...data.events, ...prev].slice(0, 50));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { isConnected, snapshotRef, latestEvents };
}
