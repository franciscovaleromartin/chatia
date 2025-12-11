# ChatIA - Frontend Demo

Una interfaz de chat minimalista construida con React y Vite.

## 🎭 Modo Demo

Este proyecto es una versión **frontend-only** de ChatIA. Toda la funcionalidad funciona con datos simulados almacenados en localStorage del navegador.

## 🚀 Desarrollo Local

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173 para ver la aplicación.

## 📦 Build

```bash
cd frontend
npm run build
```

Los archivos estáticos se generarán en `frontend/dist/`

## 🌐 Despliegue en Render

### Opción 1: Desde el Dashboard de Render

1. Ve a https://dashboard.render.com/
2. Click en "New +" → "Static Site"
3. Conecta tu repositorio de GitHub
4. Configura lo siguiente:
   - **Name**: chatia (o el nombre que prefieras)
   - **Branch**: main (o tu rama principal)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
5. Click en "Create Static Site"

### Opción 2: Usando render.yaml (Blueprint)

El proyecto ya incluye un archivo `render.yaml` configurado. Puedes usarlo para desplegar automáticamente:

1. Ve a https://dashboard.render.com/
2. Click en "New +" → "Blueprint"
3. Conecta tu repositorio
4. Render detectará automáticamente el `render.yaml` y configurará todo

## 🎨 Características

- ✅ Interfaz de chat en tiempo real (simulado)
- ✅ Múltiples conversaciones
- ✅ Modo AI activable/desactivable
- ✅ Subida de imágenes
- ✅ Edición de perfil
- ✅ Panel de administración
- ✅ Diseño responsive
- ✅ Tema minimalista

## 📝 Notas

- Todos los datos se almacenan en localStorage
- Las respuestas de IA son simuladas
- No requiere backend ni base de datos
- Ideal para demos y prototipos

## 🔧 Tecnologías

- React 19
- Vite 7
- React Router 7
- React Icons
- date-fns
- axios (usado solo para estructura, no hay llamadas reales)
