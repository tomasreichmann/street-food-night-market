import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

function renderAtSimulationRoute() {
  window.history.pushState({}, '', '/simulation');
  render(<App />);
}

function clickNextRound() {
  fireEvent.click(screen.getAllByRole('button', { name: 'Next Round' })[0]!);
}

afterEach(() => {
  window.history.pushState({}, '', '/');
});

describe('Simulation route', () => {
  it('renders an editable game config form', () => {
    renderAtSimulationRoute();

    expect(
      screen.getByRole('heading', { name: 'Simulation' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Players')).toHaveValue(15);
    expect(screen.getByLabelText('Starting resources')).toHaveValue(3);
    expect(screen.getByLabelText('Seafood supply')).toHaveValue(30);
    expect(screen.getByLabelText('Customer decks')).toHaveValue(4);
  });

  it('adds one row per player for each generated round with dividers between rounds', () => {
    renderAtSimulationRoute();

    fireEvent.change(screen.getByLabelText('Players'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    clickNextRound();

    expect(screen.getAllByTestId('simulation-player-row')).toHaveLength(2);
    expect(screen.getByTestId('simulation-round-start-row')).toHaveTextContent(
      'Seafood',
    );
    expect(screen.getByTestId('simulation-round-start-row')).toHaveTextContent(
      'Greens',
    );

    clickNextRound();

    expect(screen.getAllByTestId('simulation-player-row')).toHaveLength(4);
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('summarizes claimed customers and player scores below the table', () => {
    renderAtSimulationRoute();

    fireEvent.change(screen.getByLabelText('Players'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    clickNextRound();

    expect(
      screen.getByRole('heading', { name: 'Claimed customers and final score' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('simulation-score-summary')).toHaveTextContent(
      /Player 1/,
    );
    expect(screen.getByTestId('simulation-score-summary')).toHaveTextContent(
      /points/,
    );
    expect(screen.getByTestId('simulation-score-summary')).toHaveTextContent(
      /Meal bonus/,
    );
    expect(screen.getByTestId('simulation-score-summary')).toHaveTextContent(
      /End game bonuses/,
    );
  });

  it('restarts the simulation from the current form values and clears the table', () => {
    renderAtSimulationRoute();

    fireEvent.change(screen.getByLabelText('Players'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    clickNextRound();
    expect(screen.getAllByTestId('simulation-player-row')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));

    expect(screen.queryAllByTestId('simulation-player-row')).toHaveLength(0);
    expect(screen.getByText('Current round 0')).toBeInTheDocument();
  });
});
