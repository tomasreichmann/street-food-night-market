import { cardIcons, dishTypeIcons } from '../assets/icon-map';
import { getDishIllustration } from '../assets/illustration-map';
import { formatCustomerWant } from '../content/contentSummary';
import type { CustomerCard, DishCard } from '../content/schema';

type RequirementIcon = {
  src: string;
  count?: number;
};

export type CustomerRequirementVisuals = {
  requirementArtSrc?: string;
  requirementIcons?: RequirementIcon[];
  requirementLabel: string;
  requirementPrefix?: string;
  requirementSeparator?: string;
};

function getDishTypeIcon(tag: string) {
  return dishTypeIcons[tag as keyof typeof dishTypeIcons] ?? cardIcons.dish;
}

function getTagIcons(tags: string[], count?: number): RequirementIcon[] {
  const visibleCount = count === 1 ? undefined : count;

  return tags.map((tag) => ({
    src: getDishTypeIcon(tag),
    count: visibleCount,
  }));
}

export function getCustomerRequirementVisuals(
  customer: CustomerCard,
  dishes: DishCard[],
): CustomerRequirementVisuals {
  const requirementLabel = formatCustomerWant(customer, dishes);

  if (customer.wants.mode === 'exact_dish') {
    const dish = dishes.find(
      (candidate) => candidate.id === customer.wants.dishId,
    );

    return {
      requirementArtSrc: dish ? getDishIllustration(dish.id) : undefined,
      requirementLabel,
    };
  }

  if (customer.wants.mode === 'any_tag') {
    return {
      requirementIcons: getTagIcons([customer.wants.tag], customer.wants.count),
      requirementLabel,
    };
  }

  if (customer.wants.mode === 'any_of_tags') {
    return {
      requirementIcons: getTagIcons(customer.wants.tags, customer.wants.count),
      requirementLabel,
      requirementSeparator: '/',
    };
  }

  if (customer.wants.mode === 'combo_tags') {
    return {
      requirementIcons: getTagIcons(customer.wants.tags),
      requirementLabel,
      requirementSeparator: '+',
    };
  }

  if (customer.wants.mode === 'up_to_tag') {
    return {
      requirementIcons: getTagIcons([customer.wants.tag], customer.wants.count),
      requirementLabel,
      requirementPrefix: 'up to',
    };
  }

  if (customer.wants.mode === 'up_to_any_tag') {
    return {
      requirementIcons: getTagIcons(customer.wants.tags, customer.wants.count),
      requirementLabel,
      requirementPrefix: 'up to',
      requirementSeparator: '/',
    };
  }

  return {
    requirementIcons: [{ src: cardIcons.dish, count: customer.wants.count }],
    requirementLabel,
  };
}
