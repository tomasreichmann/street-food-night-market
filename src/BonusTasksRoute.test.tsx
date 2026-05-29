import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

function renderAtBonusTasksRoute() {
  window.history.pushState({}, '', '/bonus-tasks');
  return render(<App />);
}

afterEach(() => {
  window.history.pushState({}, '', '/');
});

describe('Bonus tasks route', () => {
  it('renders 15 bonus task sheets grouped 3 per page with centered cell text', () => {
    const { container } = renderAtBonusTasksRoute();

    expect(
      screen.getByRole('heading', { name: 'Bonus task sheets' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bonus Tasks' })).toHaveAttribute(
      'href',
      '/bonus-tasks',
    );

    const pages = screen.getAllByTestId('bonus-task-page');
    const sheets = screen.getAllByTestId('bonus-task-sheet');

    expect(pages).toHaveLength(5);
    expect(sheets).toHaveLength(15);
    expect(within(sheets[0]).getAllByRole('cell')).toHaveLength(9);
    expect(
      container.querySelectorAll('[data-testid="print-crop-mark-lines"] line')
        .length,
    ).toBeGreaterThan(0);
  });
});
