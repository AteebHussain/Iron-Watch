import { randomUUID } from "crypto";

export class EventGenerator {
  // Analyzes asset positions and randomly generates anomalies
  static generateEvents(assets: any[]) {
    const newEvents = [];
    const now = new Date();

    for (const asset of assets) {
      // 1% chance for an obstacle every tick per active asset
      if (Math.random() < 0.01 && asset.status === "ACTIVE") {
        newEvents.push({
          id: randomUUID(),
          asset_id: asset.id,
          event_type: "OBSTACLE",
          severity: "MED",
          pos_x: asset.pos_x + (Math.random() * 4 - 2), // Slightly offset
          pos_y: asset.pos_z + (Math.random() * 4 - 2), // Treating z as 2D y
          pos_z: asset.pos_z, // Need this for 3D render
          timestamp: now,
          metadata_json: JSON.stringify({ reason: "Debris detected" })
        });
      }
      
      // Breach logic would check asset bounds vs zone bounds here.
    }

    return newEvents;
  }
}
