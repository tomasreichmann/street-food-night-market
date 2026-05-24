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
  it('renders customer tag wants as icons with count markers instead of names', () => {
    const { container } = render(
      <CardPreview kind="customer" item={customer({})} dishes={dishes} />,
    );

    const requirementIcons = container.querySelectorAll(
      '[data-card-part="bottom-type-icon"] image',
    );
    const counts = Array.from(
      container.querySelectorAll('[data-card-part="requirement-count"]'),
    ).map((node) => node.textContent);

    expect(requirementIcons).toHaveLength(2);
    expect(requirementIcons[0]).toHaveAttribute('href', dishTypeIcons.rice);
    expect(requirementIcons[1]).toHaveAttribute('href', dishTypeIcons.drink);
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

  it('renders up-to wants with the requested numeric limit', () => {
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
    ).toHaveTextContent('up to');
    expect(
      container.querySelector('[data-card-part="requirement-count"]'),
    ).toHaveTextContent('3');
  });

  it('renders variable customer payout as count range and per-served coin lines', () => {
    const { getByText } = render(
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

    expect(getByText('1-2')).toBeInTheDocument();
    expect(getByText('x6')).toBeInTheDocument();
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
