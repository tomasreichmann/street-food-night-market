import { parse } from 'yaml';
import cardsYaml from '../../examples/cards.yaml?raw';
import {
  assertKnownResourceReferences,
  gameContentSchema,
  type GameContent,
} from './schema';

function formatZodError(error: {
  issues: Array<{ path: Array<string | number>; message: string }>;
}) {
  const lines = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return `${path}: ${issue.message}`;
  });

  return lines.join('\n');
}

export function loadContent(
  rawYaml: string,
  sourceName = 'content',
): GameContent {
  const parsed = parse(rawYaml);
  const validated = gameContentSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error(
      `Invalid ${sourceName}:\n${formatZodError(validated.error)}`,
    );
  }

  assertKnownResourceReferences(validated.data);

  return validated.data;
}

export function loadCardContent(): GameContent {
  return loadContent(cardsYaml, 'examples/cards.yaml');
}
