import { createContext, useContext } from "react";
import type { SoundKind } from "./sound.ts";

/** What every mini app can ask the desktop to do. */
export type OsApi = {
  open: (id: string) => void;
  close: (id: string) => void;
  toast: (message: string) => void;
  play: (kind: SoundKind) => void;
  wallpaper: string;
  setWallpaper: (id: string) => void;
  setSketchWallpaper: (dataUrl: string) => void;
  sound: boolean;
  setSound: (on: boolean) => void;
  trash: string[];
  trashItem: (label: string) => void;
  emptyTrash: () => void;
  resetDesktop: () => void;
};

export const OsContext = createContext<OsApi | null>(null);

export function useOs() {
  const api = useContext(OsContext);
  if (!api) throw new Error("useOs must be used inside goodstuff os 2");
  return api;
}

/** localStorage that never throws (private windows, blocked storage). */
export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* fine without it */
    }
  },
  clear(prefix: string) {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(prefix))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  },
};
