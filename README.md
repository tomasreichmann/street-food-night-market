# Street Food Night Market

Printable party-game scaffold for **Street Food Night Market**, with declarative card content, validation, and a browser preview shell.

## Current status

The project now has a working frontend infrastructure layer:

- React + TypeScript + Vite app shell
- YAML-backed content loader with Zod validation
- minimal printable preview surface
- Vitest, ESLint, and Prettier setup
- GitHub Actions CI for lint, typecheck, tests, format checks, and build

## Local workflow

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run format:check
npm run build
```

## Content workflow

- Edit `examples/cards.yaml` to change the game content.
- The loader in `src/content/loadContent.ts` parses the YAML directly and validates it with the schemas in `src/content/schema.ts`.
- The card content currently includes resources, dishes, and customers, and the preview shell uses the icons in `src/assets/icons`.
- The preview shell in `src/App.tsx` renders the parsed content immediately, so invalid content fails fast during development and tests.
- Game rules are drafted in `docs/rules.md`.

## Scope boundary

This pass builds the infrastructure and content model only.

- in scope: typed content definitions, loader validation, preview shell, and CI
- out of scope: full print-sheet compositor, PDF export, and game logic runtime
