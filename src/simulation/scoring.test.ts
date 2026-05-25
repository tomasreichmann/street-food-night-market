import { describe, expect, it } from 'vitest';
import { loadCardContent } from '../content/loadContent';
import type { PlayerState } from './simulation';
import { calculatePlayerScoreBreakdown } from './scoring';

describe('calculatePlayerScoreBreakdown', () => {
  it('adds coins, unspent dish cost, leftover resources, and end game bonuses', () => {
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
      dishBonus: 11,
      resourceBonus: 2,
      endgameBonus: 17,
      total: 40,
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

  it('rounds leftover resources down to whole points', () => {
    const content = loadCardContent();
    const player: PlayerState = {
      id: 'Player 2',
      coins: 0,
      resources: { sea: 1, greens: 1, fuel: 1 },
      meals: {},
      claimedCustomers: [],
      bonusTasksRemaining: 0,
    };

    expect(calculatePlayerScoreBreakdown(content, player)).toMatchObject({
      coins: 0,
      dishBonus: 0,
      resourceBonus: 1,
      endgameBonus: 0,
      total: 1,
    });
  });
});
