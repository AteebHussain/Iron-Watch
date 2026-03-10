"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Loader } from "@react-three/drei";
import { AssetMesh } from "./AssetMesh";
import { EventEffect } from "./EventEffect";
import { ZoneMesh } from "./ZoneMesh";
import { YardSnapshot } from "@/hooks/useSocket";

// ─── Zone type from Prisma (passed from Server Component) ────
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

interface SceneBuilderProps {
  snapshotRef: React.MutableRefObject<YardSnapshot | null>;
  zones: Zone[];
}

export function SceneBuilder({ snapshotRef, zones }: SceneBuilderProps) {
  return (
    <div className="w-full h-full relative bg-zinc-950">
      <Canvas shadows>
        <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[30, 40, 30]} fov={50} />
        <OrbitControls 
          target={[0, 0, 0]}
          minPolarAngle={Math.PI / 6}       // Prevent flat top-down
          maxPolarAngle={Math.PI / 2.2}     // Prevent going under ground
          minDistance={10}
          maxDistance={150}
        />

        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[50, 50, 20]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />

        {/* Industrial Ground Grid */}
        <Grid 
          infiniteGrid 
          fadeDistance={100} 
          sectionColor="#444" 
          cellColor="#222" 
          cellSize={2} 
          sectionSize={10} 
        />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[500, 500]} />
          <shadowMaterial opacity={0.4} />
        </mesh>

        {/* Dynamic Entities updating directly from socket ref */}
        <AssetMesh snapshotRef={snapshotRef} />
        <EventEffect snapshotRef={snapshotRef} />

        {/* Static Zones rendering logic */}
        <ZoneMesh zones={zones} />
        </Suspense>
      </Canvas>
      <Loader 
        containerStyles={{ background: "#09090b" }} 
        innerStyles={{ width: "300px" }} 
        barStyles={{ background: "#f59e0b" }} 
        dataStyles={{ color: "#fef3c7", fontSize: "14px", fontFamily: "monospace" }} 
      />
    </div>
  );
}
