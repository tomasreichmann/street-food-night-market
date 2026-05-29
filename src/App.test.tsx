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
    expect(screen.getByTestId('home-card-summary')).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('exposes route navigation links from the app shell', () => {
    render(<App />);

    const navLinks = screen.getAllByRole('link');
    const hrefs = navLinks.map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual(
      expect.arrayContaining(['/rules', '/planning', '/rules-print']),
    );
  });
});
