import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
    expect(screen.getByLabelText('Starting resources')).toHaveValue(5);
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
      screen.getByRole('heading', {
        name: 'Claimed customers and final score',
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('simulation-score-summary')).toHaveTextContent(
      /Player 1/,
    );
    expect(screen.getByTestId('simulation-score-summary')).toHaveTextContent(
      /points/,
    );
    expect(screen.getByTestId('simulation-score-summary')).toHaveTextContent(
      /Dish bonus/,
    );
    expect(screen.getByTestId('simulation-score-summary')).toHaveTextContent(
      /Leftover resources/,
    );
    expect(screen.getByTestId('simulation-score-summary')).toHaveTextContent(
      /Resource bonus/,
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

  it('copies the current simulation results as JSON', async () => {
    renderAtSimulationRoute();

    fireEvent.change(screen.getByLabelText('Players'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    clickNextRound();

    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy data' }));

    expect(writeText).toHaveBeenCalledTimes(1);

    const copiedText = writeText.mock.calls[0]?.[0];

    expect(typeof copiedText).toBe('string');

    const copied = JSON.parse(copiedText as string) as {
      schemaVersion: number;
      round: number;
      players: Array<{ id: string; score: { total: number } }>;
      logRows: Array<{ round: number }>;
    };

    expect(copied.schemaVersion).toBe(1);
    expect(copied.round).toBe(1);
    expect(copied.players).toHaveLength(2);
    expect(copied.players[0]?.id).toBe('Player 1');
    expect(copied.players[0]?.score.total).toEqual(expect.any(Number));
    expect(copied.logRows).toHaveLength(2);
    expect(copied.logRows[0]?.round).toBe(1);
  });
});
