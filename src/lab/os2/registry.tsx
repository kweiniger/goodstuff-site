import type { ReactNode } from "react";
import type { IconName } from "./icons.tsx";
import { Garden, Sketch } from "./apps/play.tsx";
import { About, Doomscroll, Prefs, Spec, Trash } from "./apps/system.tsx";
import { Dropin, Hangs, Todo } from "./apps/tools.tsx";

/**
 * Every window the desktop can open. To add a mini app or game: write a component
 * (it can call useOs() for toasts, sounds and so on), then add one line here.
 */
export type AppDef = {
  id: string;
  title: string;
  icon: IconName;
  w: number;
  h: number;
  dock?: boolean;
  resizable?: boolean;
  render: () => ReactNode;
};

export const APPS: AppDef[] = [
  { id: "hangs", title: "hangs", icon: "hangs", w: 400, h: 450, dock: true, render: () => <Hangs /> },
  { id: "todo", title: "todo", icon: "todo", w: 360, h: 420, dock: true, render: () => <Todo /> },
  { id: "dropin", title: "dropin", icon: "dropin", w: 380, h: 430, dock: true, render: () => <Dropin /> },
  { id: "garden", title: "garden", icon: "garden", w: 430, h: 420, dock: true, render: () => <Garden /> },
  { id: "sketch", title: "sketch", icon: "sketch", w: 560, h: 440, dock: true, resizable: true, render: () => <Sketch /> },
  { id: "prefs", title: "preferences", icon: "prefs", w: 420, h: 520, dock: true, render: () => <Prefs /> },
  { id: "about", title: "readme.txt", icon: "readme", w: 440, h: 330, render: () => <About /> },
  { id: "spec", title: "about this goodstuff", icon: "spec", w: 340, h: 420, render: () => <Spec /> },
  { id: "trash", title: "trash", icon: "trash", w: 340, h: 300, render: () => <Trash /> },
  { id: "doomscroll", title: "doomscroll.app", icon: "doomscroll", w: 400, h: 210, render: () => <Doomscroll /> },
];

export const appById = Object.fromEntries(APPS.map((a) => [a.id, a])) as Record<string, AppDef>;

/** Things that live on the desktop. "junk" can be dragged into the trash. */
export type DeskItem = { id: string; label: string; icon: IconName; opens: string; junk?: boolean };
export const DESK_ITEMS: DeskItem[] = [
  { id: "readme", label: "readme.txt", icon: "readme", opens: "about" },
  { id: "hangs", label: "hangs", icon: "hangs", opens: "hangs" },
  { id: "todo", label: "todo", icon: "todo", opens: "todo" },
  { id: "dropin", label: "dropin", icon: "dropin", opens: "dropin" },
  { id: "garden", label: "garden", icon: "garden", opens: "garden" },
  { id: "sketch", label: "sketch", icon: "sketch", opens: "sketch" },
  { id: "doomscroll", label: "doomscroll.app", icon: "doomscroll", opens: "doomscroll", junk: true },
];

export const STARTING_TRASH = ["infinite-scroll.app", "dark-patterns/", "engagement-metrics.xls", "red-notification-dots/"];
