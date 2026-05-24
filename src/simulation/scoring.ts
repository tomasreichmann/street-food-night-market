import type { GameContent } from '../content/schema';
import type { PlayerState } from './simulation';

export type EndgameBonusBreakdown = {
  customerId: string;
  label: string;
  points: number;
};

export type PlayerScoreBreakdown = {
  coins: number;
  mealBonus: number;
  endgameBonus: number;
  total: number;
  endgameBonusBreakdown: EndgameBonusBreakdown[];
};

const FEMALE_CUSTOMER_IDS = new Set([
  'maid-cafe-maid',
  'tea-auntie',
  'night-shift-nurse',
  'food-blogger',
  'celebrity-chef',
  'festival-judge',
  'k-pop-band-female',
]);

const MALE_CUSTOMER_IDS = new Set([
  'salaryman',
  'dockworker',
  'monk',
  'sumo-wrestler',
  'business-executive',
  'street-musician',
]);

// The content schema does not currently encode customer gender, so these
// bonuses are resolved from the current card naming conventions.
function getDishTierById(content: GameContent) {
  return new Map(content.dishes.map((dish) => [dish.id, dish.tier]));
}

function getCustomerById(content: GameContent) {
  return new Map(content.customers.map((customer) => [customer.id, customer]));
}

function getResourceCountById(content: GameContent, player: PlayerState) {
  const resourceIds = new Set(content.resources.map((resource) => resource.id));

  return (resourceId: string) =>
    resourceIds.has(resourceId) ? player.resources[resourceId] ?? 0 : 0;
}

function getCustomerCountByGender(
  customerIds: string[],
  gender: 'female' | 'male',
  customerById: Map<string, GameContent['customers'][number]>,
) {
  return customerIds.reduce((total, customerId) => {
    const customer = customerById.get(customerId);

    if (!customer) {
      return total;
    }

    if (gender === 'female' && isFemaleCustomer(customer.id, customer.title)) {
      return total + 1;
    }

    if (gender === 'male' && isMaleCustomer(customer.id, customer.title)) {
      return total + 1;
    }

    return total;
  }, 0);
}

function isFemaleCustomer(customerId: string, title: string) {
  if (FEMALE_CUSTOMER_IDS.has(customerId)) {
    return true;
  }

  const lowerTitle = title.toLowerCase();

  return (
    lowerTitle.includes('maid') ||
    lowerTitle.includes('auntie') ||
    lowerTitle.includes('nurse') ||
    lowerTitle.includes('blogger') ||
    lowerTitle.includes('chef') ||
    lowerTitle.includes('judge')
  );
}

function isMaleCustomer(customerId: string, title: string) {
  if (MALE_CUSTOMER_IDS.has(customerId)) {
    return true;
  }

  const lowerTitle = title.toLowerCase();

  return (
    lowerTitle.includes('salaryman') ||
    lowerTitle.includes('dockworker') ||
    lowerTitle.includes('monk') ||
    lowerTitle.includes('sumo') ||
    lowerTitle.includes('executive') ||
    lowerTitle.includes('musician')
  );
}

function scoreEndgameBonus(
  customerId: string,
  content: GameContent,
  player: PlayerState,
  customerById: Map<string, GameContent['customers'][number]>,
) {
  const customer = customerById.get(customerId);

  if (!customer?.endgameBonus) {
    return null;
  }

  const bonusText = customer.endgameBonus.toLowerCase();
  const servedCustomerIds = player.claimedCustomers;
  const uniqueCustomerCount = new Set(servedCustomerIds).size;
  const getResourceCount = getResourceCountById(content, player);

  const leftoverResourceMatch = bonusText.match(
    /^\+1 coin per leftover (.+?) resource$/,
  );

  if (leftoverResourceMatch) {
    const resourceName = leftoverResourceMatch[1] ?? '';
    const resource = content.resources.find(
      (candidate) =>
        candidate.id.toLowerCase() === resourceName ||
        candidate.label.toLowerCase() === resourceName,
    );

    return {
      customerId,
      label: customer.endgameBonus,
      points: resource ? getResourceCount(resource.id) : 0,
    };
  }

  if (bonusText.includes('different customer archetype served')) {
    return {
      customerId,
      label: customer.endgameBonus,
      points: uniqueCustomerCount,
    };
  }

  if (bonusText.includes('female customer served')) {
    return {
      customerId,
      label: customer.endgameBonus,
      points: getCustomerCountByGender(
        servedCustomerIds,
        'female',
        customerById,
      ),
    };
  }

  if (bonusText.includes('male customer served')) {
    return {
      customerId,
      label: customer.endgameBonus,
      points: getCustomerCountByGender(servedCustomerIds, 'male', customerById),
    };
  }

  return {
    customerId,
    label: customer.endgameBonus,
    points: 0,
  };
}

export function calculatePlayerScoreBreakdown(
  content: GameContent,
  player: PlayerState,
): PlayerScoreBreakdown {
  const dishTierById = getDishTierById(content);
  const customerById = getCustomerById(content);
  const mealBonus = Object.entries(player.meals).reduce(
    (total, [dishId, count]) => total + (dishTierById.get(dishId) ?? 0) * count,
    0,
  );
  const endgameBonusBreakdown = player.claimedCustomers
    .map((customerId) =>
      scoreEndgameBonus(customerId, content, player, customerById),
    )
    .filter((entry): entry is EndgameBonusBreakdown => entry !== null);
  const endgameBonus = endgameBonusBreakdown.reduce(
    (total, entry) => total + entry.points,
    0,
  );
  const total = player.coins + mealBonus + endgameBonus;

  return {
    coins: player.coins,
    mealBonus,
    endgameBonus,
    total,
    endgameBonusBreakdown,
  };
}
