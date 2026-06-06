import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Volume2, VolumeX, Music } from "lucide-react";
import { TRACKS, trackForPath, type TrackKey } from "@/lib/audio-tracks";

const STORAGE = "betray-audio";
const DEFAULT_VOLUME = 0.28;

type Persist = { muted: boolean; volume: number; enabled: boolean };

function loadPersist(): Persist {
  if (typeof window === "undefined")
    return { muted: false, volume: DEFAULT_VOLUME, enabled: false };
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return { muted: false, volume: DEFAULT_VOLUME, enabled: false, ...JSON.parse(raw) };
  } catch {
    /* noop */
  }
  return { muted: false, volume: DEFAULT_VOLUME, enabled: false };
}

export function AudioController() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<Persist>(() => loadPersist());
  const [currentTrack, setCurrentTrack] = useState<TrackKey>("drift");
  const [phase, setPhase] = useState<"muted" | "playing" | "paused" | "transitioning">(
    "muted",
  );
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Persist
  useEffect(() => {
    if (mounted)
      localStorage.setItem(
        STORAGE,
        JSON.stringify({ muted: state.muted, volume: state.volume, enabled: state.enabled }),
      );
  }, [state, mounted]);

  // Resolve target track from route
  const targetTrack = trackForPath(pathname);

  const clearFade = () => {
    if (fadeRef.current) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  };

  const fadeTo = (target: number, onDone?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    const step = 0.04;
    fadeRef.current = window.setInterval(() => {
      const cur = audio.volume;
      if (Math.abs(cur - target) < step) {
        audio.volume = target;
        clearFade();
        onDone?.();
        return;
      }
      audio.volume = cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step);
    }, 40);
  };

  // Handle track change with crossfade
  useEffect(() => {
    if (!state.enabled || state.muted) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (targetTrack === currentTrack && !audio.paused) return;

    setPhase("transitioning");
    fadeTo(0, () => {
      audio.src = TRACKS[targetTrack].url;
      audio.loop = true;
      audio.volume = 0;
      setCurrentTrack(targetTrack);
      const playPromise = audio.play();
      if (playPromise)
        playPromise
          .then(() => {
            fadeTo(state.volume, () => setPhase("playing"));
          })
          .catch(() => setPhase("paused"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTrack, state.enabled, state.muted]);

  // Volume changes (no transition)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.muted || !state.enabled) {
      fadeTo(0, () => {
        audio.pause();
        setPhase("muted");
      });
    } else if (phase === "paused" || audio.paused) {
      audio.volume = 0;
      audio.play().then(() => fadeTo(state.volume, () => setPhase("playing"))).catch(() => {});
    } else {
      audio.volume = state.volume;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.muted, state.volume, state.enabled]);

  if (!mounted) return null;

  const activate = () => {
    setState((s) => ({ ...s, enabled: true, muted: false }));
    setOpen(true);
  };
  const toggleMute = () => setState((s) => ({ ...s, muted: !s.muted, enabled: true }));

  return (
    <>
      <audio ref={audioRef} preload="auto" aria-hidden="true" />
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
        role="region"
        aria-label="Som ambiente educativo"
      >
        {open && state.enabled && (
          <div className="glass-panel flex w-64 flex-col gap-2 p-3 text-xs">
            <div className="flex items-center gap-2 text-gold">
              <Music className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-semibold">Som ambiente educativo</span>
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground">
              {TRACKS[currentTrack].label}
            </p>
            <label className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="w-12">Volume</span>
              <input
                type="range"
                min={0}
                max={0.6}
                step={0.02}
                value={state.volume}
                aria-label="Volume"
                onChange={(e) => setState((s) => ({ ...s, volume: Number(e.target.value) }))}
                className="flex-1 accent-[color:var(--primary)]"
              />
              <span className="w-8 text-right font-mono">{Math.round(state.volume * 100)}%</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="flex-1 rounded-lg border border-border bg-glass px-2 py-1.5 text-[11px] font-medium hover:bg-panel-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-pressed={state.muted}
              >
                {state.muted ? "Reativar áudio" : "Desativar áudio"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border bg-glass px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={state.enabled ? () => setOpen((o) => !o) : activate}
          aria-label={
            !state.enabled
              ? "Ativar áudio do laboratório"
              : state.muted
                ? "Reativar áudio"
                : "Controles de áudio"
          }
          className={`group inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            state.enabled && !state.muted
              ? "bg-primary/20 text-primary"
              : "bg-panel/80 text-muted-foreground hover:text-foreground"
          }`}
        >
          {state.enabled && !state.muted ? (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {!state.enabled ? "Ativar áudio" : state.muted ? "Som desligado" : "Som ativo"}
          </span>
          {phase === "transitioning" && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden="true" />
          )}
        </button>
      </div>
    </>
  );
}
