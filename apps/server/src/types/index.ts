// ─── Geometry ────────────────────────────────────────────────
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// ─── Simulation Asset (internal engine state) ────────────────
export interface SimulationAsset {
  id: string;
  type: "FORKLIFT" | "WORKER";
  status: "ACTIVE" | "IDLE" | "ERROR";
  name: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  heading: number;
  pathNode: number;
  currentPath: PathNode[];
}

export interface PathNode {
  x: number;
  y: number;
  z: number;
  heading: number;
}

// ─── Snapshot emitted to clients via Socket.io ───────────────
export interface AssetSnapshot {
  id: string;
  type: "FORKLIFT" | "WORKER";
  status: string;
  name: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  heading: number;
}

export interface SimulationEvent {
  id: string;
  type: "BREACH" | "OBSTACLE" | "REROUTE";
  asset_id?: string;
  zone_id?: string;
  severity: "LOW" | "MED" | "HIGH";
  pos_x: number;
  pos_y: number;
  pos_z: number;
  timestamp: Date;
  metadata_json?: string;
}

export interface YardSnapshot {
  assets: AssetSnapshot[];
  events: SimulationEvent[];
}
