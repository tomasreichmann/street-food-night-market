import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { dishTypeIcons } from '../assets/icon-map';
import { getDishIllustration } from '../assets/illustration-map';
import type { CustomerCard, DishCard } from '../content/schema';
import { CardPreview } from './CardPreview';

const dishes: DishCard[] = [
  {
    id: 'rice-plate',
    type: 'dish',
    tier: 1,
    copies: 2,
    size: 'standard',
    title: 'Rice Plate',
    tags: ['rice', 'vegetarian'],
    cost: { greens: 2 },
    text: 'Rice.',
  },
  {
    id: 'tea',
    type: 'dish',
    tier: 1,
    copies: 1,
    size: 'standard',
    title: 'Tea',
    tags: ['drink'],
    cost: { greens: 1 },
    text: 'Tea.',
  },
];

function customer(overrides: Partial<CustomerCard>): CustomerCard {
  return {
    id: 'combo-customer',
    type: 'customer',
    tier: 2,
    copies: 1,
    size: 'standard',
    title: 'Combo Customer',
    wants: {
      mode: 'combo_tags',
      tags: ['rice', 'drink'],
    },
    payout: { coins: 8 },
    text: 'Combo.',
    ...overrides,
  };
}

describe('CardPreview', () => {
  it('renders a computed dish endgame coin value', () => {
    const { container, getByText } = render(
      <CardPreview kind="dish" item={dishes[0]} />,
    );

    expect(getByText('2')).toBeInTheDocument();
    expect(
      container.querySelector('[data-card-part="dish-endgame-coin-value"]'),
    ).toBeInTheDocument();
  });

  it('renders customer tag wants as icons with count markers instead of names', () => {
    const { container } = render(
      <CardPreview kind="customer" item={customer({})} dishes={dishes} />,
    );

    const requirementIcons = container.querySelectorAll(
      '[data-card-part="bottom-type-icon"] img',
    );
    const counts = Array.from(
      container.querySelectorAll('[data-card-part="requirement-count"]'),
    ).map((node) => node.textContent);

    expect(requirementIcons).toHaveLength(2);
    expect(requirementIcons[0]).toHaveAttribute('src', dishTypeIcons.rice);
    expect(requirementIcons[1]).toHaveAttribute('src', dishTypeIcons.drink);
    expect(counts).toEqual([]);
    expect(container.textContent?.toLowerCase()).not.toContain('rice');
    expect(container.textContent?.toLowerCase()).not.toContain('drink');
  });

  it('renders exact dish wants as the matching dish illustration thumbnail', () => {
    const { container } = render(
      <CardPreview
        kind="customer"
        item={customer({
          wants: { mode: 'exact_dish', dishId: 'rice-plate' },
        })}
        dishes={dishes}
      />,
    );

    expect(
      container.querySelector('[data-card-part="bottom-requirement-art"]'),
    ).toHaveAttribute('href', getDishIllustration('rice-plate'));
  });

  it('renders up-to wants with a numeric range prefix', () => {
    const { container } = render(
      <CardPreview
        kind="customer"
        item={customer({
          wants: {
            mode: 'up_to_any_tag',
            tags: ['rice', 'drink'],
            count: 3,
          },
          payout: { coinsPerServed: 4, maxCoins: 12 },
        })}
        dishes={dishes}
      />,
    );

    expect(
      container.querySelector('[data-card-part="requirement-prefix"]'),
    ).toHaveTextContent('1-3');
    expect(
      container.querySelector('[data-card-part="requirement-count"]'),
    ).toBeNull();
  });

  it('renders variety wants as repeated dish icons without a prefix', () => {
    const { container } = render(
      <CardPreview
        kind="customer"
        item={customer({
          wants: {
            mode: 'variety_tags',
            count: 3,
          },
        })}
        dishes={dishes}
      />,
    );

    const requirementIcons = container.querySelectorAll(
      '[data-card-part="bottom-type-icon"] img',
    );

    expect(
      container.querySelector('[data-card-part="requirement-prefix"]'),
    ).toBeNull();
    expect(requirementIcons).toHaveLength(3);
    expect(
      container.querySelector('[data-card-part="requirement-count"]'),
    ).toBeNull();
  });

  it('renders variable customer payout as count range and per-served coin lines', () => {
    const { container, getByText } = render(
      <CardPreview
        kind="customer"
        item={customer({
          wants: {
            mode: 'up_to_tag',
            tag: 'rice',
            count: 2,
          },
          payout: { coinsPerServed: 6, maxCoins: 12 },
        })}
        dishes={dishes}
      />,
    );

    expect(
      container.querySelector('[data-card-part="requirement-prefix"]'),
    ).toHaveTextContent('1-2');
    expect(getByText('x6')).toBeInTheDocument();
  });

  it('renders scaled customer payout ranges with a minimum count', () => {
    const { container } = render(
      <CardPreview
        kind="customer"
        item={customer({
          wants: {
            mode: 'up_to_any_tag',
            tags: ['rice', 'drink'],
            minCount: 2,
            count: 5,
          },
          payout: { coinsPerServed: 12, maxCoins: 60 },
        })}
        dishes={dishes}
      />,
    );

    expect(container.textContent).toContain('2-5');
    expect(container.textContent).toContain('x12');
  });

  it('passes customer tier through to render tier stars', () => {
    const { container } = render(
      <CardPreview
        kind="customer"
        item={customer({ tier: 2 })}
        dishes={dishes}
      />,
    );

    expect(
      container.querySelectorAll('[data-card-part="tier-star"]'),
    ).toHaveLength(2);
  });
});
