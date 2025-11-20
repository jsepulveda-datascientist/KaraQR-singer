/**
 * Configuración de entornos para Supabase
 */
const environments = {
  development: {
    supabase: {
      url: 'https://sphllmtaepeeiozqljsb.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaGxsbXRhZXBlZWlvenFsanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODYxNjMsImV4cCI6MjA3ODE2MjE2M30.ekXTrCSUw-SNZL1_8KJLnYmdgS_pnLmBeTK1Bwr1lss'
    },
    baseUrl: 'http://localhost:9002'
  },
  production: {
    supabase: {
      url: 'https://sphllmtaepeeiozqljsb.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaGxsbXRhZXBlZWlvenFsanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODYxNjMsImV4cCI6MjA3ODE2MjE2M30.ekXTrCSUw-SNZL1_8KJLnYmdgS_pnLmBeTK1Bwr1lss'
    },
    baseUrl: 'https://karaqr.pages.dev'
  },
  staging: {
    supabase: {
      url: 'https://sphllmtaepeeiozqljsb.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaGxsbXRhZXBlZWlvenFsanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODYxNjMsImV4cCI6MjA3ODE2MjE2M30.ekXTrCSUw-SNZL1_8KJLnYmdgS_pnLmBeTK1Bwr1lss'
    },
    baseUrl: 'https://staging.karaqr.com'
  }
}

/**
 * Detectar entorno actual
 */
const getEnvironment = (): keyof typeof environments => {
  const mode = import.meta.env.MODE || 'development'
  const isDev = import.meta.env.DEV
  const isProd = import.meta.env.PROD
  
  if (isProd) return 'production'
  if (mode === 'staging') return 'staging'
  return 'development'
}

const currentEnv = getEnvironment()
const envConfig = environments[currentEnv]

/**
 * Configuración de la aplicación
 * Prioridad: Variables de entorno > Configuración por entorno > Defaults
 */
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || envConfig.supabase.url,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || envConfig.supabase.anonKey
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'KaraQR Singer',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    baseUrl: import.meta.env.VITE_BASE_URL || envConfig.baseUrl,
    environment: currentEnv
  },
  tenant: {
    // No hay tenant por defecto - viene del QR escaneado
    // El tenant se almacena dinámicamente en localStorage
    storageKey: 'karaqr_current_tenant'
  },
  debug: {
    enabled: import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info'
  }
}

/**
 * Ejemplos de configuración por variables de entorno:
 * 
 * .env.development:
 * VITE_SUPABASE_URL=https://sphllmtaepeeiozqljsb.supabase.co
 * VITE_SUPABASE_ANON_KEY=your_anon_key_here
 * VITE_BASE_URL=http://localhost:9002
 * VITE_DEBUG=true
 * 
 * .env.production:
 * VITE_SUPABASE_URL=https://sphllmtaepeeiozqljsb.supabase.co
 * VITE_SUPABASE_ANON_KEY=your_anon_key_here
 * VITE_BASE_URL=https://karaqr.pages.dev
 * VITE_DEBUG=false
 * 
 * .env.staging:
 * VITE_SUPABASE_URL=https://sphllmtaepeeiozqljsb.supabase.co
 * VITE_SUPABASE_ANON_KEY=your_anon_key_here
 * VITE_BASE_URL=https://staging.karaqr.com
 * 
 * URLs de la aplicación:
 * - http://localhost:9002/?tenant=basement
 * - http://localhost:9002/anotarse?tenant=bar-central
 * - http://localhost:9002/reacciones?tenant=pub-los-amigos
 * 
 * El parámetro 'tenant' se mantiene en toda la navegación
 */

/**
 * Helper para logs con configuración
 */
export const logger = {
  log: (...args: any[]) => {
    if (config.debug.enabled) {
      console.log('[KaraQR Singer]', ...args)
    }
  },
  error: (...args: any[]) => {
    console.error('[KaraQR Singer]', ...args)
  },
  warn: (...args: any[]) => {
    if (config.debug.enabled) {
      console.warn('[KaraQR Singer]', ...args)
    }
  },
  info: (...args: any[]) => {
    if (config.debug.enabled) {
      console.info('[KaraQR Singer]', ...args)
    }
  }
}

export default config