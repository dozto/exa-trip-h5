import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { bootstrapWebApp } from "./bootstrap/web";
import { TripModelRuntimeContext } from "./inbound/web/state/store/runtime-context";
import { AppRouter } from "./inbound/web/routes/router";
import "mapbox-gl/dist/mapbox-gl.css";
import "./inbound/web/styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element '#root' was not found");
}

const tripModelRuntime = bootstrapWebApp();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    tripModelRuntime.dispose();
  });
}

createRoot(rootElement).render(
  <StrictMode>
    <TripModelRuntimeContext.Provider value={tripModelRuntime}>
      <AppRouter />
    </TripModelRuntimeContext.Provider>
  </StrictMode>
);
