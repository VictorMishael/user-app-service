![supabase-auth-thumb](https://github.com/user-attachments/assets/cc917884-5af3-4dc6-be1f-95312073340e)

# user-app-service

Aplicación de ejemplo en **React + Vite** que implementa autenticación por email y contraseña con **Supabase Auth**, gestionando la sesión con la **Context API** de React y protegiendo rutas privadas con **React Router**.

## Stack

| Herramienta | Versión | Uso |
|---|---|---|
| React | ^18.3.1 | UI |
| Vite (`@vitejs/plugin-react-swc`) | ^6.0.5 | Build y dev server |
| React Router DOM | ^7.1.1 | Enrutado (`createBrowserRouter`) |
| @supabase/supabase-js | ^2.47.10 | Cliente de autenticación |
| Tailwind CSS | ^3.4.17 | Estilos |
| ESLint | ^9.17.0 | Linting |

## Estructura del proyecto

```
src/
├── main.jsx                    # Punto de entrada: monta AuthContextProvider + RouterProvider
├── router.jsx                  # Definición de rutas
├── App.jsx                     # Ruta "/" — renderiza el formulario de Signin
├── supabaseClient.js           # createClient() con las variables de entorno
├── index.css                   # Directivas de Tailwind
├── context/
│   └── AuthContext.jsx         # Estado de sesión + signUpNewUser / signInUser / signOut
├── components/
│   ├── Signup.jsx              # Formulario de registro
│   ├── Signin.jsx              # Formulario de inicio de sesión
│   └── PrivateRoute.jsx        # Guarda de rutas: redirige a /signup sin sesión
└── routes/
    └── Dashboard.jsx           # Área privada con email del usuario y botón de salir
```

## Rutas

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `App` → `Signin` | Público |
| `/signup` | `Signup` | Público |
| `/signin` | `Signin` | Público |
| `/dashboard` | `Dashboard` | Privado (`PrivateRoute`) |

## Cómo funciona la autenticación

`AuthContext.jsx` es el núcleo de la aplicación:

- Mantiene el estado `session`, inicializado en `undefined` para distinguir "cargando" de "sin sesión" (`null`).
- Al montar, llama a `supabase.auth.getSession()` y se suscribe a `supabase.auth.onAuthStateChange()`, de modo que la sesión se sincroniza automáticamente en todas las pestañas y tras recargar la página.
- Expone tres acciones que normalizan la respuesta a `{ success, data | error }`:
  - `signUpNewUser(email, password)` → `supabase.auth.signUp()`
  - `signInUser(email, password)` → `supabase.auth.signInWithPassword()`
  - `signOut()` → `supabase.auth.signOut()`
- El email se normaliza a minúsculas antes de enviarlo a Supabase.

Los componentes consumen el contexto mediante el hook `UserAuth()`.

`PrivateRoute.jsx` muestra `Loading...` mientras `session === undefined` y redirige a `/signup` si no hay sesión; en caso contrario renderiza sus hijos.

## Puesta en marcha

### 1. Requisitos

- Node.js 18 o superior
- Un proyecto de [Supabase](https://supabase.com)

### 2. Instalación

```bash
git clone <url-del-repositorio>
cd user-app-service
npm install
```

### 3. Variables de entorno

Crea un archivo `.env` en la raíz con las credenciales de tu proyecto de Supabase (Dashboard → Project Settings → API):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

El prefijo `VITE_` es obligatorio para que Vite exponga las variables al cliente mediante `import.meta.env`.

### 4. Configuración en Supabase

En el panel de Supabase, en **Authentication → Providers**, habilita el proveedor **Email**.

La app contempla los dos modos de registro:

- Con *Confirm email* **activado** (por defecto), `signUp` no devuelve sesión: el formulario muestra "Check your email to confirm your account" y no redirige.
- Con *Confirm email* **desactivado**, `signUp` devuelve sesión al momento y se navega directo a `/dashboard`.

### 5. Ejecutar

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run preview   # previsualizar el build
npm run lint      # ESLint
```

## Notas de seguridad

- **El archivo `.env` está versionado en este repositorio.** Aunque la *anon key* de Supabase está pensada para ser pública (su seguridad depende de las políticas RLS), lo recomendable es añadir `.env` a `.gitignore` y no subirlo:

  ```bash
  echo ".env" >> .gitignore
  git rm --cached .env
  ```

- Activa **Row Level Security (RLS)** en todas las tablas antes de exponer datos: la *anon key* viaja al navegador y cualquiera puede leerla.

## Convención de errores

Las tres acciones del contexto (`signUpNewUser`, `signInUser`, `signOut`) devuelven siempre la misma forma:

```js
{ success: true,  data }            // éxito
{ success: false, error: "mensaje" } // fallo — error es siempre un string
```

Los componentes comprueban `result.success` y pintan `result.error` directamente, sin acceder a `.message`.

## Pendiente / ideas

- No hay validación de contraseña en el cliente; Supabase rechaza las de menos de 6 caracteres y el mensaje se muestra tal cual llega.
- `npm run lint` reporta avisos de estilo preexistentes (imports de `React` sin usar con el nuevo JSX transform, `react/prop-types`).
- Falta flujo de recuperación de contraseña (`resetPasswordForEmail`).
