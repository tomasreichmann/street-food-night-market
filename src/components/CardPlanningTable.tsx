import { summarizeCardContent } from '../content/contentSummary';
import type { GameContent } from '../content/schema';
import layoutStyles from '../App.module.css';
import styles from './CardPlanningTable.module.css';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type CardPlanningTableProps = {
  content: GameContent;
};

function DishTypeTotals({ totals }: { totals: Array<[string, number]> }) {
  return (
    <ul className={styles.chips} aria-label="Dish type totals">
      {totals.map(([dishType, count]) => (
        <li key={dishType}>{`${dishType}: ${count}`}</li>
      ))}
    </ul>
  );
}

function ResourceUsageTotals({ totals }: { totals: Array<[string, number]> }) {
  return (
    <ul className={styles.chips} aria-label="Resource usage totals">
      {totals.map(([resourceId, count]) => (
        <li key={resourceId}>{`${resourceId}: ${count}`}</li>
      ))}
    </ul>
  );
}

export function CardPlanningTable({ content }: CardPlanningTableProps) {
  const summary = summarizeCardContent(content);

  return (
    <section
      className={cx(layoutStyles.contentSection, styles.section)}
      aria-labelledby="planning-table-heading"
    >
      <div className={layoutStyles.sectionHeading}>
        <p className={layoutStyles.eyebrow}>Planning ledger</p>
        <h2 id="planning-table-heading">Card planning table</h2>
      </div>

      <div className={styles.totals} aria-label="Card totals">
        <div>
          <span>Dish cards</span>
          <strong>{summary.totals.dishCopies}</strong>
        </div>
        <div>
          <span>Customer cards</span>
          <strong>{summary.totals.customerCopies}</strong>
        </div>
        <div>
          <span>Total cards</span>
          <strong>{summary.totals.totalCardCopies}</strong>
        </div>
      </div>

      <DishTypeTotals totals={summary.totals.dishTypeTotals} />
      <ResourceUsageTotals totals={summary.totals.resourceUsageTotals} />

      <div className={styles.wrap}>
        <table className={styles.table}>
          <caption>
            Dishes, customers, counts, combinations, and economy notes
          </caption>
          <thead>
            <tr>
              <th scope="col">Card</th>
              <th scope="col">Tier</th>
              <th scope="col">Copies</th>
              <th scope="col">Cost / Wants</th>
              <th scope="col">Types / Reward</th>
              <th scope="col">Coverage / Combos</th>
              <th scope="col">Economy</th>
            </tr>
          </thead>
          <tbody>
            {summary.dishRows.map((dish) => (
              <tr key={dish.id}>
                <th scope="row">
                  <span className={styles.kind}>Dish</span>
                  {dish.title}
                </th>
                <td>{dish.tier}</td>
                <td>{dish.copies}</td>
                <td>
                  {dish.cost}
                  <span className={styles.meta}>total {dish.costTotal}</span>
                </td>
                <td>{dish.dishTypes}</td>
                <td>{dish.customerCoverageLabel}</td>
                <td>Resource cost basis</td>
              </tr>
            ))}

            {summary.customerRows.map((customer) => (
              <tr key={customer.id}>
                <th scope="row">
                  <span className={styles.kind}>Customer</span>
                  {customer.title}
                </th>
                <td>{customer.tier}</td>
                <td>{customer.copies}</td>
                <td>
                  {customer.want}
                  <span className={styles.meta}>
                    baseline {customer.matchedDishTitle}
                    {customer.matchedCostBasis === null
                      ? ''
                      : `, avg cost ${customer.matchedCostBasis.toFixed(2)}`}
                  </span>
                </td>
                <td>{customer.reward}</td>
                <td>
                  {customer.dishCombinations.length > 0 ? (
                    <ul className={styles.combos}>
                      {customer.dishCombinations.map((combination) => (
                        <li key={combination}>{combination}</li>
                      ))}
                    </ul>
                  ) : (
                    'No matching combinations'
                  )}
                  <span className={styles.meta}>
                    {customer.dishCombinationSummary}
                  </span>
                </td>
                <td>
                  <span
                    className={cx(
                      styles.badge,
                      customer.economyStatus === 'OK' && styles.badgeOk,
                      customer.economyStatus === 'Review' && styles.badgeReview,
                      customer.economyStatus === 'No match' &&
                        styles.badgeNoMatch,
                    )}
                  >
                    {customer.economyStatus}
                  </span>
                  <span className={styles.meta}>{customer.economyNote}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
