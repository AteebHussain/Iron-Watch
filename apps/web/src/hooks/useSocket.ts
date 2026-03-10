"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  SOCKET_MAX_RECONNECT_ATTEMPTS,
  ALERT_FEED_MAX_ITEMS,
  type ConnectionStatus,
} from "@/lib/constants";

// ─── Types matching the server's YardSnapshot ────────────────
export interface AssetSnapshot {
  id: string;
  type: "FORKLIFT" | "WORKER";
  pos_x: number;
  pos_y: number;
  pos_z: number;
  heading: number;
  status: string;
  name: string;
}

export interface SimulationEvent {
  id: string;
  type: "BREACH" | "OBSTACLE" | "REROUTE";
  pos_x: number;
  pos_y: number;
  pos_z: number;
  asset_id?: string;
  zone_id?: string;
}

export interface YardSnapshot {
  assets: AssetSnapshot[];
  events: SimulationEvent[];
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useSocket() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

  // Three.js reads from this ref directly — no React re-render on every tick
  const snapshotRef = useRef<YardSnapshot | null>(null);

  // Only events trigger React state updates (for the alert feed UI)
  const [latestEvents, setLatestEvents] = useState<YardSnapshot["events"]>([]);

  useEffect(() => {
    const socket: Socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: SOCKET_MAX_RECONNECT_ATTEMPTS,
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected to Simulation Engine");
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      console.log("[Socket.io] Disconnected from Simulation Engine");
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      console.log(`[Socket.io] Reconnection attempt ${attempt}/${SOCKET_MAX_RECONNECT_ATTEMPTS}`);
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect_failed", () => {
      console.error("[Socket.io] All reconnection attempts exhausted");
      setConnectionStatus("disconnected");
    });

    socket.io.on("reconnect", () => {
      console.log("[Socket.io] Reconnected successfully");
      setConnectionStatus("connected");
    });

    socket.on("yard:update", (snapshot: YardSnapshot) => {
      // 1. Silent ref update for Three.js (no re-render)
      snapshotRef.current = snapshot;

      // 2. State update for React only when new events exist
      if (snapshot.events && snapshot.events.length > 0) {
        setLatestEvents((prev) =>
          [...snapshot.events, ...prev].slice(0, ALERT_FEED_MAX_ITEMS)
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { connectionStatus, snapshotRef, latestEvents };
}
