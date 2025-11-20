# 🎤 KaraQR Singer - PWA para Cantantes

Aplicación PWA desarrollada en Vue 3 + Quasar para que los cantantes se anoten en la cola de karaoke de cualquier bar/pub que use el sistema KaraQR.

## 🌟 Características Principales

- 📱 **PWA Completa**: Installable, offline-capable
- 🎯 **Multi-tenant**: Soporte para múltiples bares/pubs
- 🔐 **Autenticación Simple**: Solo nombre de usuario
- 🎵 **Gestión de Cola**: Anotarse en la cola de canciones
- 📱 **Mobile-First**: Diseño optimizado para móviles
- ⚡ **Vue 3 + Composition API**: Framework moderno y reactivo

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
# Servidor en http://localhost:9001
```

### Producción
```bash
npm run build
npm run preview
```

## 🏗️ Tecnologías

- **Framework**: Vue 3 + Composition API + TypeScript
- **UI**: Quasar Framework v2.16.9
- **Build**: Vite v5.2.11
- **HTTP**: Axios v1.13.2
- **PWA**: @quasar/app-vite PWA mode
- **Icons**: Material Design Icons

## 📱 Uso de la Aplicación

### Para Cantantes
1. **Acceder** al link del bar: `https://singer.karaqr.com/?tenant=nombre-bar`
2. **Autenticarse** con su nombre de usuario
3. **Anotarse** en la cola escribiendo la canción que quieren cantar
4. **Esperar** su turno en la cola del karaoke

### URLs de Ejemplo
- Basement Pub: `/?tenant=basement`
- Bar Central: `/?tenant=bar-central`
- Pub Los Amigos: `/?tenant=pub-los-amigos`

## 🎯 Sistema Multi-Tenant

### Cómo Funciona
- Cada bar/pub tiene su propio `tenant_id`
- Se pasa como query parameter en la URL: `?tenant=nombre-bar`
- La aplicación se configura automáticamente para ese tenant
- Todas las canciones van a la cola específica de ese bar

### Documentación Detallada
Ver [Sistema de Tenant](./docs/TENANT_SYSTEM.md) para información completa.

## 🏗️ Estructura del Proyecto

```
karaQR-singer/
├── src/
│   ├── app/
│   │   ├── components/           # Componentes globales
│   │   ├── composables/          # Lógica reutilizable
│   │   │   └── useTenant.ts     # Gestión de tenant
│   │   ├── layouts/
│   │   │   └── MainLayout.vue   # Layout principal
│   │   ├── pages/
│   │   │   ├── IndexPage.vue    # Página principal/login
│   │   │   ├── AnotarsePage.vue # Formulario para anotarse
│   │   │   └── ReaccionesPage.vue # Página de reacciones
│   │   └── services/
│   │       └── queueService.ts  # Servicio de cola (API)
│   ├── config/
│   │   └── index.ts            # Configuración global
│   ├── router/
│   │   └── routes.ts           # Rutas de la aplicación
│   └── App.vue                 # Componente raíz
├── docs/
│   └── TENANT_SYSTEM.md        # Documentación de tenants
└── quasar.config.js           # Configuración de Quasar
```

## ⚙️ Configuración

### Variables de Entorno

Crear `.env.development`:
```bash
VITE_TENANT_ID=basement
VITE_API_BASE_URL=http://localhost:3000/api
```

Crear `.env.production`:
```bash
VITE_TENANT_ID=basement
VITE_API_BASE_URL=https://api.karaqr.com/api
```

### PWA Configuration
- **Modo**: PWA completo con Service Worker
- **Tema**: Material Design con colores personalizados
- **Iconos**: Generados automáticamente
- **Installable**: Se puede instalar en el dispositivo

## 🔗 Integración con KaraQR

### Compatibilidad
- **100% compatible** con el sistema principal karaQR
- **Misma API** y endpoints
- **Misma base de datos** y estructura
- **Mismo sistema** de tenants que el módulo join

### Endpoints Utilizados
- `POST /queue` - Añadir canción a la cola
- `GET /queue/:tenantId` - Obtener cola actual
- Query parameter `tenant` en todas las requests

## 🎨 Personalización

### Colores del Tema
```scss
// En src/css/quasar.variables.scss
$primary: #1976d2;
$secondary: #26A69A;
$accent: #9C27B0;
```

### Componentes Personalizados
- **MainLayout**: Navegación principal con menú drawer
- **EssentialLink**: Links que mantienen el tenant
- **QueueService**: Servicio HTTP con soporte multi-tenant

## 🧪 Testing

### Testing Manual
1. Probar con diferentes tenants en URL
2. Verificar que las canciones van a la cola correcta
3. Probar navegación entre páginas
4. Verificar funcionalidad PWA offline

### URLs de Test
```bash
http://localhost:9001/?tenant=test1
http://localhost:9001/anotarse?tenant=test2
```

## 📦 Deploy

### Build para Producción
```bash
npm run build
# Archivos en dist/spa/
```

### Deploy como PWA
```bash
npm run build
# Los archivos en dist/pwa/ incluyen Service Worker
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch
3. Commit los cambios
4. Push al branch
5. Crear Pull Request

## 📄 Licencia

Este proyecto es parte del sistema KaraQR y utiliza la misma licencia del proyecto principal.

---

**Desarrollado con ❤️ para la comunidad karaoke**