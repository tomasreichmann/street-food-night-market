import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardSvgFrame } from './CardSvgFrame';

describe('CardSvgFrame', () => {
  it('renders an accessible card frame', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/dish.png"
        footer={{ kind: 'none' }}
        kind="dish"
        title="Test Dish"
        typeIconSrc="/dish.png"
      />,
    );

    expect(
      screen.getByRole('img', { name: /dish card: test dish/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-card-part="card-art"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-card-part="cutline"]'),
    ).toBeInTheDocument();
  });

  it('renders customer requirement and payout structures when provided', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        footer={{
          kind: 'customer',
          payoutDisplay: {
            lines: ['range', 'reward'],
            ariaLabel: 'variable reward',
          },
        }}
        kind="customer"
        requirementIcons={[{ src: '/rice.png' }, { src: '/drink.png' }]}
        requirementLabel="test requirements"
        title="Test Customer"
        typeIconSrc="/customer.png"
      />,
    );

    expect(
      screen.getByRole('img', {
        name: /customer card: test customer; wants test requirements/i,
      }),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-card-part="bottom-type-icon"] img'),
    ).toHaveLength(2);
    expect(
      container.querySelectorAll('[data-card-part="coin-amount"]'),
    ).toHaveLength(2);
  });

  it('renders exact dish requirements as art when supplied', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        footer={{ kind: 'customer', coinCount: 1 }}
        kind="customer"
        requirementArtSrc="/dish-art.png"
        title="Test Customer"
        typeIconSrc="/customer.png"
      />,
    );

    expect(
      container.querySelector('[data-card-part="bottom-requirement-art"]'),
    ).toBeInTheDocument();
  });
});
