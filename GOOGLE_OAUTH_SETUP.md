# Configuración de Google OAuth

Este documento explica cómo configurar Google OAuth para ChatIA.

## 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ (Google+ API)
4. Ve a "Credenciales" en el menú lateral
5. Haz clic en "Crear credenciales" → "ID de cliente de OAuth 2.0"
6. Configura la pantalla de consentimiento si aún no lo has hecho
7. Selecciona "Aplicación web" como tipo de aplicación
8. Añade las URIs autorizadas:
   - **Orígenes autorizados de JavaScript**:
     - `http://localhost:10000` (desarrollo)
     - `https://tu-app.onrender.com` (producción)
   - **URIs de redireccionamiento autorizadas**:
     - `http://localhost:10000/api/auth/google/callback` (desarrollo)
     - `https://tu-app.onrender.com/api/auth/google/callback` (producción)
9. Guarda el **Client ID** y el **Client Secret**

## 2. Configurar Variables de Entorno en Render

Ya tienes configuradas las variables de entorno en Render. Asegúrate de que estén correctamente configuradas:

1. Ve a tu servicio en Render
2. Ve a "Environment" en el menú lateral
3. Verifica que tengas estas variables:
   - `GOOGLE_CLIENT_ID`: Tu Client ID de Google
   - `GOOGLE_CLIENT_SECRET`: Tu Client Secret de Google
   - `SECRET_KEY`: Una clave secreta aleatoria para Flask (opcional, se genera automáticamente si no se proporciona)

## 3. Desplegar la Aplicación

Una vez configuradas las variables de entorno, despliega la aplicación:

```bash
git push origin main
```

Render detectará los cambios y desplegará automáticamente.

## 4. Probar el Login

1. Ve a tu aplicación en Render
2. Haz clic en "Sign in with Google"
3. Autoriza la aplicación
4. Deberías ser redirigido a la aplicación con tu sesión iniciada

## Notas Importantes

- Las variables `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` deben estar configuradas en Render
- Asegúrate de que las URIs de redireccionamiento en Google Cloud Console coincidan exactamente con tu URL de Render
- El modo demo sigue funcionando para desarrollo local sin necesidad de configurar Google OAuth
