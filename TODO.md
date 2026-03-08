# IronWatch Console - Future Improvements & Polish

This file tracks the upcoming visual, functional, and architectural improvements for the IronWatch project.

---

## 0. Deployment (ON HOLD)
- [x] **Render Backend:** Deployed successfully as `Iron Watch Engine` (Node runtime).
- [ ] **Vercel Frontend:** Deployment blocked — Vercel's build container fails to resolve the `@ironwatch/db` workspace package even with `file:` protocol and `transpilePackages` workarounds.
  - **Root Cause:** Vercel's pnpm monorepo support with custom Root Directories (`apps/web`) does not reliably copy or symlink sibling workspace packages (`packages/db`) into the build container, despite enabling "Include source files outside of Root Directory".
  - **Attempted Fixes:** `vercel.json` overrides, `workspace:*` → `file:` protocol, `transpilePackages`, pre-compiling `@ironwatch/db` with `tsc`. All resolved locally but failed on Vercel's CI.
  - **Next Steps:** Consider flattening the monorepo for Vercel (inline Prisma into `apps/web`), or use a Turborepo-aware Vercel setup, or deploy the frontend elsewhere (e.g., Netlify, Cloudflare Pages).
- [ ] **CORS Configuration:** Once frontend is live, lock down `origin: "*"` in the backend to only allow the Vercel domain.
- [ ] **Environment Variables:** `NEXT_PUBLIC_SOCKET_URL` and `DATABASE_URL` are ready; just need a working Vercel project to apply them.

---

## 1. 3D Engine & Visual Clarity
- [x] **Path Rendering:** Draw physical line meshes (e.g., using `@react-three/drei`'s `<Line />`) along Bezier curves to visualize active asset trajectories.
- [x] **Zone Definition:** Add floating text labels above zones using `<Html>` or `<Text>` helpers so zone names are visible in the 3D scene.
- [x] **Lighting & Shadows:** Introduce soft shadows, ambient occlusion (SSAO), and directional sun lighting for a more grounded, realistic scene.
- [x] **Animations:** Implement `useFrame` linear interpolation (lerping) so assets glide smoothly between 1-second ticks instead of snapping to new positions.
- [ ] **Asset Models:** Replace geometric primitives (boxes/cylinders for forklifts, capsules for workers) with actual `.gltf` or `.glb` 3D models.
- [ ] **Advanced Environment:** Texture the floor, add simple warehouse rack geometry for scale, and implement post-processing Bloom for glowing emissive materials.
- [ ] **Heatmap Mode:** Overlay a 2D density heatmap on the ground to visualize physical areas with the highest frequent path traversals or event triggers.
- [ ] **Camera Presets:** Add quick-switch camera angles (top-down, isometric, follow-asset) with smooth animated transitions.
- [ ] **Skybox / HDR Lighting:** Add an industrial HDR environment map for realistic reflections on metallic asset surfaces.

---

## 2. Frontend Polish & UI/UX Improvements
- [x] **App Branding:** Remove Next.js default `favicon.ico` and create a custom IronWatch logo. Update `<title>` and metadata in `layout.tsx`.
- [x] **Loading States:** Add `<Suspense>` loaders and a progress bar (like `@react-three/drei`'s `<Loader>`) while the 3D WebGL context initializes.
- [x] **Dark Mode Refinement:** Standardize Tailwind `zinc` shades across components for optimal contrast and legibility.
- [x] **Responsive Design:** Ensure the 65/35 split view collapses gracefully into a vertical layout on smaller screens or tablets.
- [x] **Clean Up:** Remove unused Next.js boilerplate code and default styling assets that are no longer needed.
- [ ] **Remove Next.js Defaults:** Strip out any remaining default Next.js pages, fonts, or styles (e.g., Geist font imports, default CSS variables) that don't match the IronWatch brand.
- [ ] **Interactive Asset Sidebar:** A sleek drawer on the right side listing all active Forklifts/Workers. Hovering over a list item highlights them in 3D and shows live telemetry.
- [ ] **Historical Timeline Scrubber:** A floating action bar at the UI bottom to manually "rewind" and replay the simulation state from 5, 10, or 60 minutes ago.
- [ ] **Chart Expansion:** Fully integrate `Recharts` into the dashboard views for historical trends (e.g., "events per hour" or "yield history").
- [ ] **Toast Notifications:** Add elegant toast pop-ups for real-time alerts (zone breaches, obstacle detections) instead of relying solely on the event feed.
- [ ] **Keyboard Shortcuts:** Add hotkeys for common actions (e.g., `R` to reset camera, `Space` to pause simulation, `1-5` for camera presets).
- [ ] **Onboarding / Empty States:** Show a helpful placeholder or animation when no data is available (e.g., before the simulation engine connects).

---

## 3. Simulation Engine Refinement
- [ ] **Database Batching:** Implement Prisma batch insert logic in the Simulation Engine to save telemetry snapshots securely in bulk, saving database compute.
- [ ] **Collision Detection Engine:** Move random event generation logic to a mathematical bounding-box intersection check on the Node.js server to detect when workers enter exclusion zones.
- [ ] **Simulated Traffic:** Expand the `PathFinder` script with basic steering behaviors or obstacle avoidance so forklifts don't pass through one another.
- [ ] **Realistic Movement Profiles:** Add acceleration/deceleration curves to assets instead of constant-speed linear motion. Forklifts should slow down at turns and stops.
- [ ] **Dynamic Asset Spawning:** Allow the simulation to randomly add/remove assets over time to simulate shift changes or equipment availability.
- [ ] **Event Severity Levels:** Categorize events (INFO, WARNING, CRITICAL) with distinct visual and audio cues in both the 3D scene and the dashboard.
- [ ] **Configurable Simulation Parameters:** Expose tick rate, asset count, zone boundaries, and event probability as environment variables or admin settings.

---

## 4. Backend & System Architecture
- [ ] **Authentication Guardrails:** Add Next.js middleware guards to immediately redirect non-admin JWT tokens away from `/assets` and `/zones` configuration pages.
- [ ] **API Rate Limiting:** Add basic rate limiting to the Express server to prevent abuse of the health-check and WebSocket endpoints.
- [ ] **Telemetry Cleanup Cron:** Implement automatic deletion of telemetry data older than 7 days to stay within Neon free-tier storage limits.
- [ ] **WebSocket Reconnection:** Add exponential backoff reconnection logic to the frontend `useSocket` hook for resilience against Render cold starts.
- [ ] **Error Monitoring:** Integrate a free error tracking service (e.g., Sentry free tier) to capture and alert on production errors.
