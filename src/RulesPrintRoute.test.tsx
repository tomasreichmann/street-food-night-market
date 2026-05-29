import { render, screen } from '@testing-library/react';
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
    for (const page of pages) {
      expect(page.querySelectorAll('section').length).toBeGreaterThan(0);
    }
  });
});
