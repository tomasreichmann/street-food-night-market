import { describe, expect, it } from 'vitest';
import { loadCardContent } from './loadContent';
import { loadDefaultGameConfig, loadGameConfig } from './loadGameConfig';

describe('loadGameConfig', () => {
  it('parses game-config.yaml into typed simulation config', () => {
    const content = loadCardContent();
    const config = loadDefaultGameConfig(content);

    expect(config).toEqual({
      playerCount: 15,
      startingResourcesPerPlayer: 3,
      resourceSupply: {
        sea: 30,
        greens: 30,
        fuel: 30,
        fungi: 30,
        meat: 30,
      },
      bonusTaskCount: 9,
      bonusTaskRewardResources: 3,
      customerDeckCount: 4,
    });
  });

  it('rejects resource supply keys that are not declared in card content', () => {
    const content = loadCardContent();

    expect(() =>
      loadGameConfig(
        [
          'playerCount: 4',
          'startingResourcesPerPlayer: 2',
          'resourceSupply:',
          '  sea: 10',
          '  mystery: 10',
          'bonusTaskCount: 3',
          'bonusTaskRewardResources: 3',
          'customerDeckCount: 2',
        ].join('\n'),
        content,
        'inline bad config',
      ),
    ).toThrow(/Unknown config resource supply key/);
  });

  it('rejects non-positive counts', () => {
    const content = loadCardContent();

    expect(() =>
      loadGameConfig(
        [
          'playerCount: 0',
          'startingResourcesPerPlayer: 2',
          'resourceSupply:',
          '  sea: 10',
          'bonusTaskCount: 3',
          'bonusTaskRewardResources: 3',
          'customerDeckCount: 2',
        ].join('\n'),
        content,
        'inline non-positive config',
      ),
    ).toThrow(/playerCount/);
  });
});
