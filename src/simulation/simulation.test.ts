import { describe, expect, it } from 'vitest';
import type { GameConfig } from '../content/loadGameConfig';
import type { GameContent, CustomerCard } from '../content/schema';
import {
  restartSimulation,
  simulateNextRound,
  type SimulationState,
} from './simulation';

const content: GameContent = {
  resources: [
    { id: 'greens', label: 'Greens', prompt: 'Greens prompt' },
    { id: 'fuel', label: 'Fuel', prompt: 'Fuel prompt' },
    { id: 'sea', label: 'Sea', prompt: 'Sea prompt' },
  ],
  dishes: [
    {
      id: 'ramen',
      type: 'dish',
      tier: 1,
      copies: 3,
      size: 'standard',
      title: 'Ramen',
      tags: ['soup', 'noodles'],
      cost: { greens: 1, fuel: 1 },
      text: 'Soup.',
    },
    {
      id: 'tea',
      type: 'dish',
      tier: 1,
      copies: 2,
      size: 'standard',
      title: 'Tea',
      tags: ['drink'],
      cost: { fuel: 1 },
      text: 'Drink.',
    },
  ],
  customers: [
    {
      id: 'soup-fan',
      type: 'customer',
      tier: 1,
      copies: 2,
      size: 'standard',
      title: 'Soup Fan',
      tags: [],
      wants: { mode: 'any_tag', tag: 'soup', count: 1 },
      payout: { coins: 5 },
      text: 'Serve soup.',
    },
    {
      id: 'tea-fan',
      type: 'customer',
      tier: 2,
      copies: 2,
      size: 'standard',
      title: 'Tea Fan',
      tags: [],
      wants: { mode: 'any_tag', tag: 'drink', count: 1 },
      payout: { coins: 8 },
      text: 'Serve drink.',
    },
    {
      id: 'vip-soup-fan',
      type: 'customer',
      tier: 3,
      copies: 2,
      size: 'standard',
      title: 'VIP Soup Fan',
      tags: [],
      wants: { mode: 'any_tag', tag: 'soup', count: 1 },
      payout: { coins: 12 },
      text: 'Serve soup.',
    },
  ],
};

const config: GameConfig = {
  playerCount: 2,
  startingResourcesPerPlayer: 1,
  resourceSupply: { greens: 6, fuel: 6, sea: 6 },
  bonusTaskCount: 2,
  bonusTaskRewardResources: 3,
  customerDeckCount: 2,
};

function customer(id: string): CustomerCard {
  const found = content.customers.find((item) => item.id === id);

  if (!found) {
    throw new Error(`Missing customer fixture: ${id}`);
  }

  return found;
}

function onePlayerState(): SimulationState {
  return restartSimulation(
    content,
    {
      ...config,
      playerCount: 1,
      startingResourcesPerPlayer: 0,
      bonusTaskCount: 0,
      customerDeckCount: 1,
    },
    () => 0,
  );
}

function totalResources(resources: Record<string, number>) {
  return Object.values(resources).reduce((total, count) => total + count, 0);
}

describe('restartSimulation', () => {
  it('creates players, finite supply, dish supply, and tier-ordered customer decks', () => {
    const state = restartSimulation(content, config, () => 0);

    expect(state.players).toHaveLength(2);
    expect(state.customerDecks).toHaveLength(2);
    expect(state.dishSupply).toEqual({ ramen: 3, tea: 2 });
    expect(totalResources(state.resourceSupply)).toBe(16);
    expect(
      state.players.reduce(
        (total, player) => total + totalResources(player.resources),
        0,
      ),
    ).toBe(2);
    expect(
      state.customerDecks.map((deck) => deck.map((item) => item.tier)),
    ).toEqual([
      [1, 2, 3],
      [1, 2, 3],
    ]);
  });
});

describe('simulateNextRound', () => {
  it('claims all available customers before taking another action and returns meals to supply', () => {
    const started = onePlayerState();
    const state: SimulationState = {
      ...started,
      players: [
        {
          ...started.players[0]!,
          meals: { ramen: 2 },
        },
      ],
      dishSupply: { ...started.dishSupply, ramen: 1 },
      customerDecks: [[customer('soup-fan')], [customer('vip-soup-fan')]],
    };

    const next = simulateNextRound(state);

    expect(next.logRows[0]).toMatchObject({
      round: 1,
      playerId: 'Player 1',
      action: 'Claimed customers',
      mealsMade: [],
      customersClaimed: ['VIP Soup Fan', 'Soup Fan'],
      coins: 17,
    });
    expect(next.players[0]?.meals).toEqual({});
    expect(next.dishSupply.ramen).toBe(3);
  });

  it('cooks exactly one needed meal when resources and meal supply are available', () => {
    const started = onePlayerState();
    const state: SimulationState = {
      ...started,
      players: [
        {
          ...started.players[0]!,
          resources: { greens: 2, fuel: 2 },
        },
      ],
      customerDecks: [[customer('soup-fan')], [customer('vip-soup-fan')]],
    };

    const next = simulateNextRound(state);

    expect(next.logRows[0]).toMatchObject({
      action: 'Cooked meal',
      mealsMade: ['Ramen'],
      customersClaimed: ['VIP Soup Fan'],
      coins: 12,
    });
    expect(next.players[0]?.resources).toEqual({ greens: 1, fuel: 1 });
    expect(next.resourceSupply.greens).toBe(
      (state.resourceSupply.greens ?? 0) + 1,
    );
    expect(next.resourceSupply.fuel).toBe((state.resourceSupply.fuel ?? 0) + 1);
  });

  it('uses a bonus task to take finite resources prioritized by needed meals', () => {
    const started = onePlayerState();
    const state: SimulationState = {
      ...started,
      bonusTasksRemaining: 1,
      players: [
        {
          ...started.players[0]!,
          bonusTasksRemaining: 1,
        },
      ],
      customerDecks: [[customer('soup-fan')]],
    };

    const next = simulateNextRound(state);

    expect(next.logRows[0]).toMatchObject({
      action: 'Completed bonus task',
      customersClaimed: [],
    });
    expect(next.players[0]?.bonusTasksRemaining).toBe(0);
    expect(next.players[0]?.resources).toMatchObject({
      greens: 1,
      fuel: 1,
    });
    expect(totalResources(next.players[0]!.resources)).toBe(3);
    expect(totalResources(next.resourceSupply)).toBe(
      totalResources(state.resourceSupply) - 3,
    );
  });

  it('allows each player to complete bonus tasks up to their own limit', () => {
    const started = restartSimulation(
      content,
      {
        ...config,
        playerCount: 2,
        startingResourcesPerPlayer: 0,
        bonusTaskCount: 1,
      },
      () => 0,
    );
    expect(started.bonusTasksRemaining).toBe(2);
    const state: SimulationState = {
      ...started,
      players: started.players.map((player) => ({
        ...player,
        resources: {},
        meals: {},
      })),
      customerDecks: [[customer('soup-fan')]],
    };

    const next = simulateNextRound(state);

    expect(next.logRows).toHaveLength(2);
    expect(next.logRows[0]?.action).toBe('Completed bonus task');
    expect(next.logRows[1]?.action).toBe('Completed bonus task');
    expect(next.players[0]?.bonusTasksRemaining).toBe(0);
    expect(next.players[1]?.bonusTasksRemaining).toBe(0);
    expect(next.bonusTasksRemaining).toBe(0);
  });

  it('skips the bonus action when the resource supply is empty', () => {
    const started = onePlayerState();
    const state: SimulationState = {
      ...started,
      bonusTasksRemaining: 1,
      resourceSupply: { greens: 0, fuel: 0, sea: 0 },
      players: [
        {
          ...started.players[0]!,
          bonusTasksRemaining: 1,
        },
      ],
      customerDecks: [[customer('soup-fan')]],
    };

    const next = simulateNextRound(state);

    expect(next.logRows[0]).toMatchObject({
      action: 'No action',
    });
    expect(next.players[0]?.bonusTasksRemaining).toBe(1);
    expect(next.bonusTasksRemaining).toBe(1);
  });

  it('trades one resource and cooks in the same round if it enables a needed meal', () => {
    const started = restartSimulation(
      content,
      { ...config, startingResourcesPerPlayer: 0, bonusTaskCount: 0 },
      () => 0,
    );
    const state: SimulationState = {
      ...started,
      players: [
        {
          ...started.players[0]!,
          resources: { greens: 1, sea: 1 },
        },
        {
          ...started.players[1]!,
          resources: { fuel: 1 },
        },
      ],
      customerDecks: [[customer('soup-fan')]],
    };

    const next = simulateNextRound(state);

    expect(next.logRows[0]).toMatchObject({
      action: 'Traded resource and cooked',
      mealsMade: ['Ramen'],
      customersClaimed: ['Soup Fan'],
    });
    expect(next.players[0]?.resources).toEqual({});
    expect(next.players[1]?.resources).toEqual({ sea: 1 });
    expect(next.players[0]?.meals).toEqual({});
    expect(next.players[0]?.coins).toBe(5);
  });

  it('buys finite resources for one needed meal, cooks it, and spends coins', () => {
    const started = onePlayerState();
    const state: SimulationState = {
      ...started,
      bonusTasksRemaining: 0,
      players: [
        {
          ...started.players[0]!,
          coins: 2,
        },
      ],
      customerDecks: [[customer('soup-fan')]],
    };

    const next = simulateNextRound(state);

    expect(next.logRows[0]).toMatchObject({
      action: 'Bought resources and cooked',
      mealsMade: ['Ramen'],
      customersClaimed: ['Soup Fan'],
      coins: 5,
    });
    expect(next.players[0]?.resources).toEqual({});
    expect(next.dishSupply.ramen).toBe(3);
  });
});
