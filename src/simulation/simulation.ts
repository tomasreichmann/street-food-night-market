import type { GameConfig } from '../content/loadGameConfig';
import {
  enumerateCustomerDishCombinations,
  type DishCombination,
} from '../content/customerMatching';
import type { CustomerCard, DishCard, GameContent } from '../content/schema';

export type CountMap = Record<string, number>;

export type SimulationAction =
  | 'Claimed customers'
  | 'Cooked meal'
  | 'Completed bonus task'
  | 'Traded resource'
  | 'Bought resources and cooked'
  | 'No action';

export type PlayerState = {
  id: string;
  coins: number;
  resources: CountMap;
  meals: CountMap;
  claimedCustomers: string[];
};

export type RoundLogRow = {
  round: number;
  playerId: string;
  action: SimulationAction;
  mealsMade: string[];
  customersClaimed: string[];
  coins: number;
  resources: CountMap;
  meals: CountMap;
  notes: string[];
};

export type SimulationState = {
  content: GameContent;
  config: GameConfig;
  round: number;
  players: PlayerState[];
  resourceSupply: CountMap;
  dishSupply: CountMap;
  customerDecks: CustomerCard[][];
  bonusTasksRemaining: number;
  logRows: RoundLogRow[];
  roundStartResourceSupply: Record<number, CountMap>;
};

type VisibleCustomer = {
  customer: CustomerCard;
  deckIndex: number;
};

type ClaimResult = {
  state: SimulationState;
  customersClaimed: string[];
};

type TurnActionResult = {
  state: SimulationState;
  action: SimulationAction;
  mealsMade: string[];
  notes: string[];
};

type CustomerPriority = VisibleCustomer & {
  satisfiedCount: number;
  payout: number;
};

type CookCandidate = {
  dish: DishCard;
  customer: CustomerCard;
  missingCount: number;
  satisfiedCount: number;
  payout: number;
};

type TradeCandidate = {
  otherPlayerIndex: number;
  requestedResourceId: string;
  offeredResourceId: string;
};

const TIER_ORDER = [1, 2, 3];

function cloneCountMap(counts: CountMap): CountMap {
  return { ...counts };
}

function cloneState(state: SimulationState): SimulationState {
  return {
    content: state.content,
    config: state.config,
    round: state.round,
    players: state.players.map((player) => ({
      ...player,
      resources: cloneCountMap(player.resources),
      meals: cloneCountMap(player.meals),
      claimedCustomers: [...player.claimedCustomers],
    })),
    resourceSupply: cloneCountMap(state.resourceSupply),
    dishSupply: cloneCountMap(state.dishSupply),
    customerDecks: state.customerDecks.map((deck) => [...deck]),
    bonusTasksRemaining: state.bonusTasksRemaining,
    logRows: [...state.logRows],
    roundStartResourceSupply: Object.fromEntries(
      Object.entries(state.roundStartResourceSupply).map(([round, counts]) => [
        round,
        cloneCountMap(counts),
      ]),
    ),
  };
}

function incrementCount(counts: CountMap, id: string, amount = 1): void {
  counts[id] = (counts[id] ?? 0) + amount;
}

function decrementCount(counts: CountMap, id: string, amount = 1): void {
  const next = (counts[id] ?? 0) - amount;

  if (next > 0) {
    counts[id] = next;
    return;
  }

  delete counts[id];
}

function hasCount(counts: CountMap, id: string, amount = 1): boolean {
  return (counts[id] ?? 0) >= amount;
}

function getResourceIds(content: GameContent): string[] {
  return content.resources.map((resource) => resource.id);
}

function getVisibleCustomers(state: SimulationState): VisibleCustomer[] {
  return state.customerDecks.flatMap((deck, deckIndex) => {
    const customer = deck[0];
    return customer ? [{ customer, deckIndex }] : [];
  });
}

function getPayout(customer: CustomerCard, combination: DishCombination) {
  if ('coins' in customer.payout) {
    return customer.payout.coins;
  }

  return Math.min(
    customer.payout.maxCoins,
    customer.payout.coinsPerServed * combination.length,
  );
}

function getPayoutBasis(customer: CustomerCard) {
  if ('coins' in customer.payout) {
    return customer.payout.coins;
  }

  return customer.payout.maxCoins;
}

function expandDishInventory(
  content: GameContent,
  counts: CountMap,
): DishCard[] {
  return content.dishes
    .filter((dish) => (counts[dish.id] ?? 0) > 0)
    .map((dish) => ({
      ...dish,
      copies: counts[dish.id] ?? 0,
    }));
}

function formatDishTitles(dishes: DishCombination): string {
  return dishes.map((dish) => dish.title).join(', ');
}

function countCombinationMatches(
  mealCounts: CountMap,
  combination: DishCombination,
) {
  const remaining = cloneCountMap(mealCounts);
  let matched = 0;

  for (const dish of combination) {
    if (!hasCount(remaining, dish.id)) {
      continue;
    }

    decrementCount(remaining, dish.id);
    matched += 1;
  }

  return matched;
}

function getSatisfiedCount(
  content: GameContent,
  player: PlayerState,
  customer: CustomerCard,
) {
  const combinations = enumerateCustomerDishCombinations(
    customer,
    content.dishes,
  );

  return combinations.reduce(
    (highest, combination) =>
      Math.max(highest, countCombinationMatches(player.meals, combination)),
    0,
  );
}

function getCustomerPriorities(
  state: SimulationState,
  player: PlayerState,
): CustomerPriority[] {
  return getVisibleCustomers(state)
    .map((visible) => ({
      ...visible,
      satisfiedCount: getSatisfiedCount(
        state.content,
        player,
        visible.customer,
      ),
      payout: getPayoutBasis(visible.customer),
    }))
    .toSorted(
      (first, second) =>
        second.satisfiedCount - first.satisfiedCount ||
        second.payout - first.payout ||
        first.customer.title.localeCompare(second.customer.title),
    );
}

function findBestSpendableCombination(
  content: GameContent,
  player: PlayerState,
  customer: CustomerCard,
) {
  const inventory = expandDishInventory(content, player.meals);
  const combinations = enumerateCustomerDishCombinations(customer, inventory);

  return combinations
    .map((combination) => ({
      combination,
      payout: getPayout(customer, combination),
    }))
    .toSorted(
      (first, second) =>
        second.payout - first.payout ||
        first.combination.length - second.combination.length ||
        formatDishTitles(first.combination).localeCompare(
          formatDishTitles(second.combination),
        ),
    )
    .at(0);
}

function spendMealCombination(
  player: PlayerState,
  dishSupply: CountMap,
  combination: DishCombination,
): void {
  for (const dish of combination) {
    decrementCount(player.meals, dish.id);
    incrementCount(dishSupply, dish.id);
  }
}

export function claimAvailableCustomers(
  state: SimulationState,
  playerIndex: number,
): ClaimResult {
  const next = cloneState(state);
  const player = next.players[playerIndex];
  const customersClaimed: string[] = [];

  if (!player) {
    return { state: next, customersClaimed };
  }

  while (true) {
    const bestClaim = getVisibleCustomers(next)
      .map((visible) => {
        const spendable = findBestSpendableCombination(
          next.content,
          player,
          visible.customer,
        );

        return spendable
          ? {
              ...visible,
              combination: spendable.combination,
              payout: spendable.payout,
            }
          : null;
      })
      .filter((claim) => claim !== null)
      .toSorted(
        (first, second) =>
          second.payout - first.payout ||
          second.customer.tier - first.customer.tier ||
          first.customer.title.localeCompare(second.customer.title),
      )
      .at(0);

    if (!bestClaim) {
      break;
    }

    spendMealCombination(player, next.dishSupply, bestClaim.combination);
    player.coins += bestClaim.payout;
    player.claimedCustomers.push(bestClaim.customer.id);
    customersClaimed.push(bestClaim.customer.title);
    next.customerDecks[bestClaim.deckIndex] =
      next.customerDecks[bestClaim.deckIndex]?.slice(1) ?? [];
  }

  return { state: next, customersClaimed };
}

function canCookDish(
  player: PlayerState,
  dishSupply: CountMap,
  dish: DishCard,
) {
  if (!hasCount(dishSupply, dish.id)) {
    return false;
  }

  return Object.entries(dish.cost).every(([resourceId, amount]) =>
    hasCount(player.resources, resourceId, amount),
  );
}

function getMissingDishCount(
  player: PlayerState,
  combination: DishCombination,
) {
  const remainingMeals = cloneCountMap(player.meals);
  let missingCount = 0;

  for (const dish of combination) {
    if (hasCount(remainingMeals, dish.id)) {
      decrementCount(remainingMeals, dish.id);
      continue;
    }

    missingCount += 1;
  }

  return missingCount;
}

function getMissingDishes(player: PlayerState, combination: DishCombination) {
  const remainingMeals = cloneCountMap(player.meals);
  const missingDishes: DishCard[] = [];

  for (const dish of combination) {
    if (hasCount(remainingMeals, dish.id)) {
      decrementCount(remainingMeals, dish.id);
      continue;
    }

    missingDishes.push(dish);
  }

  return missingDishes;
}

function getCookCandidates(
  state: SimulationState,
  player: PlayerState,
): CookCandidate[] {
  return getCustomerPriorities(state, player).flatMap((priority) => {
    const combinations = enumerateCustomerDishCombinations(
      priority.customer,
      state.content.dishes,
    );

    return combinations.flatMap((combination) => {
      const missingDishes = getMissingDishes(player, combination);
      const missingCount = getMissingDishCount(player, combination);

      return missingDishes.map((dish) => ({
        dish,
        customer: priority.customer,
        missingCount,
        satisfiedCount: priority.satisfiedCount,
        payout: priority.payout,
      }));
    });
  });
}

function sortCookCandidates(candidates: CookCandidate[]) {
  return candidates.toSorted(
    (first, second) =>
      second.satisfiedCount - first.satisfiedCount ||
      second.payout - first.payout ||
      first.missingCount - second.missingCount ||
      first.dish.title.localeCompare(second.dish.title),
  );
}

function cookDish(
  state: SimulationState,
  player: PlayerState,
  dish: DishCard,
): void {
  for (const [resourceId, amount] of Object.entries(dish.cost)) {
    decrementCount(player.resources, resourceId, amount);
    incrementCount(state.resourceSupply, resourceId, amount);
  }

  decrementCount(state.dishSupply, dish.id);
  incrementCount(player.meals, dish.id);
}

function cookOneAvailableMeal(
  state: SimulationState,
  player: PlayerState,
): TurnActionResult | null {
  const candidate = sortCookCandidates(getCookCandidates(state, player)).find(
    ({ dish }) => canCookDish(player, state.dishSupply, dish),
  );

  if (!candidate) {
    return null;
  }

  cookDish(state, player, candidate.dish);

  return {
    state,
    action: 'Cooked meal',
    mealsMade: [candidate.dish.title],
    notes: [`Prepared for ${candidate.customer.title}.`],
  };
}

function getResourceNeedsForVisibleCustomers(
  state: SimulationState,
  player: PlayerState,
) {
  const needs: string[] = [];

  for (const candidate of sortCookCandidates(
    getCookCandidates(state, player),
  )) {
    if (!hasCount(state.dishSupply, candidate.dish.id)) {
      continue;
    }

    for (const [resourceId, amount] of Object.entries(candidate.dish.cost)) {
      const missing = Math.max(0, amount - (player.resources[resourceId] ?? 0));

      for (let index = 0; index < missing; index += 1) {
        needs.push(resourceId);
      }
    }
  }

  return Array.from(new Set(needs));
}

function completeBonusTask(
  state: SimulationState,
  player: PlayerState,
): TurnActionResult | null {
  if (state.bonusTasksRemaining <= 0) {
    return null;
  }

  const resourceIds = getResourceIds(state.content);
  const priorityIds = Array.from(
    new Set([
      ...getResourceNeedsForVisibleCustomers(state, player),
      ...resourceIds,
    ]),
  );
  const gained: string[] = [];

  for (const resourceId of priorityIds) {
    if (gained.length >= state.config.bonusTaskRewardResources) {
      break;
    }

    if (!hasCount(state.resourceSupply, resourceId)) {
      continue;
    }

    decrementCount(state.resourceSupply, resourceId);
    incrementCount(player.resources, resourceId);
    gained.push(resourceId);
  }

  state.bonusTasksRemaining -= 1;

  return {
    state,
    action: 'Completed bonus task',
    mealsMade: [],
    notes:
      gained.length > 0
        ? [`Gained ${gained.join(', ')}.`]
        : ['No resources remained in supply.'],
  };
}

function getResourceDeficit(player: PlayerState, dish: DishCard) {
  return Object.entries(dish.cost).flatMap(([resourceId, amount]) => {
    const missing = Math.max(0, amount - (player.resources[resourceId] ?? 0));

    return Array.from({ length: missing }, () => resourceId);
  });
}

function chooseOfferResource(player: PlayerState, dish: DishCard) {
  return Object.keys(player.resources)
    .filter((resourceId) => {
      const needed = dish.cost[resourceId] ?? 0;
      return (player.resources[resourceId] ?? 0) > needed;
    })
    .toSorted()
    .at(0);
}

function findTradeCandidate(
  state: SimulationState,
  playerIndex: number,
): TradeCandidate | null {
  const player = state.players[playerIndex];

  if (!player) {
    return null;
  }

  for (const candidate of sortCookCandidates(
    getCookCandidates(state, player),
  )) {
    if (!hasCount(state.dishSupply, candidate.dish.id)) {
      continue;
    }

    const deficit = getResourceDeficit(player, candidate.dish);

    if (deficit.length !== 1) {
      continue;
    }

    const offeredResourceId = chooseOfferResource(player, candidate.dish);

    if (!offeredResourceId) {
      continue;
    }

    const requestedResourceId = deficit[0]!;
    const otherPlayerIndex = state.players.findIndex(
      (otherPlayer, index) =>
        index !== playerIndex &&
        hasCount(otherPlayer.resources, requestedResourceId),
    );

    if (otherPlayerIndex === -1) {
      continue;
    }

    return {
      otherPlayerIndex,
      requestedResourceId,
      offeredResourceId,
    };
  }

  return null;
}

function tradeOneResource(
  state: SimulationState,
  playerIndex: number,
): TurnActionResult | null {
  const player = state.players[playerIndex];
  const trade = findTradeCandidate(state, playerIndex);

  if (!player || !trade) {
    return null;
  }

  const otherPlayer = state.players[trade.otherPlayerIndex]!;
  decrementCount(player.resources, trade.offeredResourceId);
  incrementCount(player.resources, trade.requestedResourceId);
  decrementCount(otherPlayer.resources, trade.requestedResourceId);
  incrementCount(otherPlayer.resources, trade.offeredResourceId);

  return {
    state,
    action: 'Traded resource',
    mealsMade: [],
    notes: [
      `Traded ${trade.offeredResourceId} for ${trade.requestedResourceId}.`,
    ],
  };
}

function buyResourcesAndCook(
  state: SimulationState,
  player: PlayerState,
): TurnActionResult | null {
  const candidate = sortCookCandidates(getCookCandidates(state, player)).find(
    ({ dish }) => {
      if (!hasCount(state.dishSupply, dish.id)) {
        return false;
      }

      const deficit = getResourceDeficit(player, dish);

      return (
        deficit.length > 0 &&
        player.coins >= deficit.length &&
        deficit.every((resourceId) =>
          hasCount(state.resourceSupply, resourceId),
        )
      );
    },
  );

  if (!candidate) {
    return null;
  }

  const deficit = getResourceDeficit(player, candidate.dish);

  for (const resourceId of deficit) {
    player.coins -= 1;
    decrementCount(state.resourceSupply, resourceId);
    incrementCount(player.resources, resourceId);
  }

  cookDish(state, player, candidate.dish);

  return {
    state,
    action: 'Bought resources and cooked',
    mealsMade: [candidate.dish.title],
    notes: [`Bought ${deficit.join(', ')}.`],
  };
}

function takeTurnAction(
  state: SimulationState,
  playerIndex: number,
): TurnActionResult {
  const player = state.players[playerIndex];

  if (!player) {
    return {
      state,
      action: 'No action',
      mealsMade: [],
      notes: ['Player was not found.'],
    };
  }

  return (
    cookOneAvailableMeal(state, player) ??
    completeBonusTask(state, player) ??
    tradeOneResource(state, playerIndex) ??
    buyResourcesAndCook(state, player) ?? {
      state,
      action: 'No action',
      mealsMade: [],
      notes: ['No legal action was available.'],
    }
  );
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex]!,
      shuffled[index]!,
    ];
  }

  return shuffled;
}

function buildCustomerDecks(
  content: GameContent,
  deckCount: number,
  rng: () => number,
) {
  const decks: CustomerCard[][] = Array.from({ length: deckCount }, () => []);

  for (const tier of TIER_ORDER) {
    const cards = shuffle(
      content.customers.flatMap((customer) =>
        customer.tier === tier
          ? Array.from({ length: customer.copies }, () => customer)
          : [],
      ),
      rng,
    );

    cards.forEach((card, index) => {
      decks[index % deckCount]!.push(card);
    });
  }

  return decks;
}

function buildDishSupply(content: GameContent): CountMap {
  return Object.fromEntries(
    content.dishes.map((dish) => [dish.id, dish.copies]),
  );
}

function buildResourceSupply(
  content: GameContent,
  config: GameConfig,
): CountMap {
  return Object.fromEntries(
    getResourceIds(content).map((resourceId) => [
      resourceId,
      config.resourceSupply[resourceId] ?? 0,
    ]),
  );
}

function dealStartingResources(
  content: GameContent,
  config: GameConfig,
  players: PlayerState[],
  resourceSupply: CountMap,
  rng: () => number,
): void {
  const resourceIds = getResourceIds(content);

  for (
    let resourceIndex = 0;
    resourceIndex < config.startingResourcesPerPlayer;
    resourceIndex += 1
  ) {
    for (const player of players) {
      const availableResourceIds = resourceIds.filter((resourceId) =>
        hasCount(resourceSupply, resourceId),
      );

      if (availableResourceIds.length === 0) {
        return;
      }

      const selectedResourceId =
        availableResourceIds[Math.floor(rng() * availableResourceIds.length)]!;
      decrementCount(resourceSupply, selectedResourceId);
      incrementCount(player.resources, selectedResourceId);
    }
  }
}

export function restartSimulation(
  content: GameContent,
  config: GameConfig,
  rng: () => number = Math.random,
): SimulationState {
  const players = Array.from({ length: config.playerCount }, (_, index) => ({
    id: `Player ${index + 1}`,
    coins: 0,
    resources: {},
    meals: {},
    claimedCustomers: [],
  }));
  const resourceSupply = buildResourceSupply(content, config);

  dealStartingResources(content, config, players, resourceSupply, rng);

  return {
    content,
    config,
    round: 0,
    players,
    resourceSupply,
    dishSupply: buildDishSupply(content),
    customerDecks: buildCustomerDecks(content, config.customerDeckCount, rng),
    bonusTasksRemaining: config.bonusTaskCount,
    logRows: [],
    roundStartResourceSupply: {},
  };
}

export function simulateNextRound(state: SimulationState): SimulationState {
  let next = cloneState(state);
  const round = next.round + 1;
  const roundRows: RoundLogRow[] = [];

  next.round = round;
  next.roundStartResourceSupply[round] = cloneCountMap(next.resourceSupply);

  for (
    let playerIndex = 0;
    playerIndex < next.players.length;
    playerIndex += 1
  ) {
    const firstClaim = claimAvailableCustomers(next, playerIndex);
    next = firstClaim.state;

    if (firstClaim.customersClaimed.length > 0) {
      const player = next.players[playerIndex]!;
      roundRows.push({
        round,
        playerId: player.id,
        action: 'Claimed customers',
        mealsMade: [],
        customersClaimed: firstClaim.customersClaimed,
        coins: player.coins,
        resources: cloneCountMap(player.resources),
        meals: cloneCountMap(player.meals),
        notes: ['Claimed before taking another action.'],
      });
      continue;
    }

    const actionResult = takeTurnAction(next, playerIndex);
    next = actionResult.state;

    const secondClaim = claimAvailableCustomers(next, playerIndex);
    next = secondClaim.state;

    const player = next.players[playerIndex]!;
    roundRows.push({
      round,
      playerId: player.id,
      action: actionResult.action,
      mealsMade: actionResult.mealsMade,
      customersClaimed: secondClaim.customersClaimed,
      coins: player.coins,
      resources: cloneCountMap(player.resources),
      meals: cloneCountMap(player.meals),
      notes: actionResult.notes,
    });
  }

  return {
    ...next,
    logRows: [...state.logRows, ...roundRows],
  };
}
