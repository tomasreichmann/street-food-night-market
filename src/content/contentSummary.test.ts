import { describe, expect, it } from 'vitest';
import { loadContent } from './loadContent';
import {
  formatCost,
  formatCustomerWant,
  summarizeCardContent,
} from './contentSummary';
import {
  enumerateCustomerDishCombinations,
  formatDishCombination,
} from './customerMatching';

function loadFixture() {
  return loadContent(
    [
      'resources:',
      '  - id: greens',
      '    label: Greens',
      '    prompt: Greens prompt',
      'dishes:',
      '  - id: rice-plate',
      '    type: dish',
      '    tier: 1',
      '    copies: 2',
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
      '    tags: [drink, sweet]',
      '    cost:',
      '      greens: 1',
      '    text: Tea.',
      '  - id: curry-bowl',
      '    type: dish',
      '    tier: 2',
      '    copies: 1',
      '    size: standard',
      '    title: Curry Bowl',
      '    tags: [rice, meat]',
      '    cost:',
      '      greens: 3',
      '    text: Curry.',
      'customers:',
      '  - id: rice-fan',
      '    type: customer',
      '    tier: 1',
      '    copies: 2',
      '    size: standard',
      '    title: Rice Fan',
      '    wants:',
      '      mode: any_tag',
      '      tag: rice',
      '      count: 1',
      '    payout:',
      '      coins: 4',
      '    text: Rice.',
      '  - id: combo',
      '    type: customer',
      '    tier: 2',
      '    copies: 2',
      '    size: standard',
      '    title: Combo',
      '    wants:',
      '      mode: combo_tags',
      '      tags: [rice, drink]',
      '    payout:',
      '      coins: 8',
      '    text: Combo.',
      '  - id: variety',
      '    type: customer',
      '    tier: 2',
      '    copies: 1',
      '    size: standard',
      '    title: Variety',
      '    wants:',
      '      mode: variety_tags',
      '      count: 2',
      '    payout:',
      '      coins: 8',
      '    text: Variety.',
    ].join('\n'),
    'inline summary fixture',
  );
}

describe('contentSummary', () => {
  it('calculates weighted card totals from declarative content', () => {
    const summary = summarizeCardContent(loadFixture());

    expect(summary.dishRows).toHaveLength(3);
    expect(summary.customerRows).toHaveLength(3);
    expect(summary.totals.dishCopies).toBe(4);
    expect(summary.totals.customerCopies).toBe(5);
    expect(summary.totals.totalCardCopies).toBe(9);
    expect(summary.totals.resourceUsageTotals).toEqual([['greens', 8]]);
  });

  it('formats dish costs and customer wants by requirement mode', () => {
    const content = loadFixture();

    expect(formatCost(content.dishes[0]!.cost)).toBe('greens 2');
    expect(formatCustomerWant(content.customers[0]!)).toBe('any rice');
    expect(formatCustomerWant(content.customers[1]!)).toBe('rice + drink');
    expect(formatCustomerWant(content.customers[2]!)).toBe(
      '2x different dish types',
    );
  });

  it('enumerates valid dish combinations for representative customer wants', () => {
    const content = loadFixture();

    expect(
      enumerateCustomerDishCombinations(
        content.customers[1]!,
        content.dishes,
      ).map(formatDishCombination),
    ).toEqual(['Rice Plate + Tea', 'Curry Bowl + Tea']);
    expect(
      enumerateCustomerDishCombinations(
        content.customers[2]!,
        content.dishes,
      ).map(formatDishCombination),
    ).toEqual([
      'Rice Plate + Tea',
      'Rice Plate + Curry Bowl',
      'Tea + Curry Bowl',
    ]);
  });

  it('calculates printed and unique customer coverage for each dish', () => {
    const summary = summarizeCardContent(loadFixture());

    expect(summary.dishRows[0]).toMatchObject({
      customerCoverageCopies: 4,
      customerCoverageUnique: 2,
      customerCoverageLabel: '4 (2 unique)',
    });
    expect(summary.dishRows[1]).toMatchObject({
      customerCoverageCopies: 2,
      customerCoverageUnique: 1,
      customerCoverageLabel: '2 (1 unique)',
    });
  });

  it('reports no match when no dish has the requested tag', () => {
    const summary = summarizeCardContent(
      loadContent(
        [
          'resources:',
          '  - id: greens',
          '    label: Greens',
          '    prompt: Greens prompt',
          'dishes:',
          '  - id: rice-bowl',
          '    type: dish',
          '    tier: 1',
          '    copies: 1',
          '    size: standard',
          '    title: Rice Bowl',
          '    tags: [rice]',
          '    cost:',
          '      greens: 1',
          '    text: Simple rice bowl.',
          'customers:',
          '  - id: noodle-fan',
          '    type: customer',
          '    tier: 1',
          '    copies: 1',
          '    size: standard',
          '    title: Noodle Fan',
          '    wants:',
          '      mode: any_tag',
          '      tag: noodles',
          '      count: 1',
          '    payout:',
          '      coins: 3',
          '    text: Wants noodles.',
        ].join('\n'),
        'inline no-match fixture',
      ),
    );

    expect(summary.customerRows[0]).toMatchObject({
      matchedDishTitle: 'No matching dish',
      economyStatus: 'No match',
      economyRatio: 'n/a',
    });
  });
});
