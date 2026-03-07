# IronWatch Console - Future Improvements & Polish

This file tracks the upcoming visual, functional, and architectural improvements for the IronWatch project.

## 1. 3D Engine & Visual Clarity
- [ ] **Asset Models:** Replace geometric primitives (boxes/cylinders for forklifts, capsules for workers) with actual `.gltf` or `.glb` 3D models.
- [x] **Path Rendering:** Draw physical line meshes (e.g., using `@react-three/drei`'s `<Line />`) along Bezier curves to visualize active asset trajectories.
- [x] **Zone Definition:** Add floating text labels above zones using `<Html>` or `<Text>` helpers so zone names are visible in the 3D scene.
- [x] **Lighting & Shadows:** Introduce soft shadows, ambient occlusion (SSAO), and directional sun lighting for a more grounded, realistic scene.
- [x] **Animations:** Implement `useFrame` linear interpolation (lerping) so assets glide smoothly between 1-second ticks instead of snapping to new positions.
- [ ] **Advanced Environment:** Texture the floor, add simple warehouse rack geometry for scale, and implement post-processing Bloom for glowing emissive materials.
- [ ] **Heatmap Mode:** Overlay a 2D density heatmap on the ground to visualize physical areas with the highest frequent path traversals or event triggers.

## 2. Frontend Polish & UI Improvements
- [x] **App Branding:** Remove Next.js default `favicon.ico` and create a custom IronWatch logo. Update `<title>` and metadata in `layout.tsx`.
- [x] **Loading States:** Add `<Suspense>` loaders and a progress bar (like `@react-three/drei`'s `<Loader>`) while the 3D WebGL context initializes.
- [x] **Dark Mode Refinement:** Standardize Tailwind `zinc` shades across components for optimal contrast and legibility.
- [x] **Responsive Design:** Ensure the 65/35 split view collapses gracefully into a vertical layout on smaller screens or tablets.
- [ ] **Interactive Asset Sidebar:** A sleek, fully opaque (NO glass-morphism or transparency) drawer on the right side listing all active Forklifts/Workers. Hovering over a list item highlights them in 3D and shows live telemetry.
- [ ] **Historical Timeline Scrubber:** A floating action bar at the UI bottom to manually "rewind" and replay the simulation state from 5, 10, or 60 minutes ago.
- [ ] **Chart Expansion:** Fully integrate `Recharts` into the dashboard views for historical trends (e.g., "events per hour" or "yield history").
- [x] **Clean Up:** Remove unused Next.js boilerplate code and default styling assets that are no longer needed.

## 3. Future Backend & System Architecture
- [ ] **Database Batching:** Implement Prisma batch insert logic in the Simulation Engine to save telemetry snapshots securely in bulk, saving database compute.
- [ ] **Authentication Guardrails:** Add Next.js middleware guards to immediately redirect non-admin JWT tokens away from `/assets` and `/zones` configuration pages.
- [ ] **Collision Detection Engine:** Move random event generation logic to a mathematical bounding-box intersection check on the Node.js server to detect when workers enter exclusion zones.
- [ ] **Simulated Traffic:** Expand the `PathFinder` script with basic steering behaviors or obstacle avoidance so forklifts don't pass through one another.
