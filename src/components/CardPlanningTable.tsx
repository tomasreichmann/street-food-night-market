import { summarizeCardContent } from '../content/contentSummary';
import type { GameContent } from '../content/schema';

type CardPlanningTableProps = {
  content: GameContent;
};

function DishTypeTotals({ totals }: { totals: Array<[string, number]> }) {
  return (
    <ul className="planning-table__chips" aria-label="Dish type totals">
      {totals.map(([dishType, count]) => (
        <li key={dishType}>{`${dishType}: ${count}`}</li>
      ))}
    </ul>
  );
}

function ResourceUsageTotals({ totals }: { totals: Array<[string, number]> }) {
  return (
    <ul className="planning-table__chips" aria-label="Resource usage totals">
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
      className="content-section planning-table-section"
      aria-labelledby="planning-table-heading"
    >
      <div className="section-heading">
        <p className="eyebrow">Planning ledger</p>
        <h2 id="planning-table-heading">Card planning table</h2>
      </div>

      <div className="planning-totals" aria-label="Card totals">
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

      <div className="planning-table-wrap">
        <table className="planning-table">
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
                  <span className="planning-table__kind">Dish</span>
                  {dish.title}
                </th>
                <td>{dish.tier}</td>
                <td>{dish.copies}</td>
                <td>
                  {dish.cost}
                  <span className="planning-table__meta">
                    total {dish.costTotal}
                  </span>
                </td>
                <td>{dish.dishTypes}</td>
                <td>{dish.customerCoverageLabel}</td>
                <td>Resource cost basis</td>
              </tr>
            ))}

            {summary.customerRows.map((customer) => (
              <tr key={customer.id}>
                <th scope="row">
                  <span className="planning-table__kind">Customer</span>
                  {customer.title}
                </th>
                <td>{customer.tier}</td>
                <td>{customer.copies}</td>
                <td>
                  {customer.want}
                  <span className="planning-table__meta">
                    baseline {customer.matchedDishTitle}
                    {customer.matchedCostBasis === null
                      ? ''
                      : `, avg cost ${customer.matchedCostBasis.toFixed(2)}`}
                  </span>
                </td>
                <td>{customer.reward}</td>
                <td>
                  {customer.dishCombinations.length > 0 ? (
                    <ul className="planning-table__combos">
                      {customer.dishCombinations.map((combination) => (
                        <li key={combination}>{combination}</li>
                      ))}
                    </ul>
                  ) : (
                    'No matching combinations'
                  )}
                  <span className="planning-table__meta">
                    {customer.dishCombinationSummary}
                  </span>
                </td>
                <td>
                  <span
                    className={`economy-badge economy-badge--${customer.economyStatus.toLowerCase().replace(' ', '-')}`}
                  >
                    {customer.economyStatus}
                  </span>
                  <span className="planning-table__meta">
                    {customer.economyNote}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
