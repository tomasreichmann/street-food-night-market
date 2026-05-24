import { describe, expect, it } from 'vitest';
import { loadCardContent, loadContent } from './loadContent';
import {
  formatCost,
  formatCustomerWant,
  summarizeCardContent,
} from './contentSummary';
import {
  enumerateCustomerDishCombinations,
  formatDishCombination,
  getCombinationCost,
} from './customerMatching';

describe('contentSummary', () => {
  it('calculates weighted card and dish type totals', () => {
    const summary = summarizeCardContent(loadCardContent());

    expect(summary.dishRows).toHaveLength(17);
    expect(summary.customerRows).toHaveLength(20);
    expect(summary.totals.dishCopies).toBe(36);
    expect(summary.totals.customerCopies).toBe(30);
    expect(summary.totals.totalCardCopies).toBe(66);
    expect(summary.totals.dishTypeTotals).toEqual([
      ['soup', 6],
      ['noodles', 5],
      ['rice', 7],
      ['vegetarian', 8],
      ['drink', 4],
      ['sweet', 4],
      ['meat', 11],
      ['seafood', 9],
      ['premium', 8],
    ]);
    expect(summary.totals.resourceUsageTotals).toEqual([
      ['greens', 33],
      ['fungi', 18],
      ['fuel', 30],
      ['meat', 13],
      ['sea', 20],
    ]);
  });

  it('normalizes resource labels for simulation and print surfaces', () => {
    const content = loadCardContent();

    expect(content.resources.map((resource) => resource.label)).toEqual([
      'Seafood',
      'Greens',
      'Fuel',
      'Umami',
      'Meat',
    ]);
  });

  it('formats dish costs and customer wants', () => {
    const content = loadCardContent();

    expect(formatCost(content.dishes[0]!.cost)).toBe(
      'greens 1, fungi 1, fuel 1',
    );
    expect(formatCustomerWant(content.customers[0]!)).toBe('any noodles');
    expect(formatCustomerWant(content.customers[4]!)).toBe('any seafood');
    expect(formatCustomerWant(content.customers[10]!)).toBe('meat + rice');
    expect(formatCustomerWant(content.customers[11]!)).toBe(
      '3 different dish types',
    );
    expect(formatCustomerWant(content.customers[15]!)).toBe(
      'up to 3x sweet or drink',
    );
  });

  it('enumerates every valid dish combination for representative customer wants', () => {
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
        '  - id: double-rice',
        '    type: customer',
        '    tier: 2',
        '    copies: 1',
        '    size: standard',
        '    title: Double Rice',
        '    wants:',
        '      mode: any_tag',
        '      tag: rice',
        '      count: 2',
        '    payout:',
        '      coins: 8',
        '    text: Double rice.',
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
      'inline combinations fixture',
    );

    expect(
      enumerateCustomerDishCombinations(
        content.customers[0]!,
        content.dishes,
      ).map(formatDishCombination),
    ).toEqual(['Rice Plate + Tea', 'Curry Bowl + Tea']);
    expect(
      enumerateCustomerDishCombinations(
        content.customers[1]!,
        content.dishes,
      ).map(formatDishCombination),
    ).toContain('Rice Plate x2');
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

  it('counts dish coverage by partial customer satisfaction', () => {
    const summary = summarizeCardContent(loadCardContent());
    const ramen = summary.dishRows.find((row) => row.id === 'ramen-bowl');

    expect(ramen?.customerCoverageUnique).toBeGreaterThanOrEqual(3);
    expect(ramen?.customerCoverageCopies).toBeGreaterThanOrEqual(6);
  });

  it('lists only the five cheapest costed combinations and reports total combinations', () => {
    const summary = summarizeCardContent(loadCardContent());
    const foodBlogger = summary.customerRows.find(
      (row) => row.id === 'food-blogger',
    );

    expect(foodBlogger?.dishCombinations).toHaveLength(5);
    expect(foodBlogger?.dishCombinationCount).toBeGreaterThan(5);
    expect(foodBlogger?.dishCombinationSummary).toMatch(/5 of \d+ shown/);
    expect(foodBlogger?.dishCombinations[0]).toMatch(/\(\d+\)$/);
    expect(foodBlogger?.dishCombinations).not.toContain('Tea + Sweet Bun x2');
  });

  it('uses the average of the three cheapest baseline combinations for economy', () => {
    const content = loadCardContent();
    const summary = summarizeCardContent(content);
    const foodBlogger = summary.customerRows.find(
      (row) => row.id === 'food-blogger',
    );
    const customer = content.customers.find(
      (candidate) => candidate.id === 'food-blogger',
    )!;
    const averageCost =
      enumerateCustomerDishCombinations(customer, content.dishes)
        .toSorted(
          (first, second) =>
            getCombinationCost(first) - getCombinationCost(second) ||
            formatDishCombination(first).localeCompare(
              formatDishCombination(second),
            ),
        )
        .slice(0, 3)
        .reduce(
          (total, combination) => total + getCombinationCost(combination),
          0,
        ) / 3;

    expect(foodBlogger?.matchedCostBasis).toBe(averageCost);
    expect(foodBlogger?.matchedDishTitle).toBe('3-cheapest average');
  });

  it('uses minimum-size combos as variable payout baselines', () => {
    const summary = summarizeCardContent(loadCardContent());
    const seafoodLover = summary.customerRows.find(
      (row) => row.id === 'seafood-lover',
    );

    expect(seafoodLover).toMatchObject({
      matchedCostBasis: 3,
      matchedDishTitle: '3-cheapest average',
    });
  });

  it('updates overlapping early customer wants and premium dish costs', () => {
    const content = loadCardContent();

    expect(
      content.dishes.find((dish) => dish.id === 'chicken-skewers')?.tags,
    ).toEqual(['meat']);
    expect(
      content.dishes.find((dish) => dish.id === 'oyster-plate'),
    ).toMatchObject({
      tags: ['seafood', 'premium'],
      cost: { sea: 3, fungi: 1, fuel: 1 },
    });
    expect(
      content.customers.find((customer) => customer.id === 'tourist'),
    ).toMatchObject({
      wants: { mode: 'any_tag', tag: 'seafood', count: 1 },
    });
    expect(
      content.customers.find((customer) => customer.id === 'hungry-student'),
    ).toMatchObject({
      wants: { mode: 'any_tag', tag: 'noodles', count: 1 },
    });
    expect(
      content.customers.find((customer) => customer.id === 'salaryman'),
    ).toMatchObject({
      wants: { mode: 'any_tag', tag: 'rice', count: 1 },
    });
    expect(
      content.customers.find((customer) => customer.id === 'night-market-kid'),
    ).toMatchObject({
      wants: { mode: 'any_tag', tag: 'sweet', count: 1 },
    });
    expect(
      content.customers.find((customer) => customer.id === 'tea-auntie'),
    ).toMatchObject({
      wants: { mode: 'any_tag', tag: 'drink', count: 1 },
    });
  });

  it('calculates printed and unique customer coverage for each dish', () => {
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
        '    copies: 3',
        '    size: standard',
        '    title: Combo',
        '    wants:',
        '      mode: combo_tags',
        '      tags: [rice, drink]',
        '    payout:',
        '      coins: 8',
        '    text: Combo.',
      ].join('\n'),
      'inline coverage fixture',
    );

    const summary = summarizeCardContent(content);

    expect(summary.dishRows[0]).toMatchObject({
      customerCoverageCopies: 5,
      customerCoverageUnique: 2,
      customerCoverageLabel: '5 (2 unique)',
    });
    expect(summary.dishRows[1]).toMatchObject({
      customerCoverageCopies: 3,
      customerCoverageUnique: 1,
      customerCoverageLabel: '3 (1 unique)',
    });
  });

  it('evaluates tier 1 fixed payout against matched dish cost', () => {
    const summary = summarizeCardContent(loadCardContent());
    const hungryStudent = summary.customerRows.find(
      (row) => row.title === 'Hungry Student',
    );

    expect(hungryStudent).toMatchObject({
      matchedDishTitle: '3-cheapest average',
      matchedCostBasis: 3.5,
      reward: '5 coins',
      economyRatio: '1.43x',
      economyStatus: 'OK',
    });
  });

  it('evaluates tier 2 combo payout against matched dish costs', () => {
    const summary = summarizeCardContent(loadCardContent());
    const sumoWrestler = summary.customerRows.find(
      (row) => row.title === 'Sumo Wrestler',
    );

    expect(sumoWrestler).toMatchObject({
      matchedDishTitle: '3-cheapest average',
      matchedCostBasis: 5.333333333333333,
      reward: '13 coins',
      economyRatio: '2.44x',
      economyStatus: 'OK',
    });
  });

  it('evaluates scalable and endgame customer payouts', () => {
    const summary = summarizeCardContent(loadCardContent());
    const animeClub = summary.customerRows.find(
      (row) => row.title === 'Anime Club',
    );
    const festivalJudge = summary.customerRows.find(
      (row) => row.title === 'Festival Judge',
    );

    expect(animeClub).toMatchObject({
      matchedDishTitle: '3-cheapest average',
      matchedCostBasis: 2.6666666666666665,
      reward: '7 coins per served, max 21',
      economyRatio: '2.63x',
      economyStatus: 'OK',
    });
    expect(festivalJudge).toMatchObject({
      matchedDishTitle: '3-cheapest average',
      matchedCostBasis: 9.666666666666666,
      reward:
        '37 coins; end game: +1 coin per different customer archetype served',
      economyRatio: '3.83x',
      economyStatus: 'OK',
    });
  });

  it('keeps every customer matched and economically balanced', () => {
    const summary = summarizeCardContent(loadCardContent());

    expect(summary.customerRows).toHaveLength(20);
    expect(
      summary.customerRows.filter((row) => row.economyStatus !== 'OK'),
    ).toEqual([]);
  });

  it('returns no match when no dish has the requested tag', () => {
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
