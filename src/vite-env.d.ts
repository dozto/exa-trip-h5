/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRIP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
