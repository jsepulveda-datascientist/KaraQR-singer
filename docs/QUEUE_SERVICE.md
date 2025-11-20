# KaraQR Singer - Servicio de Cola

## 📋 Descripción

Servicio para enviar solicitudes de canciones a la cola de karaoke. Basado en la arquitectura del proyecto karaQR principal, adaptado para la aplicación Vue 3 + Quasar del cantante.

## 🏗️ Estructura

```
src/
├── services/
│   └── queueService.ts        # Servicio principal de cola
├── types/
│   └── queue.ts               # Interfaces TypeScript
├── config/
│   └── index.ts               # Configuración de la app
└── pages/
    └── AnotarsePage.vue       # Página integrada con el servicio
```

## 🔧 Configuración

### Variables de Entorno

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_TENANT_ID=basement
VITE_APP_NAME=KaraQR Singer
VITE_APP_VERSION=1.0.0
```

### Configuración del Servicio

```typescript
// src/config/index.ts
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000
  },
  tenant: {
    id: import.meta.env.VITE_TENANT_ID || 'basement',
    name: 'Basement'
  }
}
```

## 🚀 Uso del Servicio

### Importación

```typescript
import { queueService } from '../services/queueService'
import type { SongRequest } from '../types/queue'
```

### Enviar Canción

```typescript
const songRequest: SongRequest = {
  name: 'Nombre del Cantante',
  title: 'Título de la Canción',
  artist: 'Nombre del Artista',
  youtubeLink: 'https://youtube.com/watch?v=...' // Opcional
}

try {
  await queueService.addSongToQueue(songRequest)
  console.log('✅ Canción agregada exitosamente')
} catch (error) {
  console.error('❌ Error:', error.message)
}
```

## 📡 API Endpoints

### POST `/api/queue`

Agrega una nueva canción a la cola.

**Body:**
```json
{
  "tenant_id": "basement",
  "name": "Juan Pérez",
  "title_raw": "Bohemian Rhapsody - Queen",
  "youtube_url": "https://youtube.com/watch?v=fJ9rUzIMcZQ",
  "status": "waiting"
}
```

**Response:**
```json
{
  "id": "uuid",
  "tenant_id": "basement",
  "name": "Juan Pérez",
  "title_raw": "Bohemian Rhapsody - Queen",
  "youtube_url": "https://youtube.com/watch?v=fJ9rUzIMcZQ",
  "status": "waiting",
  "created_at": "2025-11-19T21:30:00Z"
}
```

### GET `/api/queue?tenant_id=basement`

Obtiene la cola actual (opcional, para mostrar posición).

## 🔄 Flujo de Datos

1. **Usuario llena formulario** en `AnotarsePage.vue`
2. **Datos se convierten** de `FormData` → `SongRequest` → `QueueEntry`
3. **Se envía petición HTTP** a través de `queueService.addSongToQueue()`
4. **API responde** con la entrada creada
5. **Se muestra confirmación** al usuario con los datos enviados

## 🎯 Mapeo de Datos

| FormData | SongRequest | QueueEntry | Descripción |
|----------|-------------|------------|-------------|
| `singer` | `name` | `name` | Nombre del cantante |
| `title` + `artist` | `title` + `artist` | `title_raw` | Se concatenan como "Título - Artista" |
| `youtubeLink` | `youtubeLink` | `youtube_url` | URL opcional de YouTube |
| - | - | `tenant_id` | Se obtiene de configuración |
| - | - | `status` | Siempre "waiting" para nuevas entradas |

## 🛠️ Características del Servicio

### ✅ Implementado
- ✅ Envío de canciones a la cola
- ✅ Validación de datos
- ✅ Manejo de errores con notificaciones Quasar
- ✅ Configuración por variables de entorno
- ✅ Logging detallado para debugging
- ✅ TypeScript con tipos estrictos
- ✅ Integración con la arquitectura existente de karaQR

### 🚧 Pendiente (Opcional)
- 🔮 Obtener posición en la cola
- 🔮 Notificaciones push cuando sea el turno
- 🔮 Actualización en tiempo real del estado
- 🔮 Caché local para peticiones offline

## 🔗 Compatibilidad

Este servicio es 100% compatible con:
- **Backend**: Misma API que usa el proyecto karaQR Angular
- **Base de datos**: Tabla `queue` con esquema existente
- **Arquitectura**: Respeta las interfaces y contratos del proyecto principal

## 🧪 Testing

Para probar el servicio:

1. **Asegúrate** de que la API backend esté corriendo
2. **Configura** las variables de entorno correctas
3. **Llena el formulario** en la página "Anotarse para cantar"
4. **Verifica** en la consola del navegador los logs del servicio
5. **Confirma** en la base de datos que la entrada se creó

## 🐛 Troubleshooting

### Error de conexión
```
❌ API Response Error: Network Error
```
**Solución**: Verificar que VITE_API_BASE_URL apunte a la URL correcta del backend.

### Error de tenant
```
❌ Error: tenant_id is required
```
**Solución**: Configurar VITE_TENANT_ID en las variables de entorno.

### Error de validación
```
❌ Error: title_raw is required
```
**Solución**: Asegurar que tanto título como artista estén llenos en el formulario.