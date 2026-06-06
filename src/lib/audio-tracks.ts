import drift from "@/assets/audio/bet-ray-drift.mp3.asset.json";
import ledger from "@/assets/audio/quiet-ledger.mp3.asset.json";
import pebble from "@/assets/audio/measured-pebble-loop.mp3.asset.json";
import steam from "@/assets/audio/steam-scale-loop.mp3.asset.json";
import fruit from "@/assets/audio/spinning-fruit-study.mp3.asset.json";

export type TrackKey = "drift" | "ledger" | "fruit" | "steam" | "pebble";

export const TRACKS: Record<TrackKey, { url: string; label: string }> = {
  drift: { url: drift.url, label: "BET-RAY Drift — tema do laboratório" },
  ledger: { url: ledger.url, label: "Quiet Ledger — clima analítico" },
  fruit: { url: fruit.url, label: "Spinning Fruit Study — giro dos símbolos" },
  steam: { url: steam.url, label: "Steam Scale Loop — medida do café" },
  pebble: { url: pebble.url, label: "Measured Pebble Loop — quantos cabem" },
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
