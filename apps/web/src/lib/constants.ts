// ─── Socket Connection ───────────────────────────────────────
export const SOCKET_RECONNECT_DELAY_MS = 1000;
export const SOCKET_MAX_RECONNECT_ATTEMPTS = 10;
export const SOCKET_DISCONNECT_TIMEOUT_MS = 30_000; // 30s before showing "Disconnected"

// ─── Alert Feed ──────────────────────────────────────────────
export const ALERT_FEED_MAX_ITEMS = 200;

// ─── Three.js Scene ──────────────────────────────────────────
export const ASSET_LERP_SPEED = 0.15;
export const ASSET_ROTATION_SLERP_SPEED = 0.15;
export const PATH_HISTORY_MAX_POINTS = 20;
export const PATH_MIN_DISTANCE_THRESHOLD = 0.5;

// ─── Event Effects ───────────────────────────────────────────
export const EVENT_EFFECT_LIFESPAN_S = 3; // seconds before effect fades

// ─── Connection Status ───────────────────────────────────────
export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";
