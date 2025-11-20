# 🏢 Sistema de Tenant Dinámico - KaraQR Singer

## 📋 Cambios Implementados

### ✅ **Sistema Completamente Dinámico**
- **❌ Sin valores por defecto**: No hay tenant hardcodeado en la aplicación
- **📱 QR-driven**: El tenant viene exclusivamente del código QR escaneado
- **💾 Almacenamiento persistente**: Se guarda en localStorage para toda la sesión
- **🔒 Validaciones**: Todas las funciones requieren tenant válido

### ✅ **Flujo de Usuario Real**

#### 1. **Usuario Abre la App** (`/`)
```
Sin QR → NoTenantPrompt (Escanear QR)
Con QR → /?tenant=mi-bar → Aplicación funcional
```

#### 2. **Escaneo de QR**
```
QR contiene: https://singer.karaqr.com/?tenant=basement
┌─ Parámetro extraído: tenant=basement
├─ Almacenado en: localStorage['karaqr_current_tenant']
├─ Configurado en: queueService.tenantId
└─ Todas las navegaciones mantienen: ?tenant=basement
```

#### 3. **Navegación Completa**
```
🏠 Home:     /?tenant=basement
🎤 Anotarse: /anotarse?tenant=basement  
❤️ Reacciones: /reacciones?tenant=basement
```

## 🔧 **Archivos Modificados**

### 📁 **Configuración**
```typescript
// .env.development - Sin tenant por defecto
# VITE_TENANT_ID=   # No usar - viene del QR dinámicamente
# VITE_TENANT_NAME= # No usar - se configura dinámicamente

// src/config/index.ts - Configuración sin defaults
tenant: {
  // No hay tenant por defecto - viene del QR escaneado
  storageKey: 'karaqr_current_tenant'
}
```

### 📁 **Composable Mejorado**
```typescript
// src/composables/useTenant.ts
const tenantId = ref<string>('') // No hay valor por defecto

// Funciones nuevas:
- setTenant(tenantId)     // Forzar tenant (testing)
- clearTenant()           // Limpiar almacenamiento  
- requireTenant()         // Validar antes de usar
- isValidTenant          // Computed de validación
```

### 📁 **Servicio Actualizado**
```typescript
// src/services/queueService.ts
constructor() {
  this.config = {
    tenantId: ''  // Sin tenant inicial
  }
}

async addSongToQueue() {
  // Validar tenant antes de enviar
  if (!this.config.tenantId) {
    throw new Error('No hay tenant configurado. Escanea un QR válido.')
  }
}
```

### 📁 **Componentes Actualizados**

#### **NoTenantPrompt.vue** (Nuevo)
- **Pantalla QR**: Se muestra cuando no hay tenant
- **Botones de testing**: Solo en desarrollo para simular QRs
- **UX clara**: Instrucciones para escanear QR del local

#### **IndexPage.vue**
```vue
<template>
  <!-- Sin tenant: Mostrar prompt QR -->
  <NoTenantPrompt v-if="!isValidTenant" />
  
  <!-- Con tenant: App normal -->
  <div v-else-if="userStore.isAuthenticated">
    <div>🏢 Local: {{ tenantId }}</div>
    <!-- Resto del contenido -->
  </div>
</template>
```

#### **AnotarsePage.vue**  
```vue
<template>
  <!-- Sin tenant: Prompt QR -->
  <NoTenantPrompt v-if="!isValidTenant" />
  
  <!-- Con tenant: Formulario -->
  <div v-else>
    <!-- Formulario de canción -->
  </div>
</template>

<script>
async function addSong() {
  // Validación obligatoria
  if (!requireTenant()) {
    notify('Escanea QR primero')
    return
  }
  // ... resto de la función
}
</script>
```

## 🧪 **Testing del Sistema**

### ✅ **URLs de Testing**
```bash
# Sin tenant (muestra NoTenantPrompt)
http://localhost:9002/

# Con tenant válido (app funcional)  
http://localhost:9002/?tenant=basement
http://localhost:9002/?tenant=bar-central
http://localhost:9002/anotarse?tenant=pub-test
```

### ✅ **Botones de Testing** (Solo Desarrollo)
El componente `NoTenantPrompt` incluye botones para simular escaneo:
- **Basement** → Configura tenant como 'basement'
- **Bar Central** → Configura tenant como 'bar-central'  
- **Pub Test** → Configura tenant como 'pub-test'

### ✅ **Validación en Console**
```javascript
// Ver tenant actual
console.log('Tenant:', localStorage.getItem('karaqr_current_tenant'))

// Ver configuración del servicio
console.log('Service:', queueService.getConfig())

// Testear validación
console.log('Es válido:', useTenant().isValidTenant.value)
```

## 🔄 **Flujos de Trabajo**

### 📱 **Flujo QR Real** (Producción)
1. **Usuario abre** → `https://singer.karaqr.com/`
2. **Ve prompt** → "Escanea el QR del Local"
3. **Escanea QR** → `https://singer.karaqr.com/?tenant=mi-bar`
4. **App configurada** → Tenant: 'mi-bar' almacenado
5. **Navega libremente** → Todas las URLs mantienen tenant
6. **Canciones van** → A la cola de 'mi-bar'

### 🧪 **Flujo Testing** (Desarrollo)  
1. **Abre** → `http://localhost:9002/`
2. **Ve botones** → "Solo para Testing"
3. **Clica "Basement"** → Simula QR de Basement
4. **App configurada** → Como si hubiera escaneado QR real
5. **Testing completo** → Todas las funciones disponibles

### ⚠️ **Flujo Sin Tenant**
1. **Usuario directo** → `/anotarse` sin parámetro
2. **Prompt aparece** → "Escanea el QR del Local"  
3. **Función bloqueada** → No puede enviar canciones
4. **Validación activa** → `requireTenant()` retorna false

## 💾 **Almacenamiento y Persistencia**

### ✅ **LocalStorage Keys**
```javascript
'karaqr_current_tenant'  // Tenant ID del QR escaneado
'karaqr-user'           // Datos de usuario (nombre, avatar)
```

### ✅ **Recuperación Automática**
- **Al abrir app**: Recupera tenant de localStorage si existe
- **Sin URL tenant**: Usa el almacenado como fallback  
- **Navegación**: Mantiene tenant en todas las rutas
- **Sesión**: Persistente hasta limpiar datos del navegador

### ✅ **Funciones de Gestión**
```typescript
// Limpiar tenant (logout, cambio de local)
clearTenant()

// Forzar tenant (testing, admin)  
setTenant('nuevo-tenant')

// Validar antes de usar funciones
if (requireTenant()) {
  // Función segura para ejecutar
}
```

## 🎯 **Beneficios del Sistema**

### ✅ **UX Mejorada**
- **Onboarding claro**: Usuario sabe que debe escanear QR
- **Feedback visual**: Siempre muestra el local actual
- **Prevención de errores**: No se puede usar sin tenant

### ✅ **Seguridad**
- **Validaciones obligatorias**: Todas las APIs requieren tenant
- **No defaults**: Imposible enviar a tenant incorrecto
- **Trazabilidad**: Logs muestran tenant en cada operación

### ✅ **Flexibilidad**
- **Multi-local**: Cada QR configura automáticamente
- **Testing fácil**: Botones de desarrollo incluidos
- **Recuperación**: Mantiene sesión si cierra/abre app

---

**🚀 El sistema ahora es 100% dinámico y QR-driven como requiere el caso de uso real!**