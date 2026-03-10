// ─── Simulation Timing ───────────────────────────────────────
export const SIMULATION_TICK_INTERVAL_MS = 1000;

// ─── Asset Bootstrapping ─────────────────────────────────────
export const ASSET_COUNT_FORKLIFTS = 5;
export const ASSET_COUNT_WORKERS = 5;

// ─── Yard Boundaries ─────────────────────────────────────────
export const YARD_BOUNDARY = 40; // assets spawn within ±YARD_BOUNDARY
export const YARD_DESTINATION_RANGE = 40; // path destinations within ±range

// ─── Path Generation ─────────────────────────────────────────
export const PATH_CURVE_STEPS = 20; // bezier curve resolution (20 steps ≈ 20s travel)
export const PATH_CONTROL_POINT_JITTER = 2.5; // random offset for control points

// ─── Event Probabilities (per tick, per asset) ───────────────
export const OBSTACLE_EVENT_PROBABILITY = 0.01; // 1% chance per tick per active asset
export const BREACH_EVENT_PROBABILITY = 0.005; // 0.5% chance per tick per active asset
export const BREACH_DETECTION_RADIUS = 5; // units — how close to an exclusion zone triggers a breach

// ─── Telemetry ───────────────────────────────────────────────
export const MAX_TELEMETRY_BATCH_SIZE = 50;
