# 🧪 URLs de Testing - KaraQR Singer

Este archivo contiene ejemplos de URLs para probar la funcionalidad multi-tenant de la aplicación.

## 🔗 URLs Base

### Servidor de Desarrollo
```
Base: http://localhost:9001
```

### Servidor de Producción
```
Base: https://singer.karaqr.com
```

## 🏪 Tenants de Ejemplo

### 1. Basement Pub (Default)
```bash
# Sin tenant (usa basement por defecto)
http://localhost:9001/

# Con tenant explícito
http://localhost:9001/?tenant=basement

# Página de anotarse
http://localhost:9001/anotarse?tenant=basement

# Página de reacciones
http://localhost:9001/reacciones?tenant=basement
```

### 2. Bar Central
```bash
# Página principal
http://localhost:9001/?tenant=bar-central

# Anotarse
http://localhost:9001/anotarse?tenant=bar-central

# Reacciones
http://localhost:9001/reacciones?tenant=bar-central
```

### 3. Pub Los Amigos
```bash
# Página principal
http://localhost:9001/?tenant=pub-los-amigos

# Anotarse
http://localhost:9001/anotarse?tenant=pub-los-amigos

# Reacciones
http://localhost:9001/reacciones?tenant=pub-los-amigos
```

### 4. Karaoke Norte
```bash
# Página principal
http://localhost:9001/?tenant=karaoke-norte

# Anotarse
http://localhost:9001/anotarse?tenant=karaoke-norte

# Reacciones
http://localhost:9001/reacciones?tenant=karaoke-norte
```

## 🧪 Casos de Prueba

### ✅ Flujo Normal
1. **Abrir**: `/?tenant=mi-bar`
2. **Verificar**: El tenant se detecta correctamente
3. **Navegar**: Usar el menú para ir a "Anotarse"
4. **Comprobar**: La URL mantiene `?tenant=mi-bar`
5. **Login**: Ingresar nombre de usuario
6. **Anotar canción**: Verificar que se envía al tenant correcto

### ✅ Sin Tenant (Fallback)
1. **Abrir**: `/` (sin query params)
2. **Verificar**: Usa 'basement' por defecto
3. **Navegar**: Todos los links usan `?tenant=basement`

### ✅ Cambio de Tenant
1. **Abrir**: `/?tenant=bar1`
2. **Login y usar** la aplicación normalmente
3. **Cambiar URL**: Ir a `/?tenant=bar2` 
4. **Verificar**: Se reconfigura para bar2
5. **Continuar**: Todas las acciones van a bar2

### ✅ Navegación Directa
1. **Ir directamente** a: `/anotarse?tenant=mi-bar`
2. **Verificar**: Se detecta el tenant desde la subruta
3. **Navegar**: Usar menú para ir a Home
4. **Comprobar**: Mantiene el tenant en la URL

## 📊 Validaciones Esperadas

### En Consola del Navegador
```javascript
// Verificar tenant actual
console.log('Tenant actual:', localStorage.getItem('currentTenant'))

// Ver configuración del servicio
console.log('Config del QueueService:', window.queueService?.config)
```

### En Network Tab (DevTools)
- **Al enviar canción**: Ver request a `/api/queue` con `tenant_id: "mi-bar"`
- **Headers correctos**: Verificar que incluye el tenant
- **Response**: Confirmar que la canción se agregó a la cola correcta

### En Application Tab (DevTools)
- **localStorage**: Verificar `currentUser` y `currentTenant`
- **Service Worker**: Confirmar que la PWA está registrada
- **Manifest**: Verificar configuración PWA

## 🔄 Testing Automático

### Script de Pruebas Rápidas
```bash
# Abrir múltiples tenants en pestañas
start http://localhost:9001/?tenant=basement
start http://localhost:9001/?tenant=bar-central  
start http://localhost:9001/?tenant=pub-los-amigos
start http://localhost:9001/?tenant=test-tenant
```

### Comandos PowerShell
```powershell
# Testing de URLs
$tenants = @('basement', 'bar-central', 'pub-los-amigos', 'karaoke-norte')
foreach($tenant in $tenants) {
    Start-Process "http://localhost:9001/?tenant=$tenant"
}
```

## 🎯 Resultados Esperados

### ✅ Comportamiento Correcto
1. **Auto-detección**: El tenant se extrae de la URL automáticamente
2. **Persistencia**: El tenant se mantiene en todas las navegaciones
3. **API Calls**: Todas las requests incluyen el tenant correcto
4. **UI Consistency**: La aplicación se ve igual independientemente del tenant
5. **Fallback**: Funciona correctamente sin tenant (usa basement)

### ❌ Errores a Detectar
1. **Pérdida de tenant**: Links que no mantienen el query param
2. **API incorrecta**: Requests que van al tenant equivocado
3. **Estado inconsistente**: Tenant en URL ≠ tenant en localStorage
4. **Navegación rota**: Links que no funcionan con tenants

## 📱 Testing en Dispositivos

### URLs para Testing Mobile
```bash
# Usar la IP local para testing en móvil
http://192.168.1.X:9001/?tenant=basement
```

### QR Codes para Testing
Generar QR codes con las URLs de prueba para facilitar el testing en dispositivos móviles.

---

**Nota**: Reemplazar `192.168.1.X` con la IP real de la máquina de desarrollo.