import type { CustomerCard, DishCard, GameContent } from './schema';
import {
  dishCanPartiallySatisfyCustomer,
  enumerateCustomerDishCombinations,
  formatCostedDishCombination,
  getAverageCheapestCombinationCost,
  getBaselineCombinations,
  sortCombinationsByCost,
} from './customerMatching';

export type EconomyStatus = 'OK' | 'Review' | 'No match';

export type DishSummaryRow = {
  id: string;
  title: string;
  tier: number;
  copies: number;
  dishTypes: string;
  cost: string;
  costTotal: number;
  customerCoverageCopies: number;
  customerCoverageUnique: number;
  customerCoverageLabel: string;
};

export type CustomerSummaryRow = {
  id: string;
  title: string;
  tier: number;
  copies: number;
  want: string;
  reward: string;
  matchedDishTitle: string;
  matchedCostBasis: number | null;
  dishCombinations: string[];
  dishCombinationCount: number;
  dishCombinationSummary: string;
  economyRatio: string;
  economyStatus: EconomyStatus;
  economyNote: string;
};

export type CardContentSummary = {
  dishRows: DishSummaryRow[];
  customerRows: CustomerSummaryRow[];
  totals: {
    dishCopies: number;
    customerCopies: number;
    totalCardCopies: number;
    dishTypeTotals: Array<[string, number]>;
    resourceUsageTotals: Array<[string, number]>;
  };
};

function getCostTotal(cost: Record<string, number>) {
  return Object.values(cost).reduce((total, quantity) => total + quantity, 0);
}

function joinWithOr(items: string[]) {
  return items.join(' or ');
}

function formatCountedLabel(count: number, label: string) {
  return count === 1 ? label : `${count}x ${label}`;
}

function formatScalingWantRange(
  minCount: number | undefined,
  maxCount: number,
) {
  return minCount && minCount > 1
    ? `${minCount}-${maxCount}x`
    : `up to ${maxCount}x`;
}

function titleizeId(id: string) {
  return id
    .split('-')
    .map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`)
    .join(' ');
}

function getDishTitleById(dishes: DishCard[], dishId: string) {
  return dishes.find((dish) => dish.id === dishId)?.title ?? titleizeId(dishId);
}

function getBaselineLabel(customer: CustomerCard) {
  if (
    customer.wants.mode === 'any_of_tags' ||
    customer.wants.mode === 'up_to_any_tag'
  ) {
    return 'OR-branch average';
  }

  return '3-cheapest average';
}

function getOrBranchBaselineCosts(customer: CustomerCard, dishes: DishCard[]) {
  if (
    customer.wants.mode !== 'any_of_tags' &&
    customer.wants.mode !== 'up_to_any_tag'
  ) {
    return [];
  }

  return customer.wants.tags
    .map((tag) => {
      const branchCustomer: CustomerCard =
        customer.wants.mode === 'any_of_tags'
          ? {
              ...customer,
              wants: {
                mode: 'any_tag',
                tag,
                count: customer.wants.count,
              },
            }
          : {
              ...customer,
              wants: {
                mode: 'up_to_tag',
                tag,
                count: customer.wants.count,
                minCount: customer.wants.minCount,
              },
            };

      const baselineCombinations = getBaselineCombinations(
        branchCustomer,
        dishes,
      );
      return getAverageCheapestCombinationCost(baselineCombinations);
    })
    .filter((cost): cost is number => cost !== null);
}

function getMatchedCostBasis(customer: CustomerCard, dishes: DishCard[]) {
  if (customer.wants.mode === 'any_of_tags') {
    const branchCosts = getOrBranchBaselineCosts(customer, dishes);

    if (branchCosts.length === 0) {
      return null;
    }

    return (
      branchCosts.reduce((total, cost) => total + cost, 0) / branchCosts.length
    );
  }

  if (customer.wants.mode === 'up_to_any_tag') {
    const branchCosts = getOrBranchBaselineCosts(customer, dishes);

    if (branchCosts.length === 0) {
      return null;
    }

    const minimumSize = customer.wants.minCount ?? 1;
    const branchAverage =
      branchCosts.reduce((total, cost) => total + cost, 0) / branchCosts.length;

    return branchAverage / minimumSize;
  }

  const baselineCombinations = getBaselineCombinations(customer, dishes);

  return getAverageCheapestCombinationCost(baselineCombinations);
}

export function formatCost(cost: Record<string, number>) {
  return Object.entries(cost)
    .map(([resourceId, quantity]) => `${resourceId} ${quantity}`)
    .join(', ');
}

export function formatCustomerWant(
  customer: CustomerCard,
  dishes: DishCard[] = [],
) {
  if (customer.wants.mode === 'any_tag') {
    return `any ${formatCountedLabel(customer.wants.count, customer.wants.tag)}`;
  }

  if (customer.wants.mode === 'any_of_tags') {
    return `any ${formatCountedLabel(customer.wants.count, joinWithOr(customer.wants.tags))}`;
  }

  if (customer.wants.mode === 'exact_dish') {
    return getDishTitleById(dishes, customer.wants.dishId);
  }

  if (customer.wants.mode === 'combo_tags') {
    return customer.wants.tags.join(' + ');
  }

  if (customer.wants.mode === 'up_to_tag') {
    return `${formatScalingWantRange(customer.wants.minCount, customer.wants.count)} ${customer.wants.tag}`;
  }

  if (customer.wants.mode === 'up_to_any_tag') {
    return `${formatScalingWantRange(customer.wants.minCount, customer.wants.count)} ${joinWithOr(customer.wants.tags)}`;
  }

  return `${customer.wants.count}x different dish types`;
}

function formatPayout(customer: CustomerCard) {
  const endgameBonus = customer.endgameBonus
    ? `; end game: ${customer.endgameBonus}`
    : '';

  if ('coins' in customer.payout) {
    return `${customer.payout.coins} coins${endgameBonus}`;
  }

  return `${customer.payout.coinsPerServed} coins per served, max ${customer.payout.maxCoins}${endgameBonus}`;
}

function getPayoutBasis(customer: CustomerCard) {
  if ('coins' in customer.payout) {
    return customer.payout.coins;
  }

  return customer.payout.coinsPerServed;
}

function formatRatio(payoutBasis: number, costBasis: number) {
  return `${(payoutBasis / costBasis).toFixed(2)}x`;
}

function getEconomyStatus(
  tier: number,
  ratio: number,
  hasEndgameBonus: boolean,
): EconomyStatus {
  if (tier === 1) {
    return ratio >= 1.35 && ratio <= 1.9 ? 'OK' : 'Review';
  }

  if (tier === 2) {
    return ratio >= 1.9 && ratio <= 2.85 ? 'OK' : 'Review';
  }

  if (tier === 3) {
    return ratio >= 3 && ratio <= (hasEndgameBonus ? 4.25 : 4)
      ? 'OK'
      : 'Review';
  }

  return 'Review';
}

function getEconomyNote(
  customer: CustomerCard,
  ratio: string,
  status: EconomyStatus,
) {
  if (status === 'No match') {
    return `No dish currently has the ${customer.wants.tag} type.`;
  }

  if (customer.tier === 1) {
    return `${ratio}; Tier 1 target is about 150% of average baseline cost.`;
  }

  if (customer.tier === 2) {
    return `${ratio}; Tier 2 target is about 250% of average baseline cost.`;
  }

  if (customer.tier === 3) {
    return `${ratio}; Tier 3 target is about 300-400% of average baseline cost, before endgame bonuses.`;
  }

  return `${ratio}; no tier target is documented for this customer.`;
}

function summarizeCustomer(
  customer: CustomerCard,
  dishes: DishCard[],
): CustomerSummaryRow {
  const combinations = enumerateCustomerDishCombinations(customer, dishes);
  const sortedCombinations = sortCombinationsByCost(combinations);
  const dishCombinations = sortedCombinations
    .slice(0, 5)
    .map(formatCostedDishCombination);
  const dishCombinationSummary =
    combinations.length > 0
      ? `${Math.min(5, combinations.length)} of ${combinations.length} shown`
      : '0 combinations';
  const matchedCostBasis = getMatchedCostBasis(customer, dishes);

  if (matchedCostBasis === null) {
    return {
      id: customer.id,
      title: customer.title,
      tier: customer.tier,
      copies: customer.copies,
      want: formatCustomerWant(customer, dishes),
      reward: formatPayout(customer),
      matchedDishTitle: 'No matching dish',
      matchedCostBasis: null,
      dishCombinations,
      dishCombinationCount: combinations.length,
      dishCombinationSummary,
      economyRatio: 'n/a',
      economyStatus: 'No match',
      economyNote: getEconomyNote(customer, 'n/a', 'No match'),
    };
  }

  const payoutBasis = getPayoutBasis(customer);
  const economyRatioValue = payoutBasis / matchedCostBasis;
  const economyStatus = getEconomyStatus(
    customer.tier,
    economyRatioValue,
    Boolean(customer.endgameBonus),
  );
  const economyRatio = formatRatio(payoutBasis, matchedCostBasis);

  return {
    id: customer.id,
    title: customer.title,
    tier: customer.tier,
    copies: customer.copies,
    want: formatCustomerWant(customer, dishes),
    reward: formatPayout(customer),
    matchedDishTitle: getBaselineLabel(customer),
    matchedCostBasis,
    dishCombinations,
    dishCombinationCount: combinations.length,
    dishCombinationSummary,
    economyRatio,
    economyStatus,
    economyNote: getEconomyNote(customer, economyRatio, economyStatus),
  };
}

export function summarizeCardContent(content: GameContent): CardContentSummary {
  const dishTypeTotals = new Map<string, number>();
  const resourceUsageTotals = new Map<string, number>();
  const coverageByDish = new Map<
    string,
    { customerCopies: number; uniqueCustomers: number }
  >();

  for (const dish of content.dishes) {
    coverageByDish.set(dish.id, { customerCopies: 0, uniqueCustomers: 0 });
  }

  for (const customer of content.customers) {
    const satisfyingDishIds = new Set(
      content.dishes
        .filter((dish) => dishCanPartiallySatisfyCustomer(dish, customer))
        .map((dish) => dish.id),
    );

    for (const dishId of satisfyingDishIds) {
      const coverage = coverageByDish.get(dishId);

      if (!coverage) {
        continue;
      }

      coverage.customerCopies += customer.copies;
      coverage.uniqueCustomers += 1;
    }
  }

  const dishRows = content.dishes.map((dish) => {
    for (const tag of dish.tags) {
      dishTypeTotals.set(tag, (dishTypeTotals.get(tag) ?? 0) + dish.copies);
    }

    for (const [resourceId, amount] of Object.entries(dish.cost)) {
      resourceUsageTotals.set(
        resourceId,
        (resourceUsageTotals.get(resourceId) ?? 0) + amount * dish.copies,
      );
    }

    return {
      id: dish.id,
      title: dish.title,
      tier: dish.tier,
      copies: dish.copies,
      dishTypes: dish.tags.join(', '),
      cost: formatCost(dish.cost),
      costTotal: getCostTotal(dish.cost),
      customerCoverageCopies: coverageByDish.get(dish.id)?.customerCopies ?? 0,
      customerCoverageUnique: coverageByDish.get(dish.id)?.uniqueCustomers ?? 0,
      customerCoverageLabel: `${coverageByDish.get(dish.id)?.customerCopies ?? 0} (${coverageByDish.get(dish.id)?.uniqueCustomers ?? 0} unique)`,
    };
  });

  const customerRows = content.customers.map((customer) =>
    summarizeCustomer(customer, content.dishes),
  );
  const dishCopies = content.dishes.reduce(
    (total, dish) => total + dish.copies,
    0,
  );
  const customerCopies = content.customers.reduce(
    (total, customer) => total + customer.copies,
    0,
  );

  return {
    dishRows,
    customerRows,
    totals: {
      dishCopies,
      customerCopies,
      totalCardCopies: dishCopies + customerCopies,
      dishTypeTotals: Array.from(dishTypeTotals.entries()),
      resourceUsageTotals: Array.from(resourceUsageTotals.entries()),
    },
  };
}
