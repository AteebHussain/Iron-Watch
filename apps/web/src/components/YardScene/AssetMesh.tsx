"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, Text, Line } from "@react-three/drei";
import { YardSnapshot } from "@/hooks/useSocket";

interface AssetMeshProps {
  snapshotRef: React.MutableRefObject<YardSnapshot | null>;
}

export function AssetMesh({ snapshotRef }: AssetMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshesRef = useRef<Record<string, { group: THREE.Group; type: string; name: string }>>({});
  
  // Track path history for drawing the trail
  const pathHistoryRef = useRef<Record<string, THREE.Vector3[]>>({});

  useFrame(() => {
    if (!snapshotRef.current || !groupRef.current) return;
    const assets = snapshotRef.current.assets;

    assets.forEach((asset) => {
      let assetData = meshesRef.current[asset.id];

      if (!assetData) {
        // Create the group container for this asset
        const group = new THREE.Group();
        group.position.set(asset.pos_x, asset.pos_y, asset.pos_z);
        
        if (asset.type === "FORKLIFT") {
          const bodyGeom = new THREE.BoxGeometry(2, 1.5, 3);
          const mat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
          const bodyMesh = new THREE.Mesh(bodyGeom, mat);
          bodyMesh.position.y = 0.75;
          bodyMesh.castShadow = true;
          group.add(bodyMesh);

          const mastGeom = new THREE.CylinderGeometry(0.2, 0.2, 3);
          const mastMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
          const mastMesh = new THREE.Mesh(mastGeom, mastMat);
          mastMesh.position.set(0, 1.5, 1.5);
          mastMesh.castShadow = true;
          group.add(mastMesh);
        } else if (asset.type === "WORKER") {
          const capGeom = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
          const mat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
          const capMesh = new THREE.Mesh(capGeom, mat);
          capMesh.position.y = 0.8;
          capMesh.castShadow = true;
          group.add(capMesh);
        }

        groupRef.current?.add(group);
        meshesRef.current[asset.id] = { group, type: asset.type, name: asset.name };
        assetData = meshesRef.current[asset.id];
      }

      // Smooth Position Lerp
      assetData.group.position.lerp(new THREE.Vector3(asset.pos_x, asset.pos_y, asset.pos_z), 0.15);

      // Track path history (keep last 20 points)
      if (!pathHistoryRef.current[asset.id]) {
        pathHistoryRef.current[asset.id] = [];
      }
      const history = pathHistoryRef.current[asset.id];
      const currentPos = new THREE.Vector3(assetData.group.position.x, 0.1, assetData.group.position.z);
      
      // Only push if moved significantly to avoid tiny jitter segments
      if (history.length === 0 || history[history.length - 1].distanceTo(currentPos) > 0.5) {
        history.push(currentPos);
        if (history.length > 20) {
          history.shift(); // Remove oldest point
        }
      }

      // Smooth Rotation Slerp
      const targetRotation = new THREE.Euler(0, asset.heading, 0);
      const targetQuaternion = new THREE.Quaternion().setFromEuler(targetRotation);
      assetData.group.quaternion.slerp(targetQuaternion, 0.15);
    });

    // Cleanup stale assets
    const currentIds = new Set(assets.map((a) => a.id));
    Object.keys(meshesRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        groupRef.current?.remove(meshesRef.current[id].group);
        delete meshesRef.current[id];
        delete pathHistoryRef.current[id];
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* 
        We use React to map the state to floating text labels, since pure Three.js
        groups don't easily compose with Drei's <Text> component dynamically in a useFrame block.
      */}
      {snapshotRef.current?.assets.map((asset) => (
        <group key={`label-${asset.id}`} position={[asset.pos_x, asset.pos_y + (asset.type === 'FORKLIFT' ? 3 : 2.5), asset.pos_z]}>
           <Text
            position={[0, 0, 0]}
            color="white"
            fontSize={0.6}
            maxWidth={10}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="center"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {asset.name}
          </Text>
        </group>
      ))}

      {/* Render Trail Lines */}
      {snapshotRef.current?.assets.map((asset) => {
        const history = pathHistoryRef.current[asset.id];
        if (!history || history.length < 2) return null;
        
        // Convert history vectors to flat array of coordinates required by Line
        const points = history.map(p => [p.x, p.y, p.z] as [number, number, number]);

        return (
          <Line
            key={`path-${asset.id}`}
            points={points}
            color={asset.type === 'FORKLIFT' ? "#ffcc00" : "#ff6600"}
            lineWidth={3}
            transparent
            opacity={0.4}
            dashed
            dashScale={5}
            dashSize={2}
            dashOffset={0}
          />
        );
      })}
    </group>
  );
}
