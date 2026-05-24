import {
  cardIcons,
  dishTypeIcons,
  resourceIcons,
  resourceTones,
} from '../assets/icon-map';
import {
  getCustomerIllustration,
  getDishIllustration,
} from '../assets/illustration-map';
import { CardSvgFrame } from './CardSvgFrame';
import { getCustomerRequirementVisuals } from './customerRequirementVisuals';
import type {
  CustomerCard,
  DishCard,
  ResourceDefinition,
} from '../content/schema';

type CardPreviewProps =
  | {
      kind: 'resource';
      item: ResourceDefinition;
    }
  | {
      kind: 'dish';
      item: DishCard;
    }
  | {
      kind: 'customer';
      item: CustomerCard;
      dishes: DishCard[];
    };

function getResourceStyle(resourceId: string) {
  const tone =
    resourceTones[resourceId as keyof typeof resourceTones] ??
    resourceTones.sea;

  return {
    accentSoft: tone.accentSoft,
  };
}

function getResourceIcon(resourceId: string) {
  return (
    resourceIcons[resourceId as keyof typeof resourceIcons] ?? cardIcons.dish
  );
}

function getDishTagIcons(tags: string[]) {
  return tags
    .map((tag) => dishTypeIcons[tag as keyof typeof dishTypeIcons])
    .filter((icon): icon is string => Boolean(icon));
}

function getCustomerPayoutDisplay(customer: CustomerCard) {
  if ('coins' in customer.payout) {
    return {
      lines: [`${customer.payout.coins}`],
      ariaLabel: `${customer.payout.coins} coins`,
    };
  }

  const count = 'count' in customer.wants ? customer.wants.count : 1;

  return {
    lines: [`1-${count}`, `x${customer.payout.coinsPerServed}`],
    ariaLabel: `1 to ${count} dishes, ${customer.payout.coinsPerServed} coins each`,
  };
}

function ResourceCardPreview({ item }: { item: ResourceDefinition }) {
  const { accentSoft } = getResourceStyle(item.id);

  return (
    <article
      className="preview-card preview-card--resource"
      data-kind="resource"
    >
      <CardSvgFrame
        accentSoft={accentSoft}
        artIconSrc={getResourceIcon(item.id)}
        footer={{ kind: 'none' }}
        kind="resource"
        title="Market token"
        typeIconSrc={getResourceIcon(item.id)}
      />
    </article>
  );
}

function DishCardPreview({ item }: { item: DishCard }) {
  return (
    <article className="preview-card preview-card--dish" data-kind="dish">
      <CardSvgFrame
        accentSoft="var(--color-cream-100)"
        artIconSrc={cardIcons.dish}
        artSrc={getDishIllustration(item.id)}
        footer={{ kind: 'cost', cost: item.cost }}
        kind="dish"
        tagIcons={getDishTagIcons(item.tags)}
        title={item.title}
        typeIconSrc={cardIcons.dish}
      />
    </article>
  );
}

function CustomerCardPreview({
  dishes,
  item,
}: {
  dishes: DishCard[];
  item: CustomerCard;
}) {
  const requirementVisuals = getCustomerRequirementVisuals(item, dishes);

  return (
    <article
      className="preview-card preview-card--customer"
      data-kind="customer"
    >
      <CardSvgFrame
        accentSoft="var(--color-red-100)"
        artIconSrc={cardIcons.customer}
        artSrc={getCustomerIllustration(item.id)}
        endgameBonus={item.endgameBonus}
        footer={{
          kind: 'customer',
          payoutDisplay: getCustomerPayoutDisplay(item),
        }}
        kind="customer"
        requirementArtSrc={requirementVisuals.requirementArtSrc}
        requirementIcons={requirementVisuals.requirementIcons}
        requirementLabel={requirementVisuals.requirementLabel}
        requirementPrefix={requirementVisuals.requirementPrefix}
        requirementSeparator={requirementVisuals.requirementSeparator}
        tier={item.tier}
        title={item.title}
        typeIconSrc={cardIcons.customer}
      />
    </article>
  );
}

export function CardPreview(props: CardPreviewProps) {
  if (props.kind === 'resource') {
    return <ResourceCardPreview item={props.item} />;
  }

  if (props.kind === 'dish') {
    return <DishCardPreview item={props.item} />;
  }

  return <CustomerCardPreview dishes={props.dishes} item={props.item} />;
}
