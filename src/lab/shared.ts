import { useEffect } from "react";
import { projects } from "../projects.ts";

export const directions = [
  { slug: "quiet", name: "quiet internet", line: "a plain page that rewards curiosity." },
  { slug: "studio", name: "studio", line: "art-directed, with type that stretches." },
  { slug: "desktop", name: "index of /", line: "the site as a folder you can browse." },
  { slug: "day", name: "a day", line: "the tools placed inside an ordinary day." },
  { slug: "os", name: "goodstuff os", line: "a little desktop where every app works." },
  { slug: "devices", name: "one thing each", line: "every app on its own little gadget." },
  { slug: "os2", name: "goodstuff os 2", line: "the desktop, softer and roomier, with secrets." },
] as const;

/** Per-page setup: title, keep experiments out of search, and a hook for page-level CSS. */
export function useLabPage(slug: string, title: string) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.lab = slug;
    document.title = title;
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.append(robots);
    return () => {
      delete html.dataset.lab;
      robots.remove();
    };
  }, [slug, title]);
}

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Lab-only copy that goes a step further than the homepage list. */
const extra: Record<string, { friction: string; instead: string; host: string }> = {
  hangs: { friction: "texting back and forth", instead: "more time together", host: "hangs.goodstuffstudio.xyz" },
  todo: { friction: "organizing", instead: "more doing", host: "todo.goodstuffstudio.xyz" },
  dropin: { friction: "searching", instead: "more moving", host: "dropin.goodstuffstudio.xyz" },
};

export const labProjects = projects.map((p) => {
  const [more = "", less = ""] = p.description.replace(/\.$/, "").split(", ");
  return { ...p, more, less, ...extra[p.name] };
});

export const principles = [
  { title: "for real life", body: "the internet should make real life better, not compete with it." },
  { title: "small on purpose", body: "focused tools that do one job without extra complexity." },
  { title: "less friction", body: "take out the little bits that get in the way of what people actually want to do." },
  { title: "a softer kind of technology", body: "useful without being demanding. how it feels matters as much as what it does." },
  { title: "because it should exist", body: "some things get made out of curiosity, for the joy of it. not everything needs to be a business." },
];
