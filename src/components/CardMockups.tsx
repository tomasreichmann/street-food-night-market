import { cardIcons, dishTypeIcons } from '../assets/icon-map';
import {
  getCustomerIllustration,
  getDishIllustration,
} from '../assets/illustration-map';
import { CardSvgFrame } from './CardSvgFrame';
import { getCustomerRequirementVisuals } from './customerRequirementVisuals';
import type { CustomerCard, DishCard } from '../content/schema';
import layoutStyles from '../App.module.css';
import styles from './CardMockups.module.css';

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
  const rangeLabel = minCount > 1 ? `${minCount}-${count}x` : `1-${count}`;

  return {
    lines: [rangeLabel, `x${customer.payout.maxCoins}`],
    ariaLabel:
      minCount > 1
        ? `${minCount} to ${count} dishes, ${customer.payout.maxCoins} coins maximum`
        : `1 to ${count} dishes, ${customer.payout.maxCoins} coins maximum`,
  };
}

export function CardMockups({
  dishes,
  dish,
  customer,
}: {
  dishes: DishCard[];
  dish: DishCard;
  customer: CustomerCard;
}) {
  const requirementVisuals = getCustomerRequirementVisuals(customer, dishes);

  return (
    <section className={styles.section} aria-labelledby="mockups-heading">
      <div className={layoutStyles.sectionHeading}>
        <p className={layoutStyles.eyebrow}>Featured mockups</p>
        <h2 id="mockups-heading">Dish and customer card direction</h2>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <CardSvgFrame
            accentSoft="var(--color-cream-100)"
            artSrc={getDishIllustration(dish.id)}
            artIconSrc={cardIcons.dish}
            footer={{ kind: 'cost', cost: dish.cost }}
            kind="dish"
            tagIcons={getDishTagIcons(dish.tags)}
            title={dish.title}
            typeIconSrc={cardIcons.dish}
          />
        </article>

        <article className={styles.card}>
          <CardSvgFrame
            accentSoft="var(--color-red-100)"
            artSrc={getCustomerIllustration(customer.id)}
            artIconSrc={cardIcons.customer}
            endgameBonus={customer.endgameBonus}
            footer={{
              kind: 'customer',
              payoutDisplay: getCustomerPayoutDisplay(customer),
            }}
            kind="customer"
            requirementArtSrc={requirementVisuals.requirementArtSrc}
            requirementIcons={requirementVisuals.requirementIcons}
            requirementLabel={requirementVisuals.requirementLabel}
            requirementPrefix={requirementVisuals.requirementPrefix}
            requirementSeparator={requirementVisuals.requirementSeparator}
            tier={customer.tier}
            title={customer.title}
            typeIconSrc={cardIcons.customer}
          />
        </article>
      </div>
    </section>
  );
}
