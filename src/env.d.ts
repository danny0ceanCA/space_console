/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MATH_SYSTEM_PROMPT?: string;
  readonly VITE_EXPLORATION_SYSTEM_PROMPT?: string;
  readonly VITE_RESEARCH_SYSTEM_PROMPT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
