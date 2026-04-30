/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace JSX {}

declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_GROQ_MODEL?: string;
  readonly VITE_TOGETHER_API_KEY?: string;
  readonly VITE_HUGGINGFACE_API_KEY?: string;
  readonly VITE_REPLICATE_API_KEY?: string;
  readonly VITE_OPENAI_API_KEY?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
