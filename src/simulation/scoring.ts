import { getDishEndgameCoinValue } from '../content/dishValue';
import type { GameContent } from '../content/schema';
import type { PlayerState } from './simulation';

export type EndgameBonusBreakdown = {
  customerId: string;
  label: string;
  points: number;
};

export type PlayerScoreBreakdown = {
  coins: number;
  dishBonus: number;
  resourceBonus: number;
  endgameBonus: number;
  total: number;
  endgameBonusBreakdown: EndgameBonusBreakdown[];
};

const FEMALE_CUSTOMER_IDS = new Set([
  'maid-cafe-maid',
  'auntie',
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

function getDishEndgameCoinValueById(content: GameContent) {
  return new Map(
    content.dishes.map((dish) => [dish.id, getDishEndgameCoinValue(dish)]),
  );
}

function getCustomerById(content: GameContent) {
  return new Map(content.customers.map((customer) => [customer.id, customer]));
}

function getResourceCountById(content: GameContent, player: PlayerState) {
  const resourceIds = new Set(content.resources.map((resource) => resource.id));

  return (resourceId: string) =>
    resourceIds.has(resourceId) ? (player.resources[resourceId] ?? 0) : 0;
}

function getTotalResourceCount(content: GameContent, player: PlayerState) {
  return content.resources.reduce(
    (total, resource) => total + (player.resources[resource.id] ?? 0),
    0,
  );
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

function customerWantsTag(
  customer: GameContent['customers'][number],
  tag: string,
) {
  if (customer.wants.mode === 'any_tag') {
    return customer.wants.tag === tag;
  }

  if (
    customer.wants.mode === 'any_of_tags' ||
    customer.wants.mode === 'combo_tags' ||
    customer.wants.mode === 'up_to_any_tag'
  ) {
    return customer.wants.tags.includes(tag);
  }

  if (customer.wants.mode === 'up_to_tag') {
    return customer.wants.tag === tag;
  }

  return false;
}

function getServedCustomerCountById(
  customerIds: string[],
  wantedCustomerId: string,
) {
  return customerIds.filter((customerId) => customerId === wantedCustomerId)
    .length;
}

function getDifferentServedTierCount(
  customerIds: string[],
  customerById: Map<string, GameContent['customers'][number]>,
) {
  return new Set(
    customerIds
      .map((customerId) => customerById.get(customerId)?.tier)
      .filter((tier): tier is number => typeof tier === 'number'),
  ).size;
}

function getGreensWantCustomerCount(
  customerIds: string[],
  customerById: Map<string, GameContent['customers'][number]>,
) {
  return customerIds.reduce((total, customerId) => {
    const servedCustomer = customerById.get(customerId);

    return servedCustomer && customerWantsTag(servedCustomer, 'vegetarian')
      ? total + 1
      : total;
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

  if (bonusText.includes('night market kid served')) {
    return {
      customerId,
      label: customer.endgameBonus,
      points:
        getServedCustomerCountById(servedCustomerIds, 'night-market-kid') * 2,
    };
  }

  if (bonusText.includes('served customer with a greens want')) {
    return {
      customerId,
      label: customer.endgameBonus,
      points: getGreensWantCustomerCount(servedCustomerIds, customerById) * 2,
    };
  }

  if (bonusText.includes('different customer tier you served')) {
    return {
      customerId,
      label: customer.endgameBonus,
      points: getDifferentServedTierCount(servedCustomerIds, customerById) * 3,
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
  const dishValueById = getDishEndgameCoinValueById(content);
  const customerById = getCustomerById(content);
  const dishBonus = Object.entries(player.meals).reduce(
    (total, [dishId, count]) =>
      total + (dishValueById.get(dishId) ?? 0) * count,
    0,
  );
  const resourceBonus = Math.floor(getTotalResourceCount(content, player) / 2);
  const endgameBonusBreakdown = player.claimedCustomers
    .map((customerId) =>
      scoreEndgameBonus(customerId, content, player, customerById),
    )
    .filter((entry): entry is EndgameBonusBreakdown => entry !== null);
  const endgameBonus = endgameBonusBreakdown.reduce(
    (total, entry) => total + entry.points,
    0,
  );
  const total = player.coins + dishBonus + resourceBonus + endgameBonus;

  return {
    coins: player.coins,
    dishBonus,
    resourceBonus,
    endgameBonus,
    total,
    endgameBonusBreakdown,
  };
}
