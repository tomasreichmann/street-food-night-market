import { describe, expect, it } from 'vitest';
import { loadCardContent, loadContent } from './loadContent';

describe('loadContent', () => {
  it('parses cards.yaml into typed game content', () => {
    const content = loadCardContent();

    expect(content.resources).toHaveLength(5);
    expect(content.dishes).toHaveLength(18);
    expect(content.customers).toHaveLength(19);
    expect(content.dishes[0]?.title).toBe('Ramen Bowl');
    expect(content.customers.at(-1)?.title).toBe('K-Pop Band');
    expect(content.customers.at(-1)?.endgameBonus).toBe(
      '+1 coin per male customer served',
    );
    expect(content.dishes[0]).not.toHaveProperty('illustrationPrompt');
  });

  it('adds sea-heavy dishes to improve resource balance', () => {
    const content = loadCardContent();

    expect(content.dishes.map((dish) => dish.id)).toEqual(
      expect.arrayContaining(['sashimi', 'oyster-plate']),
    );
    expect(content.dishes.find((dish) => dish.id === 'sashimi')).toMatchObject({
      tags: ['seafood'],
      cost: { sea: 2 },
      copies: 2,
    });
  });

  it('uses a seafood want for Tourist', () => {
    const content = loadCardContent();
    const tourist = content.customers.find(
      (customer) => customer.id === 'tourist',
    );

    expect(tourist?.wants).toEqual({
      mode: 'any_tag',
      tag: 'seafood',
      count: 1,
    });
    expect(
      content.customers.filter(
        (customer) => customer.wants.mode === 'exact_dish',
      ),
    ).toEqual([]);
  });

  it('updates requested endgame bonuses and stronger K-Pop requirements', () => {
    const content = loadCardContent();

    expect(
      content.customers.find((customer) => customer.id === 'celebrity-chef')
        ?.endgameBonus,
    ).toBe('+1 coin per female customer served');
    expect(
      content.customers.find((customer) => customer.id === 'seafood-lover')
        ?.endgameBonus,
    ).toBe('+1 coin per leftover Sea resource');
    expect(
      content.customers.find((customer) => customer.id === 'k-pop-band-female'),
    ).toMatchObject({
      wants: {
        mode: 'combo_tags',
        tags: ['premium', 'meat', 'rice'],
      },
      endgameBonus: '+1 coin per male customer served',
    });
  });

  it('updates Sumo Wrestler to a scaled meat-or-rice customer', () => {
    const content = loadCardContent();

    expect(
      content.customers.find((customer) => customer.id === 'sumo-wrestler'),
    ).toMatchObject({
      wants: {
        mode: 'up_to_any_tag',
        tags: ['meat', 'rice'],
        minCount: 2,
        count: 5,
      },
      payout: {
        coinsPerServed: 6,
        maxCoins: 30,
      },
      text: 'Serve 2-5 Meat or Rice dishes. Gain 6 coins for each served.',
    });
  });

  it('parses all supported customer requirement modes', () => {
    const content = loadContent(
      [
        'resources:',
        '  - id: greens',
        '    label: Greens',
        '    prompt: Greens prompt',
        'dishes:',
        '  - id: rice-plate',
        '    type: dish',
        '    tier: 1',
        '    copies: 1',
        '    size: standard',
        '    title: Rice Plate',
        '    tags: [rice, vegetarian]',
        '    cost:',
        '      greens: 2',
        '    text: Rice.',
        '  - id: tea',
        '    type: dish',
        '    tier: 1',
        '    copies: 1',
        '    size: standard',
        '    title: Tea',
        '    tags: [drink]',
        '    cost:',
        '      greens: 1',
        '    text: Tea.',
        'customers:',
        '  - id: any-of-tags',
        '    type: customer',
        '    tier: 1',
        '    copies: 1',
        '    size: standard',
        '    title: Any Of Tags',
        '    wants:',
        '      mode: any_of_tags',
        '      tags: [rice, drink]',
        '      count: 1',
        '    payout:',
        '      coins: 4',
        '    text: Any of tags.',
        '  - id: exact-dish',
        '    type: customer',
        '    tier: 1',
        '    copies: 1',
        '    size: standard',
        '    title: Exact Dish',
        '    wants:',
        '      mode: exact_dish',
        '      dishId: rice-plate',
        '    payout:',
        '      coins: 4',
        '    text: Exact dish.',
        '  - id: combo-tags',
        '    type: customer',
        '    tier: 2',
        '    copies: 1',
        '    size: standard',
        '    title: Combo Tags',
        '    wants:',
        '      mode: combo_tags',
        '      tags: [rice, drink]',
        '    payout:',
        '      coins: 8',
        '    text: Combo tags.',
        '  - id: up-to-any-tag',
        '    type: customer',
        '    tier: 2',
        '    copies: 1',
        '    size: standard',
        '    title: Up To Any Tag',
        '    wants:',
        '      mode: up_to_any_tag',
        '      tags: [rice, drink]',
        '      count: 2',
        '    payout:',
        '      coinsPerServed: 4',
        '      maxCoins: 8',
        '    text: Up to any tag.',
        '  - id: variety-tags',
        '    type: customer',
        '    tier: 2',
        '    copies: 1',
        '    size: standard',
        '    title: Variety Tags',
        '    wants:',
        '      mode: variety_tags',
        '      count: 2',
        '    payout:',
        '      coins: 8',
        '    text: Variety tags.',
      ].join('\n'),
      'inline modes fixture',
    );

    expect(content.customers.map((customer) => customer.wants.mode)).toEqual([
      'any_of_tags',
      'exact_dish',
      'combo_tags',
      'up_to_any_tag',
      'variety_tags',
    ]);
  });

  it('uses Premium requirements on selected customers', () => {
    const content = loadCardContent();
    const premiumCustomerIds = content.customers
      .filter(
        (customer) =>
          'tags' in customer.wants && customer.wants.tags.includes('premium'),
      )
      .map((customer) => customer.id);

    expect(premiumCustomerIds).toEqual([
      'business-executive',
      'celebrity-chef',
      'festival-judge',
      'k-pop-band-female',
    ]);
  });

  it('rejects dish costs that point at unknown resources', () => {
    expect(() =>
      loadContent(
        [
          'resources:',
          '  - id: sea',
          '    label: Sea',
          '    prompt: Sea prompt',
          'dishes:',
          '  - id: bad-dish',
          '    type: dish',
          '    tier: 1',
          '    copies: 1',
          '    size: standard',
          '    title: Bad Dish',
          '    tags: [test]',
          '    cost:',
          '      unknown-resource: 1',
          '    text: Broken',
          'customers: []',
        ].join('\n'),
        'inline fixture',
      ),
    ).toThrow(/Unknown resource reference/);
  });

  it('rejects exact dish customer wants that point at unknown dishes', () => {
    expect(() =>
      loadContent(
        [
          'resources:',
          '  - id: greens',
          '    label: Greens',
          '    prompt: Greens prompt',
          'dishes:',
          '  - id: rice-plate',
          '    type: dish',
          '    tier: 1',
          '    copies: 1',
          '    size: standard',
          '    title: Rice Plate',
          '    tags: [rice]',
          '    cost:',
          '      greens: 1',
          '    text: Rice.',
          'customers:',
          '  - id: bad-customer',
          '    type: customer',
          '    tier: 1',
          '    copies: 1',
          '    size: standard',
          '    title: Bad Customer',
          '    wants:',
          '      mode: exact_dish',
          '      dishId: missing-dish',
          '    payout:',
          '      coins: 3',
          '    text: Bad reference.',
        ].join('\n'),
        'inline exact dish fixture',
      ),
    ).toThrow(/Unknown dish reference/);
  });
});
