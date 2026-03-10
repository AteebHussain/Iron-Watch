import { randomUUID } from "crypto";
import { SimulationAsset, SimulationEvent } from "./types";
import {
  OBSTACLE_EVENT_PROBABILITY,
  BREACH_EVENT_PROBABILITY,
} from "./constants";

export class EventGenerator {
  /**
   * Scans all active assets and probabilistically generates anomaly events.
   * Each asset has an independent chance of triggering an obstacle or breach per tick.
   */
  static generateEvents(assets: SimulationAsset[]): SimulationEvent[] {
    const detectedEvents: SimulationEvent[] = [];
    const now = new Date();

    for (const asset of assets) {
      if (asset.status !== "ACTIVE") continue;

      // Obstacle detection — random debris / path blockage
      if (Math.random() < OBSTACLE_EVENT_PROBABILITY) {
        detectedEvents.push({
          id: randomUUID(),
          type: "OBSTACLE",
          asset_id: asset.id,
          severity: "MED",
          pos_x: asset.pos_x + (Math.random() * 4 - 2),
          pos_y: 0,
          pos_z: asset.pos_z + (Math.random() * 4 - 2),
          timestamp: now,
          metadata_json: JSON.stringify({ reason: "Debris detected on path" }),
        });
      }

      // Breach detection — asset enters restricted area
      if (Math.random() < BREACH_EVENT_PROBABILITY) {
        detectedEvents.push({
          id: randomUUID(),
          type: "BREACH",
          asset_id: asset.id,
          severity: "HIGH",
          pos_x: asset.pos_x,
          pos_y: 0,
          pos_z: asset.pos_z,
          timestamp: now,
          metadata_json: JSON.stringify({ reason: "Asset entered exclusion zone" }),
        });
      }
    }

    return detectedEvents;
  }
}
