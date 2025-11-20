/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Configuración de Supabase
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  
  // Configuración de la aplicación
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_BASE_URL: string
  
  // Configuración de debug
  readonly VITE_DEBUG: string
  readonly VITE_LOG_LEVEL: string
  
  // Variables heredadas (por compatibilidad)
  readonly VITE_TENANT_ID?: string
  readonly VITE_TENANT_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}