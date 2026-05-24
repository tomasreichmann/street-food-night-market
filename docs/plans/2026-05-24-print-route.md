# Print Route Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated `/print` route that lays out dish and customer cards on A4 sheets with crop and registration marks.

**Architecture:** Reuse the existing `CardPreview` and `CardSvgFrame` components so print output stays identical to the live cards. Add a route-specific paginator that chunks dish and customer cards into fixed A4 sheets, then style each sheet with physical units, crop marks, and registration marks.

**Tech Stack:** React, TypeScript, Vite, CSS, Vitest

---

### Task 1: Add the printable route shell

**Files:**
- Create: `src/PrintRoute.tsx`
- Modify: `src/App.tsx`
- Test: `src/PrintRoute.test.tsx`

**Step 1: Write the failing test**

Add a route test that pushes `window.location.pathname` to `/print` and asserts the page renders a print heading plus dish and customer sheet containers.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/PrintRoute.test.tsx`
Expected: FAIL because the route does not exist yet.

**Step 3: Write minimal implementation**

Add `/print` route detection in `App.tsx`, render `PrintRoute`, and build a route component that loads the current content and splits cards into dish and customer pages.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/PrintRoute.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/App.tsx src/PrintRoute.tsx src/PrintRoute.test.tsx
git commit -m "feat: add print route shell"
```

### Task 2: Add A4 pagination and sheet marks

**Files:**
- Modify: `src/PrintRoute.tsx`
- Modify: `src/styles/global.css`
- Test: `src/PrintRoute.test.tsx`

**Step 1: Write the failing test**

Assert the print route renders the expected number of A4 sheets for the current dish and customer counts, and that each sheet exposes crop/registration mark elements.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/PrintRoute.test.tsx`
Expected: FAIL because sheet pagination and marks are missing.

**Step 3: Write minimal implementation**

Chunk each card type into nine-card A4 pages, size sheets in millimeters, and add sheet-level marks plus card trim visibility for the print route.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/PrintRoute.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/PrintRoute.tsx src/styles/global.css src/PrintRoute.test.tsx
git commit -m "feat: paginate printable cards on a4 sheets"
```

### Task 3: Verify app navigation and print output

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`
- Test: `src/App.test.tsx`

**Step 1: Write the failing test**

Add a lightweight assertion that the app can still render the home route and the new print route without interfering with existing navigation.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL if route handling breaks the home path.

**Step 3: Write minimal implementation**

Keep the existing home and simulation routes intact, hide non-print chrome for print output, and add a print nav entry only if it does not clutter the route.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/App.tsx src/styles/global.css src/App.test.tsx
git commit -m "feat: wire print route into app shell"
```
