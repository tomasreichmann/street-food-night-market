import { render, screen, within } from '@testing-library/react';
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
  it('renders the printable rules handout and sample card anatomy', () => {
    renderAtRulesRoute();

    expect(
      screen.getByRole('heading', { name: 'Street Food Night Market' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('rules-scoring')).toHaveTextContent(
      /most leftover dishes/i,
    );
    expect(screen.getByTestId('rules-scoring')).toHaveTextContent(
      /most leftover resources/i,
    );
    expect(
      screen.getByRole('heading', { name: 'What you can do' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/type \+ type/i)).toBeInTheDocument();

    const anatomySection = screen.getByTestId('rules-anatomy');
    expect(
      within(anatomySection).getByText('Sample dish card'),
    ).toBeInTheDocument();
    expect(
      within(anatomySection).getByText('Sample customer card'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('What the sample cards are showing'),
    ).toBeInTheDocument();
  });
});
