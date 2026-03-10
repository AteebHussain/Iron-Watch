"use client";

import { Text } from "@react-three/drei";

// ─── Zone type from Prisma ───────────────────────────────────
interface Zone {
  id: string;
  name: string;
  type: string;
  boundary_json: string;
  color_hex: string;
  is_exclusion: boolean;
  bounds_x_min?: number;
  bounds_x_max?: number;
  bounds_y_min?: number;
  bounds_y_max?: number;
}

interface ZoneMeshProps {
  zones: Zone[];
}

/** Maps zone type to a visually distinct, muted color */
function getZoneColor(zoneType: string): string {
  switch (zoneType) {
    case "EXCLUSION": return "#ef4444"; // red
    case "PARKING":   return "#3b82f6"; // blue
    case "LOADING":   return "#22c55e"; // green
    case "SCRAP":     return "#71717a"; // grey
    default:          return "#a1a1aa"; // fallback zinc
  }
}

export function ZoneMesh({ zones }: ZoneMeshProps) {
  return (
    <group>
      {zones.map((zone) => {
        const centerX = ((zone.bounds_x_min ?? 0) + (zone.bounds_x_max ?? 0)) / 2;
        const centerZ = ((zone.bounds_y_min ?? 0) + (zone.bounds_y_max ?? 0)) / 2;
        
        const width = (zone.bounds_x_max ?? 0) - (zone.bounds_x_min ?? 0);
        const depth = (zone.bounds_y_max ?? 0) - (zone.bounds_y_min ?? 0);
        const height = 10;

        const color = getZoneColor(zone.type);

        return (
          <group key={zone.id}>
            {/* Semi-transparent boundary volume */}
            <mesh position={[centerX, height / 2, centerZ]}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.15} 
                depthWrite={false}
              />
            </mesh>

            {/* Floor outline border */}
            <mesh position={[centerX, 0.05, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[width, depth]} />
               <meshBasicMaterial 
                  color={color} 
                  transparent 
                  opacity={0.3} 
                  wireframe
               />
            </mesh>

            {/* Floating text label */}
            <Text
              position={[centerX, height + 1, centerZ]}
              color={color}
              fontSize={2}
              outlineWidth={0.1}
              outlineColor="#000000"
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"
            >
              {zone.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
