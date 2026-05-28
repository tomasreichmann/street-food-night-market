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
    expect(screen.getByTestId('rules-scoring')).toHaveTextContent(
      /printed coin value/i,
    );
    expect(screen.getByTestId('rules-setup')).toHaveTextContent(
      /At the start of the game, you will get/i,
    );
    expect(screen.queryByText(/shorter or easier first game/i)).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'What you can do' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/each task can only be completed once/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /3 separate dishes\. even if one dish shows more than one matching type, it still only counts once\./i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Ramen Bowl/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Seafood Lover/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Sweet \+ Drink/i)).toBeInTheDocument();
    expect(screen.getByText(/2-5 Meat \/ Rice/i)).toBeInTheDocument();
    expect(screen.getAllByText(/different dish types/i).length).toBeGreaterThan(
      0,
    );

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
    expect(within(anatomySection).getByText('Dish title')).toBeInTheDocument();
    expect(
      within(anatomySection).getByText('Printed coin value'),
    ).toBeInTheDocument();
    expect(
      within(anatomySection).getByText('The numbered markers on the sample cards match the descriptions below.'),
    ).toBeInTheDocument();
    expect(
      within(anatomySection).getByTestId('rules-card-legend-marker-dish-1'),
    ).toBeInTheDocument();
    expect(
      within(anatomySection).getByTestId('rules-card-legend-marker-customer-4'),
    ).toBeInTheDocument();
    expect(
      within(anatomySection).getByText('Customer wants'),
    ).toBeInTheDocument();
    expect(
      within(anatomySection).getByText('Endgame bonus area'),
    ).toBeInTheDocument();
    expect(within(anatomySection).queryByText('Artwork')).toBeNull();
  });
});
