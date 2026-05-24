import type { CustomerCard, DishCard } from './schema';

export type DishCombination = DishCard[];

type PhysicalDish = {
  dish: DishCard;
  copyIndex: number;
};

function getCostTotal(cost: Record<string, number>) {
  return Object.values(cost).reduce((total, quantity) => total + quantity, 0);
}

function expandDishes(dishes: DishCard[]) {
  return dishes.flatMap((dish) =>
    Array.from({ length: dish.copies }, (_, copyIndex) => ({
      dish,
      copyIndex,
    })),
  );
}

function combinationKey(combination: DishCombination) {
  return combination
    .map((dish) => dish.id)
    .toSorted()
    .join('|');
}

function uniqueCombinations(combinations: DishCombination[]) {
  const seen = new Set<string>();

  return combinations.filter((combination) => {
    const key = combinationKey(combination);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function choosePhysicalDishes(
  pool: PhysicalDish[],
  count: number,
  startIndex = 0,
): DishCombination[] {
  if (count === 0) {
    return [[]];
  }

  const combinations: DishCombination[] = [];

  for (let index = startIndex; index <= pool.length - count; index += 1) {
    const current = pool[index]!;
    const tails = choosePhysicalDishes(pool, count - 1, index + 1);

    for (const tail of tails) {
      combinations.push([current.dish, ...tail]);
    }
  }

  return uniqueCombinations(combinations);
}

function findDishById(dishes: DishCard[], dishId: string) {
  return dishes.find((dish) => dish.id === dishId);
}

function hasAnyTag(dish: DishCard, tags: string[]) {
  return tags.some((tag) => dish.tags.includes(tag));
}

function enumerateTagCombinations(
  dishes: DishCard[],
  tags: string[],
  count: number,
) {
  return choosePhysicalDishes(
    expandDishes(dishes).filter(({ dish }) => hasAnyTag(dish, tags)),
    count,
  );
}

function enumerateUpToTagCombinations(
  dishes: DishCard[],
  tags: string[],
  count: number,
) {
  return Array.from({ length: count }, (_, index) => index + 1).flatMap(
    (combinationSize) =>
      enumerateTagCombinations(dishes, tags, combinationSize),
  );
}

function enumerateComboTagCombinations(dishes: DishCard[], tags: string[]) {
  const pool = expandDishes(dishes);
  const combinations: DishCombination[] = [];

  function selectForTag(
    tagIndex: number,
    selected: PhysicalDish[],
    usedPhysicalKeys: Set<string>,
  ) {
    if (tagIndex >= tags.length) {
      combinations.push(selected.map(({ dish }) => dish));
      return;
    }

    const tag = tags[tagIndex]!;

    for (const candidate of pool) {
      const physicalKey = `${candidate.dish.id}:${candidate.copyIndex}`;

      if (
        usedPhysicalKeys.has(physicalKey) ||
        !candidate.dish.tags.includes(tag)
      ) {
        continue;
      }

      usedPhysicalKeys.add(physicalKey);
      selectForTag(tagIndex + 1, [...selected, candidate], usedPhysicalKeys);
      usedPhysicalKeys.delete(physicalKey);
    }
  }

  selectForTag(0, [], new Set());

  return uniqueCombinations(combinations);
}

function hasDistinctTagAssignment(combination: DishCombination) {
  const usedTags = new Set<string>();
  const usedDishIds = new Set<string>();

  function assign(index: number): boolean {
    if (index >= combination.length) {
      return true;
    }

    const dish = combination[index]!;

    if (usedDishIds.has(dish.id)) {
      return false;
    }

    usedDishIds.add(dish.id);

    for (const tag of dish.tags) {
      if (usedTags.has(tag)) {
        continue;
      }

      usedTags.add(tag);

      if (assign(index + 1)) {
        return true;
      }

      usedTags.delete(tag);
    }

    usedDishIds.delete(dish.id);
    return false;
  }

  return assign(0);
}

function enumerateVarietyTagCombinations(dishes: DishCard[], count: number) {
  return choosePhysicalDishes(expandDishes(dishes), count).filter(
    hasDistinctTagAssignment,
  );
}

export function enumerateCustomerDishCombinations(
  customer: CustomerCard,
  dishes: DishCard[],
): DishCombination[] {
  if (customer.wants.mode === 'any_tag') {
    return enumerateTagCombinations(
      dishes,
      [customer.wants.tag],
      customer.wants.count,
    );
  }

  if (customer.wants.mode === 'any_of_tags') {
    return enumerateTagCombinations(
      dishes,
      customer.wants.tags,
      customer.wants.count,
    );
  }

  if (customer.wants.mode === 'exact_dish') {
    const dish = findDishById(dishes, customer.wants.dishId);
    return dish ? [[dish]] : [];
  }

  if (customer.wants.mode === 'combo_tags') {
    return enumerateComboTagCombinations(dishes, customer.wants.tags);
  }

  if (customer.wants.mode === 'up_to_tag') {
    return enumerateUpToTagCombinations(
      dishes,
      [customer.wants.tag],
      customer.wants.count,
    );
  }

  if (customer.wants.mode === 'up_to_any_tag') {
    return enumerateUpToTagCombinations(
      dishes,
      customer.wants.tags,
      customer.wants.count,
    );
  }

  return enumerateVarietyTagCombinations(dishes, customer.wants.count);
}

export function dishCanPartiallySatisfyCustomer(
  dish: DishCard,
  customer: CustomerCard,
) {
  if (customer.wants.mode === 'any_tag') {
    return dish.tags.includes(customer.wants.tag);
  }

  if (customer.wants.mode === 'any_of_tags') {
    return hasAnyTag(dish, customer.wants.tags);
  }

  if (customer.wants.mode === 'exact_dish') {
    return dish.id === customer.wants.dishId;
  }

  if (customer.wants.mode === 'combo_tags') {
    return hasAnyTag(dish, customer.wants.tags);
  }

  if (customer.wants.mode === 'up_to_tag') {
    return dish.tags.includes(customer.wants.tag);
  }

  if (customer.wants.mode === 'up_to_any_tag') {
    return hasAnyTag(dish, customer.wants.tags);
  }

  return false;
}

export function getCombinationCost(combination: DishCombination) {
  return combination.reduce(
    (total, dish) => total + getCostTotal(dish.cost),
    0,
  );
}

export function getLowestCostCombination(
  customer: CustomerCard,
  dishes: DishCard[],
) {
  return enumerateCustomerDishCombinations(customer, dishes)
    .toSorted(
      (first, second) => getCombinationCost(first) - getCombinationCost(second),
    )
    .at(0);
}

export function sortCombinationsByCost(combinations: DishCombination[]) {
  return combinations.toSorted(
    (first, second) =>
      getCombinationCost(first) - getCombinationCost(second) ||
      formatDishCombination(first).localeCompare(formatDishCombination(second)),
  );
}

export function getBaselineCombinations(
  customer: CustomerCard,
  dishes: DishCard[],
) {
  const combinations = enumerateCustomerDishCombinations(customer, dishes);

  if (
    customer.wants.mode === 'up_to_tag' ||
    customer.wants.mode === 'up_to_any_tag'
  ) {
    const minimumSize = Math.min(
      ...combinations.map((combination) => combination.length),
    );

    return combinations.filter(
      (combination) => combination.length === minimumSize,
    );
  }

  return combinations;
}

export function getAverageCheapestCombinationCost(
  combinations: DishCombination[],
  count = 3,
) {
  const cheapest = sortCombinationsByCost(combinations).slice(0, count);

  if (cheapest.length === 0) {
    return null;
  }

  return (
    cheapest.reduce(
      (total, combination) => total + getCombinationCost(combination),
      0,
    ) / cheapest.length
  );
}

export function formatDishCombination(combination: DishCombination) {
  const counts = new Map<string, { title: string; count: number }>();

  for (const dish of combination) {
    const current = counts.get(dish.id);

    counts.set(dish.id, {
      title: dish.title,
      count: (current?.count ?? 0) + 1,
    });
  }

  return Array.from(counts.values())
    .map(({ title, count }) => (count > 1 ? `${title} x${count}` : title))
    .join(' + ');
}

export function formatCostedDishCombination(combination: DishCombination) {
  return `${formatDishCombination(combination)} (${getCombinationCost(combination)})`;
}
