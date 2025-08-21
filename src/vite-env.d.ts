/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_DATE: string
  readonly VITE_GIT_HASH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
