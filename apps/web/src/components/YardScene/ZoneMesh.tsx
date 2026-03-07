"use client";

import { Text } from "@react-three/drei";

interface ZoneMeshProps {
  zones: any[];
}

export function ZoneMesh({ zones }: ZoneMeshProps) {
  return (
    <group>
      {zones.map((zone) => {
        // Calculate center for text placement
        const centerX = (zone.bounds_x_min + zone.bounds_x_max) / 2;
        const centerZ = (zone.bounds_y_min + zone.bounds_y_max) / 2;
        
        // Calculate dimensions
        const width = zone.bounds_x_max - zone.bounds_x_min;
        const depth = zone.bounds_y_max - zone.bounds_y_min;
        const height = 10; // Taller box for visibility

        // Color based on type
        const color = zone.type === "EXCLUSION" ? "#ef4444" 
                    : zone.type === "PARKING" ? "#3b82f6" 
                    : "#22c55e"; // LOADING

        return (
          <group key={zone.id}>
            {/* The transparent boundary box */}
            <mesh position={[centerX, height / 2, centerZ]}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.15} 
                depthWrite={false}
              />
            </mesh>

            {/* The outline border on the floor */}
            <mesh position={[centerX, 0.05, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[width, depth]} />
               <meshBasicMaterial 
                  color={color} 
                  transparent 
                  opacity={0.3} 
                  wireframe
               />
            </mesh>

            {/* Floating text label for the zone */}
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
