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
    expect(sheets[4].textContent).toContain('Imperial Tasting');
    expect(sheets[4].textContent).toContain('Salaryman');
    expect(screen.getAllByTestId('stall-sheet')).toHaveLength(2);
    expect(screen.getAllByTestId('backface-sheet')).toHaveLength(13);
    expect(document.querySelectorAll('.backface-card')).toHaveLength(117);
    expect(screen.getAllByAltText('Stall card template')).toHaveLength(18);
  });

  it('includes crop marks on each sheet', () => {
    const { container } = renderAtPrintRoute();

    expect(container.querySelectorAll('.print-sheet__marks')).toHaveLength(26);
    expect(container.querySelector('.print-sheet__marks')).toHaveStyle({
      zIndex: '0',
    });
    expect(
      container.querySelector('.print-sheet__crop-marks line'),
    ).toHaveAttribute('y1', '9.5');
    expect(
      container.querySelectorAll('.print-sheet__registration-marks line'),
    ).toHaveLength(0);
    expect(
      container.querySelectorAll('.print-sheet__crop-marks line'),
    ).toHaveLength(1872);
  });
});
