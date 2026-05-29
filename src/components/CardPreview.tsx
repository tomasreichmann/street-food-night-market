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
import { getDishEndgameCoinValue } from '../content/dishValue';
import styles from './CardPreview.module.css';
import { cx } from '../utils/cx';
import type {
  CustomerCard,
  DishCard,
  ResourceDefinition,
} from '../content/schema';

type CardPreviewProps =
  | {
      kind: 'resource';
      item: ResourceDefinition;
      cornerRadius?: number;
      className?: string;
    }
  | {
      kind: 'dish';
      item: DishCard;
      cornerRadius?: number;
      className?: string;
    }
  | {
      kind: 'customer';
      item: CustomerCard;
      dishes: DishCard[];
      cornerRadius?: number;
      className?: string;
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
  const minCount =
    'minCount' in customer.wants && customer.wants.minCount
      ? customer.wants.minCount
      : 1;
  const rangeLabel = minCount > 1 ? `${minCount}-${count}` : `1-${count}`;

  return {
    lines: [rangeLabel, `x${customer.payout.coinsPerServed}`],
    ariaLabel:
      minCount > 1
        ? `${minCount} to ${count} dishes, ${customer.payout.coinsPerServed} coins each`
        : `1 to ${count} dishes, ${customer.payout.coinsPerServed} coins each`,
  };
}

function ResourceCardPreview({
  className,
  cornerRadius,
  item,
}: {
  className?: string;
  cornerRadius?: number;
  item: ResourceDefinition;
}) {
  const { accentSoft } = getResourceStyle(item.id);

  return (
    <article className={cx(styles.card, className)} data-kind="resource">
      <CardSvgFrame
        accentSoft={accentSoft}
        artIconSrc={getResourceIcon(item.id)}
        cornerRadius={cornerRadius}
        footer={{ kind: 'none' }}
        kind="resource"
        title="Market token"
        typeIconSrc={getResourceIcon(item.id)}
      />
    </article>
  );
}

function DishCardPreview({
  className,
  cornerRadius,
  item,
}: {
  className?: string;
  cornerRadius?: number;
  item: DishCard;
}) {
  return (
    <article className={cx(styles.card, className)} data-kind="dish">
      <CardSvgFrame
        accentSoft="var(--color-cream-100)"
        artIconSrc={cardIcons.dish}
        artSrc={getDishIllustration(item.id)}
        cornerRadius={cornerRadius}
        footer={{
          kind: 'cost',
          cost: item.cost,
          coinValue: getDishEndgameCoinValue(item),
        }}
        kind="dish"
        tagIcons={getDishTagIcons(item.tags)}
        title={item.title}
        typeIconSrc={cardIcons.dish}
      />
    </article>
  );
}

function CustomerCardPreview({
  className,
  dishes,
  cornerRadius,
  item,
}: {
  className?: string;
  dishes: DishCard[];
  cornerRadius?: number;
  item: CustomerCard;
}) {
  const requirementVisuals = getCustomerRequirementVisuals(item, dishes);

  return (
    <article className={cx(styles.card, className)} data-kind="customer">
      <CardSvgFrame
        accentSoft="var(--color-red-100)"
        artIconSrc={cardIcons.customer}
        artSrc={getCustomerIllustration(item.id)}
        cornerRadius={cornerRadius}
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
    return (
      <ResourceCardPreview
        className={props.className}
        cornerRadius={props.cornerRadius}
        item={props.item}
      />
    );
  }

  if (props.kind === 'dish') {
    return (
      <DishCardPreview
        className={props.className}
        cornerRadius={props.cornerRadius}
        item={props.item}
      />
    );
  }

  return (
    <CustomerCardPreview
      cornerRadius={props.cornerRadius}
      className={props.className}
      dishes={props.dishes}
      item={props.item}
    />
  );
}
