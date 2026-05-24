import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders loaded content from cards.yaml', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Street Food Night Market' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Ramen Bowl').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hungry Student').length).toBeGreaterThan(0);
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Card planning table' }),
    ).toBeInTheDocument();
    expect(screen.getByText('soup: 6')).toBeInTheDocument();
    expect(screen.getByText('greens: 33')).toBeInTheDocument();
    expect(screen.getAllByText('Festival Judge').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Imperial Tasting Menu').length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText('Review')).not.toBeInTheDocument();
  });
});
