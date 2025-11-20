# 🔧 Configuración de API - KaraQR Singer

Este documento explica cómo configurar las URLs base y otros parámetros de la aplicación KaraQR Singer.

## 📋 Variables de Entorno

### 🔌 API Configuration
| Variable | Descripción | Default | Ejemplo |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | URL base de la API | `http://localhost:3000/api` | `https://api.karaqr.com/api` |
| `VITE_API_TIMEOUT` | Timeout de requests (ms) | `10000` | `15000` |

### 🏢 Tenant Configuration  
| Variable | Descripción | Default | Ejemplo |
|----------|-------------|---------|---------|
| `VITE_TENANT_ID` | ID del tenant por defecto | `basement` | `bar-central` |
| `VITE_TENANT_NAME` | Nombre del tenant | `Basement` | `Bar Central` |

### 🐛 Debug Configuration
| Variable | Descripción | Default | Ejemplo |
|----------|-------------|---------|---------|
| `VITE_DEBUG` | Habilitar logs debug | `true` (dev), `false` (prod) | `true` |
| `VITE_LOG_LEVEL` | Nivel de logging | `info` | `debug`, `warn`, `error` |

## 🌍 Configuración por Entorno

### 📁 Archivos de Entorno

#### `.env.development`
```bash
# Para desarrollo local
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
VITE_TENANT_ID=basement
VITE_TENANT_NAME=Basement
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

#### `.env.production`
```bash
# Para producción
VITE_API_BASE_URL=https://api.karaqr.com/api
VITE_API_TIMEOUT=15000
VITE_TENANT_ID=basement
VITE_TENANT_NAME=Basement
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

#### `.env.staging`
```bash
# Para testing/staging
VITE_API_BASE_URL=https://api-staging.karaqr.com/api
VITE_API_TIMEOUT=12000
VITE_TENANT_ID=test-tenant
VITE_TENANT_NAME=Test Environment
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### 🚀 Configuraciones Preestablecidas

El sistema incluye configuraciones automáticas por entorno:

```typescript
// Detección automática de entorno
const environments = {
  development: {
    api: { baseUrl: 'http://localhost:3000/api', timeout: 10000 }
  },
  production: {
    api: { baseUrl: 'https://api.karaqr.com/api', timeout: 15000 }
  },
  staging: {
    api: { baseUrl: 'https://api-staging.karaqr.com/api', timeout: 12000 }
  }
}
```

## 🎯 Uso en Diferentes Escenarios

### 🏠 Desarrollo Local

```bash
# No necesitas configurar nada, usa los defaults
npm run dev
# API: http://localhost:3000/api
# Tenant: basement
# Debug: habilitado
```

### 🌐 Desarrollo con API Remota

```bash
# Crear .env.development.local
echo "VITE_API_BASE_URL=https://api-dev.karaqr.com/api" > .env.development.local
npm run dev
```

### 🏗️ Build para Producción

```bash
# Usa automáticamente .env.production
npm run build
# API: https://api.karaqr.com/api
# Debug: deshabilitado
```

### 🧪 Testing con Diferentes APIs

```bash
# Testing rápido con API específica
VITE_API_BASE_URL=http://192.168.1.100:3000/api npm run dev

# Testing con tenant específico
VITE_TENANT_ID=mi-bar VITE_API_BASE_URL=https://mi-api.com/api npm run dev
```

## 🔄 Jerarquía de Configuración

La configuración se aplica en este orden (mayor a menor prioridad):

1. **Variables de entorno del sistema** (runtime)
2. **Archivos .env.local** (no versionados)
3. **Archivos .env.[mode]** (.env.development, .env.production)
4. **Configuración por entorno** (hardcoded en config.ts)
5. **Defaults del sistema**

```bash
# Ejemplo de jerarquía
System ENV > .env.development.local > .env.development > config.ts > defaults
```

## 📊 Validación de Configuración

### ✅ Verificar Configuración Actual

En la consola del navegador:

```javascript
// Ver configuración completa
console.log(window.__APP_CONFIG__)

// Ver solo API config
console.log(window.queueService.getConfig())

// Verificar entorno
console.log('Entorno:', import.meta.env.MODE)
console.log('Producción:', import.meta.env.PROD)
```

### 🔍 Debug de Configuración

Con debug habilitado (`VITE_DEBUG=true`), verás en la consola:

```
[KaraQR Singer] Inicializando QueueService con configuración: {
  baseUrl: "http://localhost:3000/api",
  tenantId: "basement"
}
```

## 🌐 URLs de API por Entorno

### 🔧 Desarrollo
```
Base: http://localhost:3000/api
Endpoints:
- POST http://localhost:3000/api/queue
- GET  http://localhost:3000/api/queue?tenant_id=basement
```

### 🚀 Producción
```
Base: https://api.karaqr.com/api
Endpoints:
- POST https://api.karaqr.com/api/queue
- GET  https://api.karaqr.com/api/queue?tenant_id=basement
```

### 🧪 Staging
```
Base: https://api-staging.karaqr.com/api
Endpoints:
- POST https://api-staging.karaqr.com/api/queue
- GET  https://api-staging.karaqr.com/api/queue?tenant_id=test-tenant
```

## ⚠️ Consideraciones de Seguridad

### 🔒 Variables Públicas
- **Todas las variables `VITE_*` son públicas** y visibles en el cliente
- **NO incluyas** secretos, tokens o credenciales
- **Solo incluye** URLs y configuraciones públicas

### 🛡️ Variables Privadas (Backend)
```bash
# ❌ NO hagas esto en el frontend
VITE_API_SECRET=mi-secreto-super-privado

# ✅ En su lugar, maneja secretos en el backend
VITE_API_BASE_URL=https://api.karaqr.com/api
```

## 📝 Troubleshooting

### ❌ Problemas Comunes

1. **API no responde**
   ```bash
   # Verificar URL base
   console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
   ```

2. **Configuración no se aplica**
   ```bash
   # Restart dev server después de cambiar .env
   npm run dev
   ```

3. **CORS en desarrollo**
   ```bash
   # Usar proxy en quasar.config.js o configurar CORS en backend
   ```

### ✅ Verificación Rápida

```bash
# Ver todas las variables de entorno disponibles
console.log(import.meta.env)

# Ver configuración parsed
import config from '@/config'
console.log(config)
```

---

**Nota**: Recuerda reiniciar el servidor de desarrollo después de cambiar archivos `.env`.