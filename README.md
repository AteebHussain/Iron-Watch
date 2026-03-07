# IronWatch Console (WIP)

A web-based Industrial Digital Twin and real-time telemetry dashboard. Built to monitor multi-agent routing, geofencing safety compliance, and fleet utilization in heavy industrial environments (warehouses, construction yards). 

This project acts as the "Delivery/IT Layer" to complement deep-tech simulation physics engines like NVIDIA Isaac Sim, offering a lightweight, secure real-time visualization layer that can be accessed via any standard web browser.

## Features
* **Real-time 3D Viewport:** A WebGL canvas powered by Three.js and React-Three-Fiber, rendering live asset positions with smooth bezier interpolation and dynamic path history Trails.
* **Bi-directional Telemetry Stream:** A Node.js and Socket.io simulation engine broadcasting hundreds of coordinate anomaly updates per second.
* **Automated Geofencing Events:** Dynamic computation of Breach and Obstacle events triggering visual alerts in the dashboard when workers cross into designated Exclusion or Parking boundaries.
* **Persistent Audit Logs:** A robust backend integrated with PostgreSQL and Prisma ORM to ensure all tracking activity is securely batched and logged for historical playback and metric yield analysis.
* **Monorepo Architecture:** Securely split into a Next.js App Router (Frontend) and an Express Server (Backend) using pnpm workspaces to ensure scalable zero-cost deployments on Serverless and PaaS providers.

## Tech Stack
* **Frontend:** Next.js 16 (React 19), Tailwind CSS, shadcn/ui
* **3D Engine:** Three.js, @react-three/fiber, @react-three/drei
* **Backend:** Node.js, Express, Socket.io
* **Database:** PostgreSQL (Neon Serverless), Prisma ORM
* **Tooling:** pnpm workspaces, TypeScript

## Future Roadmap
- [ ] Implement database batch-inserts to scale telemetry history gathering.
- [ ] Expand the UI to include a Time Scrubber (rewind history playback).
- [ ] Integrate 2D heatmaps detailing frequently traversed facility paths.
- [ ] Embed actual 3D GLTF models mimicking articulated forklifts and site geometry.

## Setup Instructions
```bash
# 1. Clone the repository
git clone https://github.com/YourUsername/Iron-Watch.git

# 2. Install dependencies via pnpm
pnpm install

# 3. Setup the database (Ensure neon postgres connection string is in /packages/db/.env)
pnpm --filter @ironwatch/db run db:push
pnpm --filter @ironwatch/db run generate

# 4. Start the development servers
pnpm run dev
```

*Note: The Next.js frontend runs on `localhost:3000` while the WebSocket Simulation engine ticks on `localhost:3001`.*
