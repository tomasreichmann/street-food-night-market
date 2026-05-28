import type { DishCard } from './schema';

function getDishResourceTotal(dish: DishCard) {
  return Object.values(dish.cost).reduce((total, amount) => total + amount, 0);
}

function getBaseDishEndgameCoinValue(resourceTotal: number) {
  if (resourceTotal <= 2) {
    return resourceTotal;
  }

  if (resourceTotal === 3) {
    return 4;
  }

  if (resourceTotal === 4) {
    return 6;
  }

  return 8;
}

export function getDishEndgameCoinValue(dish: DishCard) {
  const premiumBonus = dish.tags.includes('premium') ? 3 : 0;

  return getBaseDishEndgameCoinValue(getDishResourceTotal(dish)) + premiumBonus;
}
