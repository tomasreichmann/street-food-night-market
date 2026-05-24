import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

function renderAtPrintRoute() {
  window.history.pushState({}, '', '/print');
  return render(<App />);
}

afterEach(() => {
  window.history.pushState({}, '', '/');
});

describe('Print route', () => {
  it('renders separate A4 sheet stacks for dishes and customers', () => {
    renderAtPrintRoute();

    expect(
      screen.getByRole('heading', { name: 'A4 card sheets' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dish cards' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Customer cards' }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('print-sheet')).toHaveLength(5);
    expect(screen.getByText('Ramen Bowl')).toBeInTheDocument();
    expect(screen.getByText('Sumo Wrestler')).toBeInTheDocument();
  });

  it('includes crop and registration marks on each sheet', () => {
    const { container } = renderAtPrintRoute();

    expect(container.querySelectorAll('.print-sheet__marks')).toHaveLength(5);
    expect(
      container.querySelectorAll('.print-sheet__registration-marks line'),
    ).toHaveLength(40);
    expect(container.querySelectorAll('.print-sheet__crop-marks line')).toHaveLength(
      40,
    );
  });
});
