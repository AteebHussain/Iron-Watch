import { Vector3D, PathNode } from "./types";
import { PATH_CONTROL_POINT_JITTER } from "./constants";

export class PathFinder {
  /**
   * Generates a quadratic bezier curve path between two points.
   * In a full implementation this would respect zone boundaries and avoid obstacles.
   */
  static generateCurve(start: Vector3D, end: Vector3D, steps: number = 20): PathNode[] {
    const path: PathNode[] = [];

    // Control point with random jitter for organic-looking curves
    const controlX = (start.x + end.x) / 2 + (Math.random() * PATH_CONTROL_POINT_JITTER * 2 - PATH_CONTROL_POINT_JITTER);
    const controlZ = (start.z + end.z) / 2 + (Math.random() * PATH_CONTROL_POINT_JITTER * 2 - PATH_CONTROL_POINT_JITTER);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * end.x;
      const z = Math.pow(1 - t, 2) * start.z + 2 * (1 - t) * t * controlZ + Math.pow(t, 2) * end.z;

      // Calculate heading angle toward next point
      let heading = 0;
      if (i > 0) {
        const prev = path[i - 1];
        heading = Math.atan2(x - prev.x, z - prev.z);
      }

      path.push({ x, y: start.y, z, heading });
    }

    // Fix first node heading to match the second node
    if (path.length > 1) {
      path[0].heading = path[1].heading;
    }

    return path;
  }
}
