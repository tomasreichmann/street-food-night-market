import { parse } from 'yaml';
import gameConfigYaml from '../../examples/game-config.yaml?raw';
import type { GameContent } from './schema';
import { z } from 'zod';

const positiveInteger = z.number().int().positive();

export const gameConfigSchema = z
  .object({
    playerCount: positiveInteger,
    startingResourcesPerPlayer: positiveInteger,
    resourceSupply: z
      .record(z.string().trim().min(1), positiveInteger)
      .refine(
        (record) => Object.keys(record).length > 0,
        'Resource supply must define at least one resource.',
      ),
    bonusTaskCount: positiveInteger,
    bonusTaskRewardResources: positiveInteger,
    customerDeckCount: positiveInteger,
  })
  .strict();

export type GameConfig = z.infer<typeof gameConfigSchema>;

function formatZodError(error: {
  issues: Array<{ path: Array<string | number>; message: string }>;
}) {
  const lines = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return `${path}: ${issue.message}`;
  });

  return lines.join('\n');
}

function assertKnownResourceSupplyKeys(
  config: GameConfig,
  content: GameContent,
): void {
  const knownResourceIds = new Set(
    content.resources.map((resource) => resource.id),
  );
  const unknownResourceIds = Object.keys(config.resourceSupply).filter(
    (resourceId) => !knownResourceIds.has(resourceId),
  );

  if (unknownResourceIds.length > 0) {
    throw new Error(
      `Unknown config resource supply key(s): ${unknownResourceIds.join(', ')}. Each key must match a declared resource id.`,
    );
  }
}

export function loadGameConfig(
  rawYaml: string,
  content: GameContent,
  sourceName = 'game config',
): GameConfig {
  const parsed = parse(rawYaml);
  const validated = gameConfigSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error(
      `Invalid ${sourceName}:\n${formatZodError(validated.error)}`,
    );
  }

  assertKnownResourceSupplyKeys(validated.data, content);

  return validated.data;
}

export function loadDefaultGameConfig(content: GameContent): GameConfig {
  return loadGameConfig(gameConfigYaml, content, 'examples/game-config.yaml');
}
