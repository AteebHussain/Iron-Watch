# IronWatch Console - Deployment Guide

Since this project uses a separated **Frontend (Vercel)** and **Backend (Render)** architecture to solve Next.js WebSocket limitations, deployment happens in two phases.

Before you start, ensure your code is pushed to a Github repository.

## Phase 1: Deploying the Backend (Node.js Simulation & WebSockets) to Render

Render is perfect for our Node.js WebSocket backend because it supports long-running persistent servers natively.

1. Create a free account at [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `ironwatch` repository.
4. **Configuration Settings:**
   * **Name:** `ironwatch-engine`
   * **Language:** `Node`
   * **Branch:** `main`
   * **Root Directory:** `apps/server` (Important!)
   * **Build Command:** `pnpm install && pnpm run build`
   * **Start Command:** `pnpm start`
5. **Environment Variables:**
   * Scroll down to `Environment Variables`.
   * Add `DATABASE_URL` and paste your Neon connection string.
     *(e.g., `postgresql://user:pass@ep-restless-bird-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)*
6. Click **Create Web Service**. 
7. Once deployed, copy the Render URL provided at the top left (e.g., `https://ironwatch-engine-xyz.onrender.com`). **You will need this for Phase 2.**

---

## Phase 2: Deploying the Frontend (Next.js 3D Dashboard) to Vercel

Vercel is the creator of Next.js and provides the absolute best hosting for the frontend dashboard.

1. Go to [Vercel.com](https://vercel.com/) and log in with your GitHub.
2. Click **Add New Project** and import your `ironwatch` repository.
3. **Configuration Settings:**
   * **Framework Preset:** Next.js (Should auto-detect)
   * **Root Directory:** Edit this and select `apps/web`.
4. **Environment Variables:**
   * Add `NEXT_PUBLIC_SOCKET_URL`
   * Set the value to your Render URL from Phase 1 (e.g., `https://ironwatch-engine-xyz.onrender.com`).
   * Add `DATABASE_URL` and paste your Neon connection string (for server-components like the Zone fetcher).
5. Click **Deploy**.

## Phase 3: Update CORS Headers

If Vercel successfully builds but the 3D assets aren't moving, it means the Render backend is blocking Vercel from listening to the WebSockets.

1. Go into your codebase `apps/server/src/index.ts`.
2. Locate the `socket.io` initialization. You need to whitelist your new Vercel URL.
   ```typescript
   const io = new Server(server, {
     cors: {
       origin: ["http://localhost:3000", "https://your-vercel-app-url.vercel.app"],
       methods: ["GET", "POST"]
     }
   });
   ```
3. Push that change to Github. Render will auto-deploy the change.

You now have a fully scalable, enterprise-grade Industrial Digital Twin live on the internet!
