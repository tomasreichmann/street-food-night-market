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
    expect(screen.getAllByText('Ramen Bowl').length).toBeGreaterThan(0);
    expect(screen.queryByText('Hungry Student')).not.toBeInTheDocument();
    expect(screen.getAllByText('Auntie').length).toBeGreaterThan(0);
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Card planning table' }),
    ).toBeInTheDocument();
    expect(screen.getByText('meat: 13')).toBeInTheDocument();
    expect(screen.getByText('greens: 41')).toBeInTheDocument();
    expect(screen.getAllByText('Festival Judge').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Imperial Tasting Menu').length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText('Review')).not.toBeInTheDocument();
  });

  it('exposes a rules navigation link from the app shell', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Rules' })).toHaveAttribute(
      'href',
      '/rules',
    );
    expect(screen.getByRole('link', { name: 'Bonus Tasks' })).toHaveAttribute(
      'href',
      '/bonus-tasks',
    );
  });
});
