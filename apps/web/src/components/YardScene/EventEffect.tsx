"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { YardSnapshot } from "@/hooks/useSocket";

interface EventEffectProps {
  snapshotRef: React.MutableRefObject<YardSnapshot | null>;
}

interface ActiveEffect {
  id: string;
  type: "BREACH" | "OBSTACLE" | "REROUTE";
  pos: [number, number, number];
  startTime: number;
}

export function EventEffect({ snapshotRef }: EventEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const activeEffects = useRef<Map<string, ActiveEffect>>(new Map());
  
  // Basic geometry/materials to reuse
  const obstacleGeo = useMemo(() => new THREE.TorusGeometry(2, 0.2, 16, 100), []);
  const obstacleMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 }), []);

  useFrame(({ clock }) => {
    if (!snapshotRef.current || !groupRef.current) return;
    const now = clock.getElapsedTime();
    const events = snapshotRef.current.events || [];
    const currentIds = new Set(events.map(e => e.id));

    // Cleanup finished/removed events
    activeEffects.current.forEach((effect, id) => {
      if (!currentIds.has(id) || now - effect.startTime > 3) { // 3s lifespan
        const child = groupRef.current?.getObjectByName(`event-${id}`);
        if (child) groupRef.current?.remove(child);
        activeEffects.current.delete(id);
      }
    });

    // Spawn new events
    events.forEach(event => {
      if (!activeEffects.current.has(event.id) && event.type === 'OBSTACLE') {
        const effectMesh = new THREE.Mesh(obstacleGeo, obstacleMat.clone());
        effectMesh.name = `event-${event.id}`;
        effectMesh.position.set(event.pos_x, event.pos_y + 0.5, event.pos_z);
        effectMesh.rotation.x = Math.PI / 2;
        groupRef.current?.add(effectMesh);
        
        activeEffects.current.set(event.id, {
          id: event.id,
          type: event.type,
          pos: [event.pos_x, event.pos_y, event.pos_z],
          startTime: now
        });
      }
    });

    // Animate active effects (expanding ring)
    activeEffects.current.forEach((effect) => {
      const child = groupRef.current?.getObjectByName(`event-${effect.id}`) as THREE.Mesh;
      if (child && effect.type === "OBSTACLE") {
        const age = now - effect.startTime;
        const scale = 1 + (age * 2); // Expand outward
        child.scale.set(scale, scale, scale);
        (child.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 - (age * 0.3)); // Fade out
      }
    });
  });

  return <group ref={groupRef} />;
}
