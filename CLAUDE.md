# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # production build into dist/
npm run preview   # serve the built output
npm run lint      # ESLint over the repo (dist/ ignored)
```

There is **no test framework installed** — no test runner, no test files, no `test` script. Do not invent a test command; verify changes with `npm run build` and `npm run lint`.

`npm run lint` currently reports one pre-existing warning in `src/context/ThemeContext.jsx` (`react-refresh/only-export-components`, because the file exports both a provider component and the `useTheme` hook). Leave it unless asked; a change is regression-free when the warning count does not grow.

## Environment

The app needs a `.env` at the repo root with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The `VITE_` prefix is what exposes them through `import.meta.env` in `src/supabaseClient.js`.

`.env` is listed in `.gitignore` but is **still tracked by git** (it was committed before the ignore rule). `git rm --cached .env` is the fix; until then, edits to it show up in `git status`.

## Architecture

This is JavaScript, not TypeScript — `.jsx` / `.js` only. Props are documented with JSDoc; `react/prop-types` is deliberately off in `eslint.config.js` because the `prop-types` package is not a dependency.

### Provider order is load-bearing

`src/main.jsx` nests `ThemeContextProvider` → `AuthContextProvider` → `RouterProvider`. `useSignOut` calls `useNavigate`, so any hook or component that navigates must render *inside* the router — that is why sign-out lives in a hook consumed by `Header`/`Dashboard` rather than in `AuthContext` itself.

### The session tri-state

`AuthContext` initialises `session` to `undefined` and this distinction is relied on in more than one place:

- `undefined` — the Supabase session is still being restored
- `null` — restored, and the user is signed out
- object — signed in

`PrivateRoute` renders a loading view while `undefined` (collapsing it into "signed out" would bounce authenticated users on every page refresh), and `Header` renders an **empty** nav list while `undefined` so an authenticated user never sees "Sign up" flash before the session lands. Any new session-dependent UI must handle all three states.

`AuthContext` seeds state from `supabase.auth.getSession()` and then subscribes to `onAuthStateChange`, so sessions stay in sync across tabs and reloads. Its `value` is memoised — keep it that way or every consumer re-renders on each provider render.

### Auth action error contract

`signUpNewUser`, `signInUser` and `signOut` all normalise Supabase responses to one shape:

```js
{ success: true,  data }              // success
{ success: false, error: "message" }  // failure — error is always a string
```

Callers check `result.success` and render `result.error` directly. Never surface a raw Supabase error object or reach for `.message` at a call site. New auth actions follow the same contract.

A sign-up with Supabase's *Confirm email* enabled succeeds with **no session**; `Signup.jsx` must show the "check your email" message instead of navigating, or `PrivateRoute` would bounce the user straight back.

### Routing

`src/router.jsx` uses a pathless `RootLayout` route so every page renders below the shared `Header`. `/dashboard` is wrapped in `PrivateRoute`, which redirects to `/signin`.

### Theming

`tailwind.config.js` sets `darkMode: "class"`. `ThemeContext` reads `localStorage` (key `vic-thor-theme`), falls back to `prefers-color-scheme`, and toggles the single `dark` class plus `color-scheme` on `<html>`. Consequence: every colour rule in the stylesheet needs its `dark:` counterpart — there is no separate dark theme file.

## Styling: OOCSS

Styles live in `src/styles/`, imported once from `src/main.jsx` via `src/styles/index.css`. The folder follows Object-Oriented CSS and the conventions are enforced by hand, so read `src/styles/index.css` first — its header documents the contract.

Three class prefixes, and the split between the first two is the whole point:

| Prefix | Owns | Never contains |
|---|---|---|
| `o-` object | box model: display, size, padding, alignment | any colour |
| `s-` skin | paint: background, border colour, radius, shadow, transition | any box model |
| `u-` utility | one declaration group with its `dark:` pair baked in | — |

An action is composed, not bundled: `o-button o-button--md o-button--block s-action`. That is why a `Link`, a submit `<button>` and the icon-only theme toggle share one appearance without sharing a component.

Two rules that are easy to break:

- **No descendant selectors.** Nothing in `src/styles/` may depend on where an element sits — there is no `.o-bar .o-button`. If a button needs to look different in the header, that is a new modifier or a new skin, not a contextual override.
- **Import order is the cascade.** Every rule is a single class, so source order decides conflicts, not specificity. `index.css` imports objects → skins → utilities on purpose: a skin repaints the border an object reserved, and a one-off Tailwind utility in JSX still beats both. Adding a file means adding its `@import` in the right block.

`o-button` declares `border` with **no colour** so `s-action` can light it up in dark mode without resizing the element. Size modifiers (`--sm`, `--md`, `--lg`, `--icon`) are mutually exclusive; `--block` composes with any of them.

Inline Tailwind utilities in JSX are fine for genuine one-offs (a heading size, `mt-6`, a responsive `sm:w-auto`). Reach for a new object or skin when a combination repeats across files. Do not reintroduce style constants in `.js` files — a previous `src/styles/buttonStyles.js` was removed in favour of these classes.

`postcss.config.js` runs `postcss-import` **before** `tailwindcss`. This is required: it inlines the `@import` graph so Tailwind can resolve `@apply` and `@layer` inside every partial. Reordering or removing it breaks the build.

## Repo notes

- `README.md` covers the same ground as this file for a human audience (setup, Supabase configuration, the OOCSS contract). It is currently accurate — keep it in step when changing routes, the auth contract or `src/styles/`.
- `.claude/agents/user-app-clean-expert.md` defines a project-scoped subagent for frontend work in this repo.
