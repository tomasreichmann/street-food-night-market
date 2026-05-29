import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

function renderAtRulesRoute() {
  window.history.pushState({}, '', '/rules');
  return render(<App />);
}

afterEach(() => {
  window.history.pushState({}, '', '/');
});

describe('Rules route', () => {
  it('renders the rules handout and sample card anatomy', () => {
    renderAtRulesRoute();

    expect(
      screen.getByRole('heading', { name: 'Street Food Night Market' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('rules-actions')).toBeInTheDocument();
    expect(screen.getByTestId('rules-wants')).toBeInTheDocument();
    expect(screen.getByTestId('rules-scoring')).toBeInTheDocument();
    expect(screen.getByTestId('rules-setup')).toBeInTheDocument();
    expect(screen.queryByAltText('Rules QR code')).toBeNull();
    expect(screen.getByTestId('rules-anatomy')).toBeInTheDocument();
    expect(
      screen.getByTestId('rules-card-legend-marker-dish-1'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('rules-card-legend-marker-customer-4'),
    ).toBeInTheDocument();
  });
});
