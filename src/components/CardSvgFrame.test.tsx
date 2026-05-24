import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardSvgFrame } from './CardSvgFrame';

describe('CardSvgFrame', () => {
  it('wraps long titles onto multiple lines', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/dish.png"
        footer={{ kind: 'none' }}
        kind="dish"
        title="Imperial Tasting Menu"
        typeIconSrc="/dish.png"
      />,
    );

    const titleLines = Array.from(container.querySelectorAll('text tspan')).map(
      (line) => line.textContent,
    );

    expect(titleLines).toEqual(['Imperial Tasting', 'Menu']);
  });

  it('renders bottom dish cost icons 50 percent larger', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/dish.png"
        footer={{ kind: 'cost', cost: { greens: 1 } }}
        kind="dish"
        title="Rice Plate"
        typeIconSrc="/dish.png"
      />,
    );

    const costIcon = container.querySelector('[data-card-part="cost-icon"]');

    expect(costIcon).toHaveAttribute('width', '9.84');
    expect(costIcon).toHaveAttribute('height', '9.84');
  });

  it('renders multi-icon customer requirements as a row', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        footer={{ kind: 'customer', coinCount: 15 }}
        kind="customer"
        tagIcons={['/rice.png', '/drink.png', '/meat.png']}
        title="Female K-Pop Band"
        typeIconSrc="/customer.png"
      />,
    );

    const bottomIcons = container.querySelectorAll(
      '[data-card-part="bottom-type-icon"] img',
    );
    const separator = container.querySelector(
      '[data-card-part="bottom-type-separator"]',
    );

    expect(bottomIcons).toHaveLength(3);
    expect(bottomIcons[0]).toHaveAttribute('style');
    expect(separator).toHaveTextContent('/');
  });

  it('renders the customer requirement row inside a scaling foreignObject', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        footer={{ kind: 'customer', coinCount: 15 }}
        kind="customer"
        tagIcons={['/rice.png', '/drink.png']}
        title="Scaling Row"
        typeIconSrc="/customer.png"
      />,
    );

    const foreignObject = container.querySelector(
      '[data-card-part="bottom-requirements-html"]',
    );
    const icon = container.querySelector(
      '[data-card-part="bottom-type-icon"] img',
    );
    const prefix = container.querySelector(
      '[data-card-part="requirement-prefix"]',
    );

    expect(foreignObject).toBeInTheDocument();
    expect(foreignObject).toHaveAttribute('width', '63');
    expect(icon).toHaveAttribute('style', expect.stringContaining('1.575em'));
    expect(prefix).toBeNull();
  });

  it('nudges plus separators slightly closer to the following icon', () => {
    const plus = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        footer={{ kind: 'customer', coinCount: 15 }}
        kind="customer"
        tagIcons={['/rice.png', '/drink.png']}
        title="Combo Plus"
        typeIconSrc="/customer.png"
        requirementSeparator="+"
      />,
    ).container.querySelector('[data-card-part="bottom-type-separator"]');
    const slash = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        footer={{ kind: 'customer', coinCount: 15 }}
        kind="customer"
        tagIcons={['/rice.png', '/drink.png']}
        title="Combo Slash"
        typeIconSrc="/customer.png"
        requirementSeparator="/"
      />,
    ).container.querySelector('[data-card-part="bottom-type-separator"]');

    expect(plus).toHaveStyle({ marginInline: '0.18em' });
    expect(slash).toHaveStyle({ marginInline: '0.1em' });
  });

  it('renders exact dish requirements as cropped card art', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        footer={{ kind: 'customer', coinCount: 15 }}
        kind="customer"
        requirementArtSrc="/ramen.png"
        title="Tourist"
        typeIconSrc="/customer.png"
      />,
    );

    const requirementArt = container.querySelector(
      '[data-card-part="bottom-requirement-art"]',
    );

    expect(requirementArt).toHaveAttribute(
      'preserveAspectRatio',
      'xMidYMid slice',
    );
    expect(parseFloat(requirementArt!.getAttribute('width')!)).toBeCloseTo(
      7.22,
    );
    expect(parseFloat(requirementArt!.getAttribute('height')!)).toBeCloseTo(
      9.84,
    );
  });

  it('renders actual customer coin amount and endgame bonus text', () => {
    const { container, getByText } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        endgameBonus="+1 coin per 2 leftover resources"
        footer={{ kind: 'customer', coinCount: 15 }}
        kind="customer"
        title="Female K-Pop Band"
        typeIconSrc="/customer.png"
      />,
    );

    expect(getByText('15')).toBeInTheDocument();
    expect(
      container.querySelector('text[data-card-part="coin-amount"]'),
    ).toHaveAttribute('font-weight', '700');
    expect(
      container.querySelector('text[data-card-part="coin-amount"]'),
    ).toHaveAttribute('stroke', '#3b322c');
    expect(container.textContent).toContain('+1 coin per 2 leftover');
    expect(container.textContent).toContain('resources');
    expect(
      container.querySelector('text[data-card-part="endgame-bonus-text"]'),
    ).toHaveAttribute('font-weight', '700');
    expect(
      container.querySelector('[data-card-part="endgame-bonus-bg"]'),
    ).toBeInTheDocument();
  });

  it('renders variable customer coin rewards on two smaller lines', () => {
    const { container, getByText } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        footer={{
          kind: 'customer',
          payoutDisplay: {
            lines: ['1-2', 'x6'],
            ariaLabel: '1 to 2 dishes, 6 coins each',
          },
        }}
        kind="customer"
        title="Seafood Lover"
        typeIconSrc="/customer.png"
      />,
    );

    expect(getByText('1-2')).toBeInTheDocument();
    expect(getByText('x6')).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-card-part="coin-amount"]'),
    ).toHaveLength(2);
    expect(
      container.querySelector('[data-card-part="coin-amount"]'),
    ).toHaveAttribute('font-size', '3');
  });

  it('renders one gold star per customer tier below the customer icon', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/customer.png"
        footer={{ kind: 'customer', coinCount: 30 }}
        kind="customer"
        tier={3}
        title="Celebrity Chef"
        typeIconSrc="/customer.png"
      />,
    );

    expect(
      container.querySelectorAll('[data-card-part="tier-star"]'),
    ).toHaveLength(3);

    const firstStar = container.querySelector('[data-card-part="tier-star"]');
    expect(firstStar).toHaveAttribute('stroke', '#fff9df');
    expect(firstStar).toHaveAttribute('stroke-width', '0.12');
  });

  it('draws the bleed cut border after the illustration', () => {
    const { container } = render(
      <CardSvgFrame
        accentSoft="#fff"
        artIconSrc="/dish.png"
        artSrc="/ramen.png"
        footer={{ kind: 'none' }}
        kind="dish"
        title="Ramen Bowl"
        typeIconSrc="/dish.png"
      />,
    );

    const image = container.querySelector('[data-card-part="illustration"]');
    const cutline = container.querySelector('.card-svg__cutline');
    const clippedGroup = container.querySelector('[data-card-part="card-art"]');

    expect(clippedGroup).toContainElement(image);
    expect(clippedGroup).toContainElement(cutline);
    expect(
      Array.from(clippedGroup?.children ?? []).indexOf(cutline!),
    ).toBeGreaterThan(Array.from(clippedGroup?.children ?? []).indexOf(image!));
  });
});
