/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace JSX {}

declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_API_BASE_URL?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
