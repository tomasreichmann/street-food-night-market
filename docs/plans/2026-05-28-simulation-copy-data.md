# Simulation Copy Data Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a copy button to the simulation route that copies the current simulation results as JSON for easy sharing in chat.

**Architecture:** Keep the export logic local to `SimulationRoute.tsx` so it can derive the payload from the already-rendered simulation state without adding new shared state. The copied payload should be deterministic JSON that includes the current config, round, player summaries, round log, and score breakdowns, making it usable both for humans and for future parsing.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, browser clipboard API.

---

### Task 1: Add a failing route test for the copy action

**Files:**
- Modify: `src/SimulationRoute.test.tsx`

**Step 1: Write the failing test**

```typescript
it('copies the current simulation results as JSON', async () => {
  renderAtSimulationRoute();

  fireEvent.change(screen.getByLabelText('Players'), {
    target: { value: '2' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
  clickNextRound();

  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });

  fireEvent.click(screen.getByRole('button', { name: 'Copy data' }));

  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('"round": 1'));
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/SimulationRoute.test.tsx -t "copies the current simulation results as JSON" -- --runInBand`
Expected: FAIL because the button and clipboard behavior do not exist yet.

**Step 3: Write minimal implementation**

Add a copy button and a small JSON export helper in `SimulationRoute.tsx`.

**Step 4: Run test to verify it passes**

Run: `npm test src/SimulationRoute.test.tsx -t "copies the current simulation results as JSON" -- --runInBand`
Expected: PASS.

### Task 2: Add payload coverage and keep the export deterministic

**Files:**
- Modify: `src/SimulationRoute.tsx`
- Modify: `src/SimulationRoute.test.tsx`

**Step 1: Write the failing test**

Add an assertion that the copied JSON includes config, round log rows, and score rows.

**Step 2: Run test to verify it fails**

Run: `npm test src/SimulationRoute.test.tsx -- --runInBand`
Expected: FAIL until the payload includes those sections.

**Step 3: Write minimal implementation**

Build the payload from the existing derived rows and score summary data, then `JSON.stringify` it with spacing for readability.

**Step 4: Run test to verify it passes**

Run: `npm test src/SimulationRoute.test.tsx -- --runInBand`
Expected: PASS.
