import { describe, expect, it } from 'vitest';
import { loadCardContent } from '../content/loadContent';
import type { PlayerState } from './simulation';
import { calculatePlayerScoreBreakdown } from './scoring';

describe('calculatePlayerScoreBreakdown', () => {
  it('adds coins, unspent meal tiers, and end game bonuses', () => {
    const content = loadCardContent();
    const player: PlayerState = {
      id: 'Player 1',
      coins: 10,
      resources: { sea: 4 },
      meals: {
        'festival-banquet': 1,
        'ramen-bowl': 1,
        'sushi-platter': 1,
      },
      claimedCustomers: [
        'salaryman',
        'dockworker',
        'maid-cafe-maid',
        'seafood-lover',
        'celebrity-chef',
        'festival-judge',
        'k-pop-band-female',
      ],
      bonusTasksRemaining: 0,
    };

    expect(calculatePlayerScoreBreakdown(content, player)).toEqual({
      coins: 10,
      mealBonus: 6,
      endgameBonus: 17,
      total: 33,
      endgameBonusBreakdown: [
        {
          customerId: 'seafood-lover',
          label: '+1 coin per leftover Sea resource',
          points: 4,
        },
        {
          customerId: 'celebrity-chef',
          label: '+1 coin per female customer served',
          points: 4,
        },
        {
          customerId: 'festival-judge',
          label: '+1 coin per different customer archetype served',
          points: 7,
        },
        {
          customerId: 'k-pop-band-female',
          label: '+1 coin per male customer served',
          points: 2,
        },
      ],
    });
  });
});
