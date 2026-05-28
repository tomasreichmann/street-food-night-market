import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

function renderAtRulesPrintRoute() {
  window.history.pushState({}, '', '/rules-print');
  return render(<App />);
}

afterEach(() => {
  window.history.pushState({}, '', '/');
});

describe('Rules print route', () => {
  it('renders one A4 page per major rules section', () => {
    renderAtRulesPrintRoute();

    expect(
      screen.getByRole('heading', { name: 'Street Food Night Market' }),
    ).toBeInTheDocument();

    const pages = screen.getAllByTestId('rules-print-page');
    expect(pages).toHaveLength(7);
    expect(within(pages[0]).getByText('Goal')).toBeInTheDocument();
    expect(within(pages[1]).getByText('Setup')).toBeInTheDocument();
    expect(within(pages[2]).getByText('Actions')).toBeInTheDocument();
    expect(within(pages[3]).getByText('Customer wants')).toBeInTheDocument();
    expect(within(pages[4]).getByText('Scoring')).toBeInTheDocument();
    expect(within(pages[5]).getByText('Card legend')).toBeInTheDocument();
    expect(within(pages[6]).getByText('Street Food Night Market')).toBeInTheDocument();
  });
});
