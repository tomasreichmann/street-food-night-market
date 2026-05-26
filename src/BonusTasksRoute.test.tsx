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
      within(sheets[0]).getByText('Get a kiss from someone'),
    ).toBeInTheDocument();
    expect(
      within(sheets[0]).getByText('Find someone who speaks an asian language'),
    ).toBeInTheDocument();
    expect(
      within(sheets[0]).getByText(
        'Find someone who visited the most asian countries',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Find someone who can make sushi')).toHaveLength(
      15,
    );
    expect(
      container.querySelectorAll(
        '.bonus-task-page .print-sheet__crop-marks line',
      ),
    ).toHaveLength(120);
  });
});
