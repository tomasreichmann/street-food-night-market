import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

function renderAtPlanningRoute() {
  window.history.pushState({}, '', '/planning');
  return render(<App />);
}

afterEach(() => {
  window.history.pushState({}, '', '/');
});

describe('Planning route', () => {
  it('renders the planning ledger on its own route', () => {
    renderAtPlanningRoute();

    expect(
      screen.getByRole('heading', { name: 'Card planning table' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
