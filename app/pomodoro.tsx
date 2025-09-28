"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Mode = "focus" | "short" | "long";

const DEFAULTS: Record<Mode, number> = {
  focus: 25,
  short: 5,
  long: 15,
};

const STORAGE_ID = "pomodoro-settings-v1";

function useLocalSettings() {
  const [minutes, setMinutes] = useState<Record<Mode, number>>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ID);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMinutes((m) => ({ ...m, ...parsed }));
      }
    } catch {}
  }, []);

  const update = useCallback((patch: Partial<Record<Mode, number>>) => {
    setMinutes((m) => {
      const next = { ...m, ...patch };
      try {
        localStorage.setItem(STORAGE_ID, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { minutes, update } as const;
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function chime() {
  try {
    type AudioContextConstructor = new (
      contextOptions?: AudioContextOptions
    ) => AudioContext;
    interface AudioWindow extends Window {
      webkitAudioContext?: AudioContextConstructor;
      AudioContext?: AudioContextConstructor;
    }
    const W = window as unknown as AudioWindow;
    const Ctx = W.AudioContext || W.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    o.start();
    o.stop(ctx.currentTime + 0.75);
  } catch {}
}

export default function Pomodoro() {
  const { minutes, update } = useLocalSettings();
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(minutes.focus * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Keep remaining in sync when mode or settings change and timer not running
  useEffect(() => {
    if (!running) setRemaining(minutes[mode] * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes, mode]);

  // Remaining percentage (100 at start -> 0 at end)
  const remainingPct = useMemo(() => {
    const total = minutes[mode] * 60;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  }, [minutes, mode, remaining]);

  const tick = useCallback(() => {
    setRemaining((r) => {
      if (r <= 1) {
        // complete current cycle
        setRunning(false);
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        chime();
        return 0;
      }
      return r - 1;
    });
  }, []);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(tick, 1000);
  }, [running, tick]);

  const pause = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    setRemaining(minutes[mode] * 60);
  }, [minutes, mode, pause]);

  useEffect(() => () => pause(), [pause]);

  const setModeAndReset = (m: Mode) => {
    setMode(m);
    setRunning(false);
    setRemaining(minutes[m] * 60);
  };

  return (
    <div className="max-w-md w-full">
      <h1 className="text-center text-2xl font-semibold mb-6">Pomodoro</h1>

      <div className="flex items-center justify-center gap-2 rounded-2xl border border-[--border]/50 p-1 mb-6">
        {(["focus", "short", "long"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setModeAndReset(m)}
            className={
              "px-4 py-2 rounded-xl text-sm transition-colors " +
              (mode === m
                ? "bg-[--foreground] text-[--background]"
                : "hover:bg-[--foreground]/10")
            }
            aria-pressed={mode === m}
          >
            {m === "focus" ? "Focus" : m === "short" ? "Short" : "Long"}
          </button>
        ))}
      </div>

      <div className="grid place-items-center">
        <div className="size-56 sm:size-64 relative">
          <svg
            viewBox="0 0 100 100"
            className="size-full rotate-[-90deg] text-[--foreground]"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fill-none opacity-20"
              stroke="currentColor"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fill-none transition-[stroke-dashoffset] duration-1000 ease-linear"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={(1 - remainingPct / 100) * (2 * Math.PI * 45)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-5xl tabular-nums font-semibold">
              {format(remaining)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        {running ? (
          <button
            onClick={pause}
            className="px-5 py-2 rounded-xl bg-[--foreground] text-[--background]"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={start}
            className="px-5 py-2 rounded-xl bg-[--foreground] text-[--background]"
          >
            Start
          </button>
        )}
        <button
          onClick={reset}
          className="px-5 py-2 rounded-xl border border-[--border]"
        >
          Reset
        </button>
      </div>

      <details className="mt-8 rounded-2xl border border-[--border]/50 p-4">
        <summary className="cursor-pointer select-none font-medium">Settings</summary>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {(["focus", "short", "long"] as Mode[]).map((m) => (
            <label key={m} className="text-sm">
              <div className="mb-1 capitalize">{m}</div>
              <input
                type="number"
                min={1}
                max={180}
                className="w-full rounded-lg border border-[--border]/60 bg-transparent px-3 py-2"
                value={minutes[m]}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(180, Number(e.target.value)));
                  update({ [m]: v } as Partial<Record<Mode, number>>);
                  if (mode === m && !running) setRemaining(v * 60);
                }}
              />
              <div className="mt-1 text-xs text-[--muted]">min</div>
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
