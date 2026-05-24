import { cardIcons, dishTypeIcons } from '../assets/icon-map';
import {
  getCustomerIllustration,
  getDishIllustration,
} from '../assets/illustration-map';
import { CardSvgFrame } from './CardSvgFrame';
import { getCustomerRequirementVisuals } from './customerRequirementVisuals';
import type { CustomerCard, DishCard } from '../content/schema';

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
    lines: [`1-${count}`, `x${customer.payout.maxCoins}`],
    ariaLabel: `1 to ${count} dishes, ${customer.payout.maxCoins} coins maximum`,
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
    <section className="mockup-section" aria-labelledby="mockups-heading">
      <div className="section-heading">
        <p className="eyebrow">Featured mockups</p>
        <h2 id="mockups-heading">Dish and customer card direction</h2>
      </div>

      <div className="mockup-grid">
        <article className="mockup-card mockup-card--dish">
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

        <article className="mockup-card mockup-card--customer">
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
