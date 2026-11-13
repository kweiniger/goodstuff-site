import { StrictMode, Suspense, lazy, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "./index.css";
import App from "./App.tsx";

// Design experiments. Each loads on its own, so the homepage bundle is unchanged.
const labRoutes: Record<string, () => Promise<{ default: ComponentType }>> = {
  "/lab": () => import("./lab/LabIndex.tsx"),
  "/lab/quiet": () => import("./lab/quiet/Quiet.tsx"),
  "/lab/studio": () => import("./lab/studio/Studio.tsx"),
  "/lab/desktop": () => import("./lab/desktop/Desktop.tsx"),
  "/lab/day": () => import("./lab/day/Day.tsx"),
  "/lab/os": () => import("./lab/os/Os.tsx"),
  "/lab/devices": () => import("./lab/devices/Devices.tsx"),
};

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const load = labRoutes[path];
const Page = load ? lazy(load) : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
);
