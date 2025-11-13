## Quick context

This is a small React + Vite SPA using functional components, Tailwind CSS utility classes, and SVG icons imported via SVGR. Keep changes minimal and follow the project's existing file patterns.

Key files to reference:

- `package.json` — run scripts: `npm run dev`, `npm run build`, `npm run lint`.
- `src/main.jsx` — app entry (uses React StrictMode).
- `src/App.jsx` — top-level composition: imports `Header`, `Calendar`, `SearchBox`, `CardInfo`.
- `src/components/*.jsx` — UI is composed of small, single-file presentational components with default exports.
- `src/assets/icons/index.jsx` — named exports for icons (uses `*.svg?react` imports handled by `vite-plugin-svgr`).

## Coding conventions & patterns (do not invent new conventions)

- Files use the `.jsx` extension for React components. Continue this style for new components.
- Components are default-exported and imported with relative paths, e.g. `import Header from "./components/Header.jsx"` (see `App.jsx`).
- Styling is Tailwind utility classes applied directly in JSX. Preserve existing responsive/utility patterns (do not migrate to CSS modules without owner approval).
- SVG icons are exported as named components from `src/assets/icons/index.jsx`. Use `import { Search } from "../assets/icons"` to consume.
- The repo uses `vite` and the `type: "module"` package.json setting. Prefer ES module syntax (`import`/`export`) only.
- ESLint configuration is in `eslint.config.js`. Note rule: `no-unused-vars` ignores identifiers that start with a capital letter — this allows some imports used as JSX components to pass lint.

## Typical tasks & where to edit

- Add a new UI component: create `src/components/MyComponent.jsx`, default export a function, and import it into `App.jsx` to render.
- Add an icon: place `foo.svg` in `src/assets/icons/` and export it in `src/assets/icons/index.jsx` using the existing `*.svg?react` pattern.
- Update styles: prefer Tailwind classes in JSX. For global styles, edit `src/index.css` or `src/App.css`.

## How to run and test locally

- Start dev server with: `npm run dev` (Vite + HMR). Preview the prod build with `npm run preview` after `npm run build`.
- Lint with: `npm run lint` (project uses ESLint and plugins configured in `eslint.config.js`).

## What not to change

- Do not convert the project to TypeScript or change the module type without explicit permission.
- Avoid big refactors of component structure or styling approach — this repo is intentionally small and presentational.

## Examples to follow

- Creating a search input: see `src/components/SearchBox.jsx` — follow the same structure: wrapper div, icon from `assets/icons`, and an `<input>` with Tailwind classes and placeholder text.
- Icon exports: `src/assets/icons/index.jsx` exports `PinIcon, Calendar, Search` by name — import these names in components.

If anything here is unclear or you need more specifics (testing setup, API integration plans, or storybook), tell me which area to expand and I will iterate.
