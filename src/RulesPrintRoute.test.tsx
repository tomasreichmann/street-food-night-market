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
    expect(screen.getByAltText('Rules QR code')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Rules Print' })).toHaveAttribute(
      'href',
      '/rules-print',
    );

    const pages = screen.getAllByTestId('rules-print-page');
    expect(pages).toHaveLength(5);
    expect(within(pages[0]).getByText('Goal')).toBeInTheDocument();
    expect(within(pages[0]).getByText('Setup')).toBeInTheDocument();
    expect(within(pages[0]).getByText('1 stall card')).toBeInTheDocument();
    expect(within(pages[1]).getByText('Actions')).toBeInTheDocument();
    expect(within(pages[2]).getByText('Customer wants')).toBeInTheDocument();
    expect(within(pages[3]).getByText('Scoring')).toBeInTheDocument();
    expect(within(pages[3]).getByText('The game ends when:')).toBeInTheDocument();
    expect(
      within(pages[3]).getByText('When all customers are claimed.'),
    ).toBeInTheDocument();
    expect(within(pages[3]).getByText('After 60 minutes.')).toBeInTheDocument();
    expect(
      within(pages[3]).getByText('The coolest stall card gets +10 points.'),
    ).toBeInTheDocument();
    expect(within(pages[4]).getByText('Card legend')).toBeInTheDocument();
  });
});
