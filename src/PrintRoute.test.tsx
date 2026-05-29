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
  it('renders a single mixed A4 sheet stack', () => {
    renderAtPrintRoute();

    expect(
      screen.getByRole('navigation', { name: 'Primary navigation' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'A4 card sheets' }),
    ).not.toBeInTheDocument();
    const sheets = screen.getAllByTestId('print-sheet');
    expect(sheets).toHaveLength(11);
    expect(screen.getAllByTestId('stall-sheet')).toHaveLength(2);
    expect(screen.getAllByTestId('backface-sheet')).toHaveLength(13);
    expect(screen.getAllByTestId('backface-card')).toHaveLength(117);
    expect(screen.getAllByAltText('Stall card template')).toHaveLength(18);
  });

  it('includes crop marks on each sheet', () => {
    const { container } = renderAtPrintRoute();

    expect(screen.getAllByTestId('print-crop-marks')).toHaveLength(26);
    expect(
      container.querySelectorAll('[data-testid="print-crop-mark-lines"] line')
        .length,
    ).toBeGreaterThan(0);
  });
});
