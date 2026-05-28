# Rules Print Route Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated `/rules-print` route that renders the rules handout as individual A4 pages, one content section per page, so the print version is reliable and separate from the web rules page.

**Architecture:** Keep the existing `/rules` route as the web-friendly view and create a new print-only route that reuses the same rules content blocks in a print-safe page stack. Each major rules section should become its own A4 page with explicit page breaks and print-only styling, while the route shell hides non-print navigation and chrome. Use the existing declarative content and component pieces where possible so the print route stays aligned with the live rules copy.

**Tech Stack:** React, TypeScript, Vite, CSS, Vitest

---

### Task 1: Add a failing test for the new rules print route

**Files:**
- Modify: `src/RulesRoute.test.tsx`
- Create: `src/RulesPrintRoute.test.tsx`

**Step 1: Write the failing test**

Add a route test that pushes `window.location.pathname` to `/rules-print` and asserts:
- the page renders without the regular `/rules` hero layout
- each major rules section appears as a separate printable page container
- the page stack contains the expected rules sections in order

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/RulesPrintRoute.test.tsx`
Expected: FAIL because the route and page stack do not exist yet.

**Step 3: Write minimal implementation**

Add a new `RulesPrintRoute` component that renders the rules content in a print-oriented stack with page-level containers.

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/RulesPrintRoute.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/RulesPrintRoute.test.tsx src/RulesPrintRoute.tsx src/App.tsx
git commit -m "feat: add rules print route shell"
```

### Task 2: Split the rules content into individual A4 pages

**Files:**
- Create: `src/RulesPrintRoute.tsx`
- Modify: `src/RulesRoute.tsx`
- Modify: `src/styles/global.css`
- Test: `src/RulesPrintRoute.test.tsx`

**Step 1: Write the failing test**

Assert the print route creates one A4 page container per major section:
- Goal
- Setup
- Actions
- Customer wants
- Scoring
- Card legend

Also assert the pages are ordered and use print-specific page wrapper classes.

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/RulesPrintRoute.test.tsx`
Expected: FAIL until the sections are split into individual page containers.

**Step 3: Write minimal implementation**

Move the rules content into shared section descriptors or shared subcomponents, then render those descriptors in the print route as separate A4-sized pages. Apply page-break rules and print-only spacing so each page fits cleanly on A4.

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/RulesPrintRoute.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/RulesRoute.tsx src/RulesPrintRoute.tsx src/styles/global.css src/RulesPrintRoute.test.tsx
git commit -m "feat: paginate rules into a4 print pages"
```

### Task 3: Wire navigation and preserve the existing web rules page

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/RulesRoute.test.tsx`
- Modify: `src/PrintRoute.test.tsx`

**Step 1: Write the failing test**

Add assertions that:
- `/rules` still renders the current web rules route
- `/rules-print` is reachable without affecting the current `/print` route
- the existing print route remains unchanged for the card sheet layout

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/RulesRoute.test.tsx src/PrintRoute.test.tsx`
Expected: FAIL until the router exposes the new path.

**Step 3: Write minimal implementation**

Add a dedicated `/rules-print` route branch in `App.tsx`. Keep the nav entry optional if it would clutter the main navigation, and make sure the new route loads only the print-oriented rules layout.

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/RulesRoute.test.tsx src/PrintRoute.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/App.tsx src/RulesRoute.test.tsx src/PrintRoute.test.tsx
git commit -m "feat: wire rules print route into app"
```
