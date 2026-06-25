/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRIP_ID?: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
