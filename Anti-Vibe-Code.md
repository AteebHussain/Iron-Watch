# IronWatch — How to Not Look Vibe-Coded
### A practical reference for writing, designing, and shipping like a senior dev

---

## What "Vibe-Coded" Actually Means

Vibe-coded apps share a recognizable fingerprint: a 3D scene that only renders correctly on the happy path, WebSocket connections that silently die and never recover, dashboards that show stale data with no indication, and simulation engines copy-pasted from AI without the author understanding a single line. IronWatch is a complex, multi-service, real-time application. The goal of this guide is to make it look and feel like it was built by someone who has shipped production software before — because you have.

---

## 1. Code Quality

### Name things like you mean it
Vague names are the fastest signal that code was generated and never reviewed.

```
❌ const data = await fetchAssets()
✅ const activeYardAssets = await fetchAssetsByStatus('ACTIVE')

❌ function handleEvent()
✅ function handleObstacleDetected(assetId: string, position: Vector3)

❌ const pos = engine.getPos(id)
✅ const currentPosition = simulationEngine.getAssetPosition(assetId)
```

### No magic numbers
Every hardcoded value that appears more than once belongs in `lib/utils/constants.ts`.

```
❌ if (Date.now() - lastTick > 1000) runTick()
✅ if (Date.now() - lastTick > SIMULATION_TICK_INTERVAL_MS) runTick()

❌ setInterval(emit, 1000)
✅ setInterval(emit, SOCKET_EMIT_INTERVAL_MS)
```

Constants worth defining: `SIMULATION_TICK_INTERVAL_MS`, `BREACH_DETECTION_RADIUS`, `MAX_TELEMETRY_BATCH_SIZE`, `SOCKET_RECONNECT_DELAY_MS`, `PLAYBACK_DEFAULT_SPEED`, `YARD_GRID_SIZE`.

### TypeScript — use it properly
Do not use `any`. If you're tempted to write `as any`, write the actual type. Every entity in the system — assets, zones, events, snapshots, socket payloads — should have a named interface in `types/index.ts`. This file is the contract between your frontend and backend.

```
❌ socket.on('yard:update', (data: any) => updateScene(data))
✅ socket.on('yard:update', (snapshot: YardSnapshot) => updateScene(snapshot))
```

### Functions do one thing
If a function is longer than ~40 lines, it is doing too much. The simulation engine especially — `SimulationEngine.ts` should orchestrate, not implement. Breach detection, path recalculation, and event generation all live in their own modules.

### No dead code
No commented-out blocks. No `// TODO: fix this later` left for weeks. No unused socket event listeners. Run ESLint before every commit.

### Consistent async handling
Pick `async/await` with `try/catch` and stick to it everywhere. Do not mix `.then()` chains and `await` in the same codebase. The simulation engine and all API routes should follow the same pattern.

---

## 2. Component Architecture

### Every component has one job
`YardCanvas.tsx` mounts and manages the Three.js scene. It does not process socket events. It does not call the database. It does not manage alert state. The hook layer (`useSocket`, `useYardState`) handles data. The component handles rendering.

### Separate Three.js logic from React completely
Three.js mesh updates must never go through React state. If a forklift position update triggers a React re-render, you have an architecture problem. Use `useRef` for the scene, and update mesh positions directly in the socket handler.

```
❌ const [assetPositions, setAssetPositions] = useState<Record<string, Vector3>>({})
✅ meshRef.current[assetId].position.set(x, y, z) // direct mutation, no re-render
```

### Props should be typed and minimal
If you are passing more than 5–6 props to a component, it either needs to be split or should read from a shared state hook. `KPICard`, `AlertFeed`, and `AssetStatusTable` should be lean — they receive data, they render it.

### Keep components in the right folder
`components/yard/` for Three.js-related files. `components/dashboard/` for panel components. `components/playback/` for timeline UI. Do not dump new components into the root `components/` folder.

---

## 3. State Management

### Understand what state belongs where
There are three categories of state in IronWatch and they should never be mixed:

- **Three.js scene state** — mesh positions, event effects. Lives in refs. Never in React state.
- **Real-time dashboard state** — alert feed, KPI counters, asset statuses. Lives in React state via `useYardState`.
- **Server/DB state** — zones, historical telemetry, alert log. Fetched via API routes, cached locally.

### Local state for local concerns
Whether an alert row is expanded, whether the sidebar is collapsed, whether a tooltip is visible — these stay in `useState` in the relevant component. They do not belong in any shared state.

### Socket events are not the same as UI events
A `yard:update` socket event should update Three.js meshes directly and update a lightweight ref-based counter. It should not trigger a full React re-render every second. Design the data flow accordingly.

---

## 4. Error Handling — The Biggest Tell

This is where most vibe-coded real-time apps fall apart completely. IronWatch has multiple failure surfaces. Every one of them needs handling.

### The Socket.io connection must handle failure gracefully
- Connection lost: show a "Reconnecting..." badge in the topbar — not silence
- Reconnected: resume live updates, show "Live" status restored
- Connection never established: show a clear fallback state in the yard panel

```
❌ The 3D yard just freezes with no explanation
✅ Topbar badge turns amber: "Reconnecting to live feed..."
✅ Topbar badge turns red after 30s: "Connection lost. Reload to retry."
```

### API errors need real handling
When an API route fails — for zones, assets, alerts, telemetry — show a specific error state in the relevant panel. Not a spinner that runs forever. Not a blank panel. A clear message with a retry option.

### The three states every async operation needs
Every fetch, every socket event handler, every DB write — needs a **loading state**, a **success state**, and an **error state**. If you have written a fetch and only handled success, you are not done.

### The simulation engine must not crash silently
Wrap the tick loop in a `try/catch`. Log errors. Restart the tick if it throws. A crashed simulation engine with no recovery means a frozen yard for every connected client until the server restarts.

```
❌ setInterval(() => engine.tick(), SIMULATION_TICK_INTERVAL_MS)
✅ setInterval(async () => {
     try { await engine.tick() }
     catch (err) { logger.error('Tick failed:', err) }
   }, SIMULATION_TICK_INTERVAL_MS)
```

### Azure SQL connection failures
Free tier has limited concurrency. Telemetry writes will sometimes fail. Write telemetry in batches, not on every tick per asset. Wrap every DB write in a try/catch and fail silently — a failed snapshot write should never crash the simulation.

---

## 5. UI & Visual Polish

### The dark theme must be intentional
Define your color palette in `tailwind.config.ts` with semantic names. Never scatter raw Tailwind color classes without a system.

```
❌ bg-gray-900, bg-gray-800, bg-zinc-900 used interchangeably
✅ bg-surface, bg-surface-elevated — defined once, used everywhere
```

Palette to define:
- `color-surface` — main background
- `color-surface-elevated` — cards, panels
- `color-surface-border` — panel borders, dividers
- `color-text-primary` / `color-text-muted`
- `color-accent` — interactive highlights
- `color-success` / `color-warning` / `color-danger` — status colors
- `color-severity-low` / `color-severity-med` / `color-severity-high` — alert severity

### Spacing must be consistent
Use Tailwind's spacing scale systematically. Don't mix `p-3`, `p-[14px]`, and inline `padding: 12px` for equivalent elements. Pick one spacing unit for cards, one for panel padding, one for inline gaps — and apply them everywhere.

### Typography has a hierarchy
Three sizes, used consistently:
- **Labels** — zone names, asset badges, table column headers
- **Body** — alert messages, descriptions, metadata
- **Headings** — panel titles, page headers, KPI values

### Empty states are not optional
Every panel that can be empty needs a designed empty state.

```
Alert feed (no alerts yet):
→ "No alerts. The yard is running clean." ← with a subtle green indicator

Asset status table (no assets loaded):
→ "No assets found. Check your database seed."

Playback timeline (no snapshots for selected window):
→ "No telemetry recorded for this time window. Try a different range."
```

### Loading states must communicate shape
Use skeleton loaders for panels with known structure — KPI cards, the asset status table, the alert feed. A skeleton communicates "content is loading here." A spinner communicates nothing about what is coming.

### Every interactive element needs hover and focus states
Every button, every alert row, every zone in the 3D yard that is clickable. If it does something, it should look like it does something before you click it.

### The connection status indicator is not optional polish
A real-time app that shows no connection status looks broken. The topbar must always show one of three states clearly: **Live** (green), **Reconnecting** (amber), **Disconnected** (red).

---

## 6. The 3D Yard Specifically

### First load must be impressive
The yard is the hero of this application. Camera angle, lighting, and zone colors determine whether a recruiter keeps watching. Spend real time on these three things before building anything else in the scene.

- Camera: top-angled, slightly tilted — not a flat top-down view
- Lighting: one warm directional light, one cool ambient fill — gives depth
- Zone colors: muted but distinct — SCRAP in grey, LOADING in blue, PARKING in green, EXCLUSION in red

### Asset movement must feel believable
Forklifts should move at realistic speeds. They should pause briefly at destinations. They should not teleport between positions. Lerp between socket position updates instead of snapping.

```
❌ mesh.position.set(newX, newY, newZ) // instant teleport
✅ mesh.position.lerp(targetPosition, ASSET_LERP_SPEED) // smooth interpolation
```

### Zone meshes must be readable
Zones are flat box geometries with semi-transparent materials. They need enough opacity to be visible but not so much that they obscure assets moving through them. Add a slightly brighter border edge. Label each zone with a text sprite.

### Event effects must be clear but not distracting
- Obstacle detected: a red ring expands from the collision point and fades over ~1.5 seconds
- Zone breach: the breached zone pulses red while the breach is active, returns to normal when cleared
- Reroute: a thin dashed line briefly traces the new path and fades

None of these effects should loop or persist longer than needed. They communicate an event, they don't decorate the scene.

### OrbitControls must be constrained
Unconstrained orbit means a recruiter can spin the camera to a completely unusable angle. Set `minPolarAngle` and `maxPolarAngle` to keep the view between top-down and eye-level. Set a reasonable `minDistance` and `maxDistance` for zoom.

### Playback mode must look different from live mode
When the yard is in playback mode, this must be visually obvious — a banner, a different topbar color, a watermark. A recruiter should never be confused about whether they are watching live or recorded data.

---

## 7. The Simulation Engine

### You must understand every line of it
The engine will be AI-generated. That is fine. But in every interview, you will be asked how it works. You need to be able to explain: the tick loop, why bezier curves were chosen for paths, how breach detection works geometrically, how the event probability system is tuned, and how the engine ties into Socket.io. Read every file. Ask AI to explain any part you don't follow. Own it.

### The tick loop is the heartbeat — treat it seriously
The tick fires every second. It moves assets, checks for breaches, probabilistically fires events, emits to clients, and writes to the database. Each of these is a failure surface. Each needs its own error handling so that one failure does not cascade into others.

### Telemetry writes must be batched
Writing one DB row per asset per tick means 7 writes per second at minimum. On Azure SQL free tier this will cause problems quickly. Batch snapshots and write every 5–10 seconds instead. Playback resolution of 5 seconds is perfectly acceptable and far more stable.

### Event probability must be tunable
Define event probabilities in `constants.ts`, not hardcoded in `EventGenerator.ts`. When you are doing your Loom walkthrough, you want to be able to dial up event frequency for a more interesting demo without digging through simulation logic.

```
OBSTACLE_EVENT_PROBABILITY = 0.02   // 2% chance per tick per asset
BREACH_DURATION_MS = 8000           // how long a breach stays active
REROUTE_DELAY_MS = 1500             // delay before new path is calculated
```

---

## 8. The Playback Feature

### This is your differentiator — it must work flawlessly
Most dashboard projects don't have playback. It shows systems thinking. It must work on demo day without hesitation. Test it on at least three different time windows before you call it done.

### The timeline scrubber must feel responsive
Scrubbing to a position should update the yard within 200ms. Pre-fetch the snapshot window when the user selects a time range — don't wait for them to press play.

### Live vs playback state must be explicit everywhere
- Topbar: "Playback Mode — 14 Mar 2025, 09:30–10:00" instead of connection status
- Yard canvas: a subtle overlay or banner indicating playback
- All dashboard panels: frozen or showing historical data for the selected window — not live updating

### Speed controls must actually work
1x, 2x, and pause are the minimum. Test each one. A playback feature that stutters at 2x or breaks on pause is worse than no playback feature.

---

## 9. The Role System

### Enforce roles at middleware, not just UI
Hiding a nav link is not access control. Every protected API route must check the session role server-side. Every protected page must redirect in `middleware.ts`. A viewer navigating directly to `/assets` should get a 403 — not an empty page, not a crash.

### Seed accounts make demos effortless
Three accounts, one per role, with obvious credentials. Document them in your README. Every recruiter who opens your project should be able to log in as all three roles in under a minute.

```
admin@ironwatch.dev    / admin123
operator@ironwatch.dev / operator123
viewer@ironwatch.dev   / viewer123
```

### The role badge in the topbar is not decoration
It communicates to a recruiter watching your demo that the role system is real. Make it visually distinct per role — ADMIN in amber, OPERATOR in blue, VIEWER in grey.

---

## 10. Git Hygiene

This is visible to every recruiter who clicks your GitHub.

### Commit messages tell a story
```
❌ "fix stuff"
❌ "wip"
❌ "changes"
❌ feat: add SSE streaming for real-time model responses
❌ fix: restore token count from done event in stream handler
❌ refactor: extract OpenRouter streaming logic into standalone function

✅ Removed light theme and clean up globals.css
✅ Applied Set 3 color palette across all components
```

Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

### The README is a product page
It should include: a screenshot or GIF of the live yard, a one-paragraph description of what IronWatch is, a live demo link, login credentials for all three roles, a run-locally section with copy-pasteable commands, and a brief architecture section explaining the Vercel + Render + Azure SQL split. Someone should understand what IronWatch is and want to try it within 60 seconds of landing on the repo.

### No secrets in the repo
Add `.env.local` and `.env` to `.gitignore` before your first commit. Add `.env.example` files in both `apps/web` and `apps/server` with key names and no values.

### The `.env.example` files are documentation
```
# apps/web/.env.example
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_SOCKET_URL=

# apps/server/.env.example
DATABASE_URL=
PORT=
FRONTEND_URL=
```

---

## 11. Performance

### Three.js rendering must stay at 60fps
The animation loop runs every frame. Socket updates fire every second. These must not interfere. Update mesh positions in the socket handler. Let the animation loop read those positions on the next frame. Never block the animation loop with async operations.

### Don't re-render React on every socket tick
The `yard:update` event fires every second. If this triggers a React re-render, your dashboard panels will flicker and your KPI cards will stutter. Only pass new data to React state when the values actually change — debounce or diff before setting state.

### The alert feed needs a cap
An unbounded alert feed that stores every event since app load will eventually cause memory and render performance issues. Cap the in-memory feed at a reasonable size (200–500 items). Older alerts are still available on the `/alerts` page via the database.

### Prisma queries need to be indexed
The two most frequent queries are telemetry reads for playback and event reads for the alert log. Both need proper indexes. `TelemetrySnapshots` must be indexed on `(asset_id, timestamp)`. `Events` must be indexed on `timestamp` and `zone_id`. Do not skip this — free tier Azure SQL is slow enough without full table scans.

---

## 12. Pre-Launch Checklist

Before you share the link, verify every item:

- [ ] Tested on Chrome, Firefox, and Edge
- [ ] All three role accounts work on production
- [ ] Socket reconnection works — kill the Render server and watch the topbar recover
- [ ] Playback works on at least three different historical windows
- [ ] All three async states handled everywhere (loading / success / error)
- [ ] No console errors or warnings in production build
- [ ] Alert acknowledge works for admin and operator, blocked for viewer
- [ ] Admin pages blocked from operator and viewer via middleware
- [ ] cron-job.org is active and Render has not spun down
- [ ] README has live link, screenshots, and seed credentials
- [ ] No `.env` files in the repo
- [ ] Loom walkthrough recorded and linked in README

---

## The Single Most Important Rule

Build the unhappy path before you call any feature done.

What happens when the Socket.io connection drops mid-demo? What happens when Azure SQL rejects a telemetry write? What happens when a recruiter scrubs the playback timeline to a window with no data? What happens when the simulation engine throws on a malformed asset position?

Every feature that only works on the happy path is half a feature. A real-time industrial monitoring console that handles failure gracefully signals more to a recruiter than one with twice as many features that freezes on the first network hiccup.
