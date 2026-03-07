"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Loader } from "@react-three/drei";
import { AssetMesh } from "./AssetMesh";
import { EventEffect } from "./EventEffect";
import { ZoneMesh } from "./ZoneMesh";
import { YardSnapshot } from "@/hooks/useSocket";

interface SceneBuilderProps {
  snapshotRef: React.MutableRefObject<YardSnapshot | null>;
  zones: any[]; // Data from DB via props (fetched by Server Component)
}

export function SceneBuilder({ snapshotRef, zones }: SceneBuilderProps) {
  return (
    <div className="w-full h-full relative bg-zinc-950">
      <Canvas shadows>
        <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[30, 40, 30]} fov={50} />
        <OrbitControls 
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2.2} // Prevent camera from going under ground
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
