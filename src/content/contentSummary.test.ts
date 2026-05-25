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

    expect(summary.dishRows).toHaveLength(18);
    expect(summary.customerRows).toHaveLength(19);
    expect(summary.totals.dishCopies).toBe(44);
    expect(summary.totals.customerCopies).toBe(44);
    expect(summary.totals.totalCardCopies).toBe(88);
    expect(summary.totals.dishTypeTotals).toEqual([
      ['soup', 7],
      ['noodles', 6],
      ['rice', 8],
      ['vegetarian', 10],
      ['drink', 7],
      ['sweet', 5],
      ['meat', 13],
      ['seafood', 9],
      ['premium', 8],
    ]);
    expect(summary.totals.resourceUsageTotals).toEqual([
      ['greens', 41],
      ['fungi', 22],
      ['fuel', 35],
      ['meat', 15],
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
    const wantFor = (customerId: string) =>
      formatCustomerWant(
        content.customers.find((customer) => customer.id === customerId)!,
      );

    expect(formatCost(content.dishes[0]!.cost)).toBe(
      'greens 1, fungi 1, fuel 1',
    );
    expect(wantFor('auntie')).toBe('meat + noodles');
    expect(wantFor('tourist')).toBe('any seafood');
    expect(wantFor('sumo-wrestler')).toBe('2-5x meat or rice');
    expect(wantFor('food-blogger')).toBe('3x different dish types');
    expect(wantFor('anime-club')).toBe('up to 3x sweet or drink');
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
    ).toBeUndefined();
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
      content.customers.find((customer) => customer.id === 'auntie'),
    ).toMatchObject({
      title: 'Auntie',
      tier: 2,
      copies: 4,
      wants: { mode: 'combo_tags', tags: ['meat', 'noodles'] },
      payout: { coins: 14 },
    });
  });

  it('keeps promoted Auntie and Business Executive on baseline coin rewards', () => {
    const summary = summarizeCardContent(loadCardContent());
    const auntie = summary.customerRows.find((row) => row.id === 'auntie');
    const businessExecutive = summary.customerRows.find(
      (row) => row.id === 'business-executive',
    );

    expect(auntie).toMatchObject({
      title: 'Auntie',
      tier: 2,
      copies: 4,
      want: 'meat + noodles',
      matchedCostBasis: 5.666666666666667,
      reward: '14 coins; end game: +2 coins per kid served',
      economyRatio: '2.47x',
      economyStatus: 'OK',
    });
    expect(businessExecutive).toMatchObject({
      tier: 3,
      copies: 1,
      want: 'premium + noodles + vegetarian',
      matchedCostBasis: 8.666666666666666,
      reward: '32 coins; end game: +2 coins per Salaryman served',
      economyRatio: '3.69x',
      economyStatus: 'OK',
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
    const auntie = summary.customerRows.find((row) => row.title === 'Auntie');

    expect(auntie).toMatchObject({
      matchedDishTitle: '3-cheapest average',
      matchedCostBasis: 5.666666666666667,
      reward: '14 coins; end game: +2 coins per kid served',
      economyRatio: '2.47x',
      economyStatus: 'OK',
    });
  });

  it('evaluates tier 2 combo payout against matched dish costs', () => {
    const summary = summarizeCardContent(loadCardContent());
    const sumoWrestler = summary.customerRows.find(
      (row) => row.title === 'Sumo Wrestler',
    );

    expect(sumoWrestler).toMatchObject({
      matchedDishTitle: 'OR-branch average',
      matchedCostBasis: 2.666666666666667,
      reward: '6 coins per served, max 30',
      economyRatio: '2.25x',
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
      matchedDishTitle: 'OR-branch average',
      matchedCostBasis: 2.833333333333333,
      reward:
        '7 coins per served, max 21; end game: counts as 2x male and 2x female customers',
      economyRatio: '2.47x',
      economyStatus: 'OK',
    });
    expect(festivalJudge).toMatchObject({
      matchedDishTitle: '3-cheapest average',
      matchedCostBasis: 9.333333333333334,
      reward:
        '37 coins; end game: +1 coin per different customer archetype served',
      economyRatio: '3.96x',
      economyStatus: 'OK',
    });
  });

  it('keeps every customer matched and economically balanced', () => {
    const summary = summarizeCardContent(loadCardContent());

    expect(summary.customerRows).toHaveLength(19);
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
