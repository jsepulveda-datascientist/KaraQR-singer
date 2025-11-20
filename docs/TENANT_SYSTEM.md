# Sistema de Tenant en KaraQR Singer

## 📋 Descripción General

La aplicación KaraQR Singer está configurada para funcionar con múltiples tenants (locales/bares), igual que el módulo join de karaQR. Cada tenant tiene su propia cola de canciones independiente.

## 🔗 Uso de URLs con Tenant

### Formato de URL
```
http://localhost:9001/?tenant=NOMBRE_DEL_TENANT
```

### Ejemplos de URLs
- `http://localhost:9001/?tenant=basement` - Basement Pub
- `http://localhost:9001/?tenant=bar-central` - Bar Central
- `http://localhost:9001/anotarse?tenant=pub-los-amigos` - Pub Los Amigos

## 🎯 Características Implementadas

### ✅ Composable `useTenant()`
- **Archivo**: `src/composables/useTenant.ts`
- **Función**: Maneja el tenant desde query params
- **Auto-actualización**: Configura el queueService automáticamente
- **Navegación**: Mantiene el tenant en todas las navegaciones

### ✅ Integración Completa
- **IndexPage**: Detecta tenant al cargar
- **AnotarsePage**: Envía canciones al tenant correcto
- **MainLayout**: Navegación mantiene tenant
- **EssentialLink**: Links preservan query params

### ✅ Servicio QueueService
- **Auto-configuración**: Se actualiza con el tenant detectado
- **API Calls**: Incluye tenant_id en todas las peticiones
- **Fallback**: Usa 'basement' por defecto

## 🔄 Flujo de Funcionamiento

1. **Usuario accede** → `/?tenant=mi-bar`
2. **Composable detecta** → Extrae 'mi-bar' de query params
3. **Servicio se configura** → queueService.setTenantId('mi-bar')
4. **Navegación mantiene** → Todos los links incluyen ?tenant=mi-bar
5. **API calls correctas** → Canciones van a la cola de 'mi-bar'

## 🛠️ Configuración por Defecto

### Variables de Entorno (.env.development)
```bash
VITE_TENANT_ID=basement
VITE_API_BASE_URL=http://localhost:3000/api
```

### Fallbacks
- Si no hay tenant en URL → usa 'basement'
- Si tenant está vacío → usa 'basement'
- Configuración centralizada en `src/config/index.ts`

## 📱 Experiencia de Usuario

### Sin Tenant en URL
- URL: `http://localhost:9001/`
- Tenant usado: `basement` (por defecto)
- Usuario ve: Aplicación normal

### Con Tenant en URL
- URL: `http://localhost:9001/?tenant=bar-norte`
- Tenant usado: `bar-norte`
- Usuario ve: Aplicación personalizada para Bar Norte
- Canciones van a: Cola de Bar Norte

## 🔧 Para Desarrolladores

### Usar el Composable
```typescript
import { useTenant } from '@/composables/useTenant'

const { tenantId, navigateWithTenant } = useTenant()

// Navegar manteniendo tenant
navigateWithTenant('/anotarse')

// Obtener tenant actual
console.log(tenantId.value) // 'basement' o el tenant de la URL
```

### Configurar Nuevo Tenant
1. Acceder con `?tenant=nuevo-bar`
2. El sistema se configura automáticamente
3. Todas las operaciones usan el nuevo tenant

## ✅ Compatibilidad

### Con karaQR Principal
- **100% compatible** con el sistema de tenants existente
- **Misma API** y estructura de base de datos
- **Mismo parámetro** `tenant` en query params
- **Misma lógica** de fallback y configuración

### Navegación Inteligente
- **Links del menú**: Mantienen tenant automáticamente
- **Botones de acción**: Preservan query params
- **Logout/Home**: Regresan con tenant correcto
- **Formularios**: Envían al tenant correcto

## 🎉 Resultado

La aplicación ahora funciona exactamente igual que el módulo join de karaQR, donde cada bar/pub tiene su propia instancia de la aplicación simplemente cambiando el parámetro `tenant` en la URL.