# user-app-service

Aplicación en **React + Vite** que implementa autenticación por email y contraseña con **Supabase Auth**, gestiona la sesión con la **Context API** de React, protege rutas privadas con **React Router** y ofrece tema claro/oscuro persistente.

## Stack

| Herramienta | Versión | Uso |
|---|---|---|
| React | ^18.3.1 | UI |
| Vite (`@vitejs/plugin-react-swc`) | ^6.0.5 | Build y dev server |
| React Router DOM | ^7.1.1 | Enrutado (`createBrowserRouter`) |
| @supabase/supabase-js | ^2.47.10 | Cliente de autenticación |
| Tailwind CSS | ^3.4.17 | Motor de estilos |
| postcss-import | ^15.1.0 | Inlining de `@import` antes de Tailwind |
| ESLint | ^9.17.0 | Linting |

El proyecto es **JavaScript, no TypeScript**: solo archivos `.jsx` / `.js`. Las props se documentan con JSDoc; la regla `react/prop-types` está desactivada a propósito porque `prop-types` no es una dependencia.

## Estructura del proyecto

```
src/
├── main.jsx                    # Monta ThemeContextProvider > AuthContextProvider > RouterProvider
├── router.jsx                  # Definición de rutas
├── supabaseClient.js           # createClient() con las variables de entorno
├── context/
│   ├── AuthContext.jsx         # Estado de sesión + signUpNewUser / signInUser / signOut
│   └── ThemeContext.jsx        # Tema claro/oscuro + persistencia en localStorage
├── hooks/
│   └── useSignOut.js           # Acción de cierre de sesión + navegación, compartida
├── components/
│   ├── Header.jsx              # Barra superior con navegación y menú móvil
│   ├── ThemeToggle.jsx         # Botón de cambio de tema
│   ├── Signup.jsx              # Formulario de registro
│   ├── Signin.jsx              # Formulario de inicio de sesión
│   └── PrivateRoute.jsx        # Guarda de rutas: redirige a /signin sin sesión
├── routes/
│   ├── RootLayout.jsx          # Layout sin path: Header + <Outlet />
│   ├── Home.jsx                # Landing pública
│   └── Dashboard.jsx           # Área privada con email del usuario y botón de salir
└── styles/                     # Hoja de estilos OOCSS (ver más abajo)
```

## Rutas

`router.jsx` usa una ruta *pathless* (`RootLayout`) para que todas las páginas se rendericen bajo la misma cabecera.

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `Home` | Público |
| `/signup` | `Signup` | Público |
| `/signin` | `Signin` | Público |
| `/dashboard` | `Dashboard` | Privado (`PrivateRoute`) |

## Cómo funciona la autenticación

`AuthContext.jsx` es el núcleo de la aplicación:

- Mantiene el estado `session` con **tres** valores distintos, y la diferencia importa:
  - `undefined` — la sesión todavía se está restaurando
  - `null` — restaurada, y el usuario no ha iniciado sesión
  - objeto — sesión activa
- Al montar, llama a `supabase.auth.getSession()` y se suscribe a `supabase.auth.onAuthStateChange()`, de modo que la sesión se sincroniza automáticamente en todas las pestañas y tras recargar la página.
- Expone tres acciones que normalizan la respuesta a `{ success, data | error }`.
- El email se normaliza a minúsculas antes de enviarlo a Supabase.
- El objeto del contexto está memoizado con `useMemo` para no re-renderizar a todos los consumidores en cada render del provider.

Los componentes consumen el contexto mediante el hook `UserAuth()`.

### El estado `undefined` no es opcional

Dos componentes dependen de él por motivos distintos:

- `PrivateRoute` muestra `Loading...` mientras `session === undefined`. Si tratara ese valor como "sin sesión", expulsaría al usuario autenticado en cada recarga de página.
- `Header` renderiza una lista de navegación **vacía** mientras `undefined`, para no mostrar "Sign up" durante un instante a alguien que sí tiene sesión.

Cualquier UI nueva que dependa de la sesión debe contemplar los tres casos.

### El cierre de sesión vive en un hook

`useSignOut` (en `src/hooks/`) combina `signOut()` con `useNavigate()` y expone `{ handleSignOut, error }`. Está fuera de `AuthContext` porque `useNavigate` solo funciona dentro del router, y el contexto se monta por encima de él. Lo usan `Header` y `Dashboard`.

### Convención de errores

Las tres acciones del contexto (`signUpNewUser`, `signInUser`, `signOut`) devuelven siempre la misma forma:

```js
{ success: true,  data }             // éxito
{ success: false, error: "mensaje" } // fallo — error es siempre un string
```

Los componentes comprueban `result.success` y pintan `result.error` directamente, sin acceder a `.message`. Toda acción de autenticación nueva debe seguir el mismo contrato.

## Tema claro / oscuro

`tailwind.config.js` usa `darkMode: "class"`. `ThemeContext.jsx`:

- Lee la preferencia guardada en `localStorage` (clave `vic-thor-theme`) y, si no hay ninguna, cae en `prefers-color-scheme` del sistema.
- Aplica la clase `dark` y `color-scheme` sobre `<html>`, de modo que toda la app reacciona a un único interruptor.

Consecuencia práctica: **cada regla de color necesita su variante `dark:`**. No existe una hoja de estilos oscura aparte.

## Estilos: OOCSS

Los estilos viven en `src/styles/` y se importan una sola vez desde `main.jsx` a través de `src/styles/index.css`, cuya cabecera documenta el contrato completo.

```
src/styles/
├── index.css              # Entrada — el orden de los @import ES la cascada
├── base/document.css      # Únicos selectores de etiqueta del proyecto
├── objects/               # ESTRUCTURA, sin color
│   ├── container.css      # .o-container  --form | --page | --bar
│   ├── stack.css          # .o-stack      --tight
│   ├── cluster.css        # .o-cluster    --tight | --center
│   ├── bar.css            # .o-bar, .o-bar-row
│   ├── button.css         # .o-button     --sm | --md | --lg | --icon | --block
│   └── field.css          # .o-field
├── skins/                 # PINTURA, sin box model
│   ├── action.css         # .s-action
│   ├── field.css          # .s-field
│   ├── surface.css        # .s-surface-bar, .s-divider-top, .s-alert-error
│   └── link.css           # .s-link
└── utilities/text.css     # .u-text-muted | error | success
```

Tres prefijos, y la separación entre los dos primeros es el objetivo de toda la metodología:

| Prefijo | Contiene | Nunca contiene |
|---|---|---|
| `o-` objeto | caja: display, tamaño, padding, alineación | ningún color |
| `s-` skin | pintura: fondo, color de borde, radio, sombra, transición | ningún box model |
| `u-` utilidad | un grupo de declaraciones con su par `dark:` incluido | — |

Una acción se **compone**, no se empaqueta:

```jsx
className="o-button o-button--md o-button--block s-action"
```

Por eso un `Link`, un `<button type="submit">` y el toggle de tema comparten apariencia sin compartir componente.

### Dos reglas que es fácil romper

- **Nada de selectores descendentes.** Ninguna regla puede depender de dónde está el elemento: no existe `.o-bar .o-button`. Si un botón debe verse distinto en la cabecera, eso es un modificador o un skin nuevo, no una excepción contextual.
- **El orden de `@import` es la cascada.** Todas las reglas son de una sola clase, así que el conflicto lo decide el orden de fuente, no la especificidad. `index.css` importa objetos → skins → utilidades a propósito: un skin puede repintar el borde que reservó el objeto, y una utilidad suelta de Tailwind en el JSX (`mt-6`, `sm:w-auto`) sigue ganándole a ambos. Añadir un archivo implica añadir su `@import` en el bloque correcto.

`o-button` declara `border` **sin color** para que `s-action` pueda encenderlo en modo oscuro sin que el botón cambie de tamaño. Los modificadores de tamaño (`--sm`, `--md`, `--lg`, `--icon`) son excluyentes entre sí; `--block` se combina con cualquiera.

Las utilidades de Tailwind en línea son correctas para casos únicos (el tamaño de un título, `mt-6`, un `sm:flex-row`). Cuando una combinación se repite entre archivos, toca crear un objeto o un skin. No se deben reintroducir constantes de estilo en archivos `.js`.

### postcss-import es obligatorio

`postcss.config.js` ejecuta `postcss-import` **antes** que `tailwindcss`. Es lo que inlinea el grafo de `@import` para que Tailwind pueda resolver `@apply` y `@layer` dentro de cada parcial. Reordenarlo o quitarlo rompe el build.

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

- Con *Confirm email* **activado** (por defecto), `signUp` no devuelve sesión: el formulario muestra "Check your email to confirm your account" y no redirige. Redirigir aquí haría que `PrivateRoute` devolviera al usuario de inmediato.
- Con *Confirm email* **desactivado**, `signUp` devuelve sesión al momento y se navega directo a `/dashboard`.

### 5. Ejecutar

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run preview   # previsualizar el build
npm run lint      # ESLint
```

No hay framework de pruebas instalado: los cambios se verifican con `npm run build` y `npm run lint`.

## Notas de seguridad

- **`.env` está en `.gitignore` pero sigue versionado**, porque se subió antes de añadir la regla. Para dejar de rastrearlo:

  ```bash
  git rm --cached .env
  ```

  La *anon key* de Supabase está pensada para ser pública —su seguridad depende de las políticas RLS—, pero aun así no conviene tenerla en el historial.

- Activa **Row Level Security (RLS)** en todas las tablas antes de exponer datos: la *anon key* viaja al navegador y cualquiera puede leerla.

## Pendiente / ideas

- No hay validación de contraseña en el cliente; Supabase rechaza las de menos de 6 caracteres y el mensaje se muestra tal cual llega.
- Falta flujo de recuperación de contraseña (`resetPasswordForEmail`).
- No hay pruebas automatizadas.
- `npm run lint` reporta un aviso preexistente en `ThemeContext.jsx` (`react-refresh/only-export-components`): el archivo exporta a la vez el provider y el hook `useTheme`. Separar el hook en su propio archivo lo resolvería.
