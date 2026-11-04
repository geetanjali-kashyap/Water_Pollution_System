
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEV_API_PROXY_TARGET?: string;
  // agar future me aur env vars ho to yaha add kar sakte ho:
  // readonly VITE_SOMETHING_ELSE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
