# Home Page And Planning Route Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the planning ledger off the home page into its own route, simplify the home page, and keep the header stats tied to live content counts.

**Architecture:** Keep `loadCardContent()` as the single source of truth for cards and reuse the existing `CardPlanningTable` component on a new dedicated route. The home page should become a lean landing page with an intro, dynamic summary stats, and the core card sections only. Navigation should expose the new route clearly so the planning ledger stays discoverable without crowding the landing page.

**Tech Stack:** React, TypeScript, Vite, Testing Library, Vitest

---

### Task 1: Add failing coverage for the new route and home-page shape

**Files:**
- Modify: `src/App.test.tsx`
- Create: `src/PlanningRoute.test.tsx`

**Step 1: Write the failing test**

Add assertions that:
- the home page no longer renders `Featured mockups`, `Resource set`, or the `Card planning table`
- the nav exposes a `Planning` link
- the new `/planning` route renders the planning table

**Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- src/App.test.tsx src/PlanningRoute.test.tsx`
Expected: fail because the route and updated layout do not exist yet.

### Task 2: Add the planning route and simplify the home page

**Files:**
- Modify: `src/App.tsx`
- Create: `src/PlanningRoute.tsx`
- Modify: `src/components/CardPlanningTable.tsx` only if route-specific wrapper needs changes

**Step 1: Write the minimal implementation**

Create a dedicated `PlanningRoute` that renders the existing `CardPlanningTable` against loaded content.
Update `App.tsx` so:
- the nav includes `Planning`
- the home route keeps only an intro and the existing core card sections
- the planning table is removed from the home route
- the new `/planning` branch renders the planning route

**Step 2: Run the tests to verify they pass**

Run: `npm run test:run -- src/App.test.tsx src/PlanningRoute.test.tsx`
Expected: pass.

### Task 3: Make the header stats dynamic and update the home copy

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update the hero content**

Use the loaded content summary for the home header stats, and replace the old hero copy with a short intro that explains the site as a printable game build and content preview.

**Step 2: Run the app test**

Run: `npm run test:run -- src/App.test.tsx`
Expected: pass.

### Task 4: Full verification

**Files:**
- None

**Step 1: Run the focused test set**

Run: `npm run test:run -- src/App.test.tsx src/PlanningRoute.test.tsx src/RulesRoute.test.tsx src/RulesPrintRoute.test.tsx`
Expected: pass.

**Step 2: Run the production build**

Run: `npm run build`
Expected: pass.

