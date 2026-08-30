/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_GATEWAY_URL: string;
  readonly VITE_SEARCH_API_URL: string;
  readonly VITE_WEB_RETRIEVAL_API_URL: string;
  readonly VITE_PRIVACY_GATEWAY_URL: string;
  readonly VITE_SECURITY_API_URL: string;
  readonly VITE_AUTH_API_URL: string;
  readonly VITE_USE_MOCK_SERVICES: string;
  readonly VITE_USE_MOCK_AI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}