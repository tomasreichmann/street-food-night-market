import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

afterEach(() => {
  window.history.pushState({}, '', '/');
});

describe('App', () => {
  it('renders loaded content from cards.yaml', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Street Food Night Market' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Dish cards', { selector: 'dt' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Customer cards', { selector: 'dt' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Total cards', { selector: 'dt' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('exposes a rules navigation link from the app shell', () => {
    render(<App />);

    const navLinks = screen.getAllByRole('link');
    expect(navLinks.map((link) => link.textContent)).toEqual([
      'Home',
      'Rules',
      'Simulation',
      'Bonus Tasks',
      'Planning',
      'Print',
      'Rules Print',
    ]);
    expect(navLinks[1]).toHaveAttribute('href', '/rules');
    expect(navLinks[4]).toHaveAttribute('href', '/planning');
    expect(navLinks[6]).toHaveAttribute('href', '/rules-print');
  });
});
