import { z } from 'zod';

export const cardSizeKeys = ['small', 'standard', 'large'] as const;
export type CardSizeKey = (typeof cardSizeKeys)[number];

const positiveInteger = z.number().int().positive();
const nonEmptyText = z.string().trim().min(1);

export const resourceDefinitionSchema = z
  .object({
    id: nonEmptyText,
    label: nonEmptyText,
    prompt: nonEmptyText,
  })
  .strict();

export type ResourceDefinition = z.infer<typeof resourceDefinitionSchema>;

const cardCoreSchema = z
  .object({
    id: nonEmptyText,
    type: z.enum(['dish', 'customer']),
    tier: positiveInteger,
    copies: positiveInteger,
    size: z.enum(cardSizeKeys),
    title: nonEmptyText,
    text: nonEmptyText,
  })
  .strict();

export const dishCardSchema = cardCoreSchema
  .extend({
    type: z.literal('dish'),
    tags: z.array(nonEmptyText).default([]),
    cost: z
      .record(nonEmptyText, positiveInteger)
      .refine(
        (record) => Object.keys(record).length > 0,
        'Dish cards must define at least one resource cost.',
      ),
  })
  .strict();

export type DishCard = z.infer<typeof dishCardSchema>;

const customerWantsSchema = z.discriminatedUnion('mode', [
  z
    .object({
      mode: z.literal('any_tag'),
      tag: nonEmptyText,
      count: positiveInteger,
    })
    .strict(),
  z
    .object({
      mode: z.literal('any_of_tags'),
      tags: z.array(nonEmptyText).min(1),
      count: positiveInteger,
    })
    .strict(),
  z
    .object({
      mode: z.literal('exact_dish'),
      dishId: nonEmptyText,
    })
    .strict(),
  z
    .object({
      mode: z.literal('combo_tags'),
      tags: z.array(nonEmptyText).min(1),
    })
    .strict(),
  z
    .object({
      mode: z.literal('up_to_tag'),
      tag: nonEmptyText,
      count: positiveInteger,
    })
    .strict(),
  z
    .object({
      mode: z.literal('up_to_any_tag'),
      tags: z.array(nonEmptyText).min(1),
      count: positiveInteger,
    })
    .strict(),
  z
    .object({
      mode: z.literal('variety_tags'),
      count: positiveInteger,
    })
    .strict(),
]);

const customerPayoutSchema = z.union([
  z
    .object({
      coins: positiveInteger,
    })
    .strict(),
  z
    .object({
      coinsPerServed: positiveInteger,
      maxCoins: positiveInteger,
    })
    .strict(),
]);

export const customerCardSchema = cardCoreSchema
  .extend({
    type: z.literal('customer'),
    tags: z.array(nonEmptyText).default([]),
    wants: customerWantsSchema,
    payout: customerPayoutSchema,
    endgameBonus: nonEmptyText.optional(),
  })
  .strict();

export type CustomerCard = z.infer<typeof customerCardSchema>;

export const gameContentSchema = z
  .object({
    resources: z.array(resourceDefinitionSchema),
    dishes: z.array(dishCardSchema),
    customers: z.array(customerCardSchema),
  })
  .strict();

export type GameContent = z.infer<typeof gameContentSchema>;

export function assertKnownResourceReferences(content: GameContent): void {
  const knownResourceIds = new Set(
    content.resources.map((resource) => resource.id),
  );
  const knownDishIds = new Set(content.dishes.map((dish) => dish.id));
  const invalidReferences: string[] = [];
  const invalidDishReferences: string[] = [];

  for (const dish of content.dishes) {
    for (const resourceId of Object.keys(dish.cost)) {
      if (!knownResourceIds.has(resourceId)) {
        invalidReferences.push(`${dish.id}: ${resourceId}`);
      }
    }
  }

  for (const customer of content.customers) {
    if (
      customer.wants.mode === 'exact_dish' &&
      !knownDishIds.has(customer.wants.dishId)
    ) {
      invalidDishReferences.push(`${customer.id}: ${customer.wants.dishId}`);
    }
  }

  if (invalidReferences.length > 0) {
    throw new Error(
      `Unknown resource reference(s): ${invalidReferences.join(', ')}. Each cost key must match a declared resource id.`,
    );
  }

  if (invalidDishReferences.length > 0) {
    throw new Error(
      `Unknown dish reference(s): ${invalidDishReferences.join(', ')}. Each exact dish want must match a declared dish id.`,
    );
  }
}
