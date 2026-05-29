import { describe, expect, it } from 'vitest';
import { loadCardContent, loadContent } from './loadContent';

describe('loadContent', () => {
  it('parses default YAML into typed game content', () => {
    const content = loadCardContent();

    expect(content.resources.length).toBeGreaterThan(0);
    expect(content.dishes.length).toBeGreaterThan(0);
    expect(content.customers.length).toBeGreaterThan(0);
    expect(content.dishes[0]).not.toHaveProperty('illustrationPrompt');
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
