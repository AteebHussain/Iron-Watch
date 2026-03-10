import { SimulationAsset, SimulationEvent, YardSnapshot } from "./types";
import { EventGenerator } from "./EventGenerator";
import { PathFinder } from "./PathFinder";
import { randomUUID } from "crypto";
import {
  SIMULATION_TICK_INTERVAL_MS,
  ASSET_COUNT_FORKLIFTS,
  ASSET_COUNT_WORKERS,
  YARD_BOUNDARY,
  YARD_DESTINATION_RANGE,
  PATH_CURVE_STEPS,
} from "./constants";

export class SimulationEngine {
  private broadcastSnapshot: (snapshot: YardSnapshot) => void;
  private assets: SimulationAsset[] = [];

  constructor(broadcastCallback: (snapshot: YardSnapshot) => void) {
    this.broadcastSnapshot = broadcastCallback;
    this.bootstrapAssets();
  }

  /** Seed the yard with initial assets */
  private bootstrapAssets(): void {
    for (let i = 0; i < ASSET_COUNT_FORKLIFTS; i++) {
      this.assets.push({
        id: randomUUID(),
        type: "FORKLIFT",
        status: "ACTIVE",
        name: `Forklift-${String(i + 1).padStart(2, "0")}`,
        pos_x: Math.random() * YARD_BOUNDARY * 2 - YARD_BOUNDARY,
        pos_y: 0,
        pos_z: Math.random() * YARD_BOUNDARY * 2 - YARD_BOUNDARY,
        heading: 0,
        pathNode: 0,
        currentPath: [],
      });
    }

    for (let i = 0; i < ASSET_COUNT_WORKERS; i++) {
      this.assets.push({
        id: randomUUID(),
        type: "WORKER",
        status: "ACTIVE",
        name: `Worker-${String(i + 1).padStart(2, "0")}`,
        pos_x: Math.random() * YARD_BOUNDARY * 2 - YARD_BOUNDARY,
        pos_y: 0,
        pos_z: Math.random() * YARD_BOUNDARY * 2 - YARD_BOUNDARY,
        heading: 0,
        pathNode: 0,
        currentPath: [],
      });
    }
  }

  /** Start the simulation tick loop */
  public start(): void {
    setInterval(async () => {
      try {
        this.tick();
      } catch (error) {
        console.error("[SimulationEngine] Tick failed:", error);
      }
    }, SIMULATION_TICK_INTERVAL_MS);
  }

  /** Single simulation frame — moves assets, generates events, broadcasts */
  private tick(): void {
    const events = EventGenerator.generateEvents(this.assets);

    for (const asset of this.assets) {
      // Assign a new bezier path if the current one is exhausted
      if (asset.currentPath.length === 0 || asset.pathNode >= asset.currentPath.length - 1) {
        const destination = {
          x: Math.random() * YARD_DESTINATION_RANGE * 2 - YARD_DESTINATION_RANGE,
          y: 0,
          z: Math.random() * YARD_DESTINATION_RANGE * 2 - YARD_DESTINATION_RANGE,
        };
        asset.currentPath = PathFinder.generateCurve(
          { x: asset.pos_x, y: asset.pos_y, z: asset.pos_z },
          destination,
          PATH_CURVE_STEPS
        );
        asset.pathNode = 0;
      }

      // Advance one step along the path
      const nextStep = asset.currentPath[asset.pathNode];
      asset.pos_x = nextStep.x;
      asset.pos_z = nextStep.z;
      asset.heading = nextStep.heading;
      asset.pathNode++;
    }

    // Broadcast the snapshot to all connected clients
    const snapshot: YardSnapshot = {
      assets: this.assets.map((asset) => ({
        id: asset.id,
        type: asset.type,
        status: asset.status,
        name: asset.name,
        pos_x: asset.pos_x,
        pos_y: asset.pos_y,
        pos_z: asset.pos_z,
        heading: asset.heading,
      })),
      events,
    };

    this.broadcastSnapshot(snapshot);
  }
}
