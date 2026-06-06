export type TrackKey = "drift" | "ledger" | "fruit" | "steam" | "pebble";

export const TRACKS: Record<TrackKey, { url: string; label: string }> = {
  drift: {
    url: "/audio/BET-RAY Drift.mp3",
    label: "BET-RAY Drift — tema do laboratório",
  },
  ledger: {
    url: "/audio/Quiet Ledger.mp3",
    label: "Quiet Ledger — clima analítico",
  },
  fruit: {
    url: "/audio/Spinning Fruit Study.mp3",
    label: "Spinning Fruit Study — giro dos símbolos",
  },
  steam: {
    url: "/audio/Steam Scale Loop.mp3",
    label: "Steam Scale Loop — medida do café",
  },
  pebble: {
    url: "/audio/Measured Pebble Loop.mp3",
    label: "Measured Pebble Loop — quantos cabem",
  },
};

export function trackForPath(pathname: string): TrackKey {
  if (pathname.startsWith("/experiments/symbols")) return "fruit";
  if (pathname.startsWith("/experiments/coffee")) return "steam";
  if (pathname.startsWith("/experiments/capacity")) return "pebble";
  if (
    pathname.startsWith("/ledger") ||
    pathname.startsWith("/report") ||
    pathname.startsWith("/sources")
  )
    return "ledger";
  return "drift";
}
