import { describe, expect, it } from 'vitest';
import type { DishCard } from './schema';
import { getDishEndgameCoinValue } from './dishValue';

function dish(cost: DishCard['cost'], tags: string[] = []): DishCard {
  return {
    id: 'test-dish',
    type: 'dish',
    tier: 1,
    copies: 1,
    size: 'standard',
    title: 'Test Dish',
    text: 'Test.',
    cost,
    tags,
  };
}

describe('getDishEndgameCoinValue', () => {
  it.each([
    [{ greens: 1 }, 1],
    [{ greens: 2 }, 2],
    [{ greens: 2, fuel: 1 }, 4],
    [{ greens: 2, fuel: 2 }, 6],
    [{ greens: 2, fuel: 2, meat: 1 }, 8],
  ] satisfies Array<[DishCard['cost'], number]>)(
    'scores %j as %i coins',
    (cost, expectedValue) => {
      expect(getDishEndgameCoinValue(dish(cost))).toBe(expectedValue);
    },
  );

  it('adds 3 coins for Premium dishes', () => {
    expect(getDishEndgameCoinValue(dish({ greens: 2 }, ['premium']))).toBe(5);
  });
});
