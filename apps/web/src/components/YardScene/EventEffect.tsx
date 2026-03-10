"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { YardSnapshot } from "@/hooks/useSocket";
import { EVENT_EFFECT_LIFESPAN_S } from "@/lib/constants";

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
  
  // Shared geometry/materials — reused across all effect instances
  const obstacleGeometry = useMemo(() => new THREE.TorusGeometry(2, 0.2, 16, 100), []);
  const obstacleMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 }), []);

  useFrame(({ clock }) => {
    if (!snapshotRef.current || !groupRef.current) return;
    const elapsedTime = clock.getElapsedTime();
    const events = snapshotRef.current.events || [];
    const currentEventIds = new Set(events.map(e => e.id));

    // Cleanup expired or removed effects
    activeEffects.current.forEach((effect, id) => {
      const age = elapsedTime - effect.startTime;
      if (!currentEventIds.has(id) || age > EVENT_EFFECT_LIFESPAN_S) {
        const child = groupRef.current?.getObjectByName(`event-${id}`);
        if (child) groupRef.current?.remove(child);
        activeEffects.current.delete(id);
      }
    });

    // Spawn new event effects
    events.forEach(event => {
      if (!activeEffects.current.has(event.id) && event.type === 'OBSTACLE') {
        const effectMesh = new THREE.Mesh(obstacleGeometry, obstacleMaterial.clone());
        effectMesh.name = `event-${event.id}`;
        effectMesh.position.set(event.pos_x, event.pos_y + 0.5, event.pos_z);
        effectMesh.rotation.x = Math.PI / 2;
        groupRef.current?.add(effectMesh);
        
        activeEffects.current.set(event.id, {
          id: event.id,
          type: event.type,
          pos: [event.pos_x, event.pos_y, event.pos_z],
          startTime: elapsedTime,
        });
      }
    });

    // Animate active effects (expanding + fading ring)
    activeEffects.current.forEach((effect) => {
      const child = groupRef.current?.getObjectByName(`event-${effect.id}`) as THREE.Mesh;
      if (child && effect.type === "OBSTACLE") {
        const age = elapsedTime - effect.startTime;
        const scale = 1 + (age * 2);
        child.scale.set(scale, scale, scale);
        (child.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 - (age * 0.3));
      }
    });
  });

  return <group ref={groupRef} />;
}
