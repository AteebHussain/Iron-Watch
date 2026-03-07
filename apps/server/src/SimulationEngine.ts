import { EventGenerator } from "./EventGenerator";
import { PathFinder } from "./PathFinder";
import { randomUUID } from "crypto";

export class SimulationEngine {
  private updateClients: (snapshot: any) => void;
  // Hold active asset state
  private assets: any[] = [];
  
  constructor(updateClientsCallback: (snapshot: any) => void) {
    this.updateClients = updateClientsCallback;
    this.initDummyAssets();
  }

  private initDummyAssets() {
    // For now we bootstrap dummy assets since there's no DB connected yet
    for (let i = 0; i < 5; i++) {
        this.assets.push({
            id: randomUUID(),
            type: "FORKLIFT",
            status: "ACTIVE",
            pos_x: Math.random() * 40 - 20,
            pos_y: 0,
            pos_z: Math.random() * 40 - 20,
            heading: 0,
            pathNode: 0,
            currentPath: []
        });
    }
    for (let i = 0; i < 5; i++) {
      this.assets.push({
          id: randomUUID(),
          type: "WORKER",
          status: "ACTIVE",
          pos_x: Math.random() * 40 - 20,
          pos_y: 0,
          pos_z: Math.random() * 40 - 20,
          heading: 0,
          pathNode: 0,
          currentPath: []
      });
  }
  }

  public start() {
    setInterval(() => {
      this.tick();
    }, 1000);
  }

  private tick() {
    const events = EventGenerator.generateEvents(this.assets);

    for (const asset of this.assets) {
        if (asset.currentPath.length === 0 || asset.pathNode >= asset.currentPath.length - 1) {
            // Need a new path
            const dest = {
                x: Math.random() * 80 - 40,
                y: 0,
                z: Math.random() * 80 - 40
            };
            asset.currentPath = PathFinder.generateCurve(
                { x: asset.pos_x, y: asset.pos_y, z: asset.pos_z },
                dest,
                20 // 20 steps / 10 seconds approx travel time
            );
            asset.pathNode = 0;
        }

        const nextStep = asset.currentPath[asset.pathNode];
        asset.pos_x = nextStep.x;
        asset.pos_z = nextStep.z; // Movement on the ground plane (XZ)
        asset.heading = nextStep.heading;
        asset.pathNode++;
    }

    // Emit via socket
    this.updateClients({
        assets: this.assets.map(a => ({
            id: a.id,
            type: a.type,
            status: a.status,
            pos_x: a.pos_x,
            pos_y: a.pos_y,
            pos_z: a.pos_z,
            heading: a.heading
        })),
        events
    });

    // TODO: DB batch insert for telemetry
  }
}
