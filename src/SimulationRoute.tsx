import { Fragment, useMemo, useState } from 'react';
import type { GameConfig } from './content/loadGameConfig';
import type { GameContent } from './content/schema';
import { calculatePlayerScoreBreakdown } from './simulation/scoring';
import {
  restartSimulation,
  simulateNextRound,
  type CountMap,
  type RoundLogRow,
  type SimulationState,
} from './simulation/simulation';

type SimulationRouteProps = {
  content: GameContent;
  initialConfig: GameConfig;
};

function toPositiveInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function countTotal(counts: CountMap) {
  return Object.values(counts).reduce((total, count) => total + count, 0);
}

function formatCounts(
  counts: CountMap,
  orderedIds: string[],
  labelById: Map<string, string>,
) {
  const entries = orderedIds
    .map((id) => [labelById.get(id) ?? id, counts[id] ?? 0] as const)
    .filter(([, count]) => count > 0);

  if (entries.length === 0) {
    return 'None';
  }

  return entries.map(([label, count]) => `${label} ${count}`).join(', ');
}

function ConfigInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="simulation-field">
      <span>{label}</span>
      <input
        min="1"
        type="number"
        value={value}
        onChange={(event) => onChange(toPositiveInteger(event.target.value))}
      />
    </label>
  );
}

function getTopCustomers(state: SimulationState) {
  return state.customerDecks.map((deck, index) => ({
    deck: index + 1,
    customer: deck[0]?.title ?? 'Empty',
    remaining: deck.length,
  }));
}

type DisplayRoundLogRow = RoundLogRow & {
  resourcesLabel: string;
  mealsLabel: string;
  roundStartSupplyLabel?: string;
};

type DisplayScoreRow = {
  player: SimulationState['players'][number];
  claimedCustomers: string[];
  resourcesLabel: string;
  mealsLabel: string;
  score: ReturnType<typeof calculatePlayerScoreBreakdown>;
};

function renderRoundRows(
  row: DisplayRoundLogRow,
  index: number,
  rows: DisplayRoundLogRow[],
) {
  const previousRow = rows[index - 1];
  const shouldRenderDivider = previousRow && previousRow.round !== row.round;

  return (
    <Fragment key={`${row.round}-${row.playerId}-${index}`}>
      {shouldRenderDivider ? (
        <tr className="simulation-round-divider">
          <th colSpan={9}>Round {row.round}</th>
        </tr>
      ) : null}
      {row.roundStartSupplyLabel ? (
        <tr
          className="simulation-round-start"
          data-testid="simulation-round-start-row"
        >
          <th scope="row" colSpan={2}>
            Round {row.round} start
          </th>
          <td colSpan={7}>{row.roundStartSupplyLabel}</td>
        </tr>
      ) : null}
      <tr data-testid="simulation-player-row">
        <td>{row.round}</td>
        <th scope="row">{row.playerId}</th>
        <td>{row.action}</td>
        <td>{row.mealsMade.length > 0 ? row.mealsMade.join(', ') : 'None'}</td>
        <td>
          {row.customersClaimed.length > 0
            ? row.customersClaimed.join(', ')
            : 'None'}
        </td>
        <td>{row.coins}</td>
        <td data-format="counts">{row.resourcesLabel}</td>
        <td data-format="counts">{row.mealsLabel}</td>
        <td>{row.notes.length > 0 ? row.notes.join(' ') : 'None'}</td>
      </tr>
    </Fragment>
  );
}

export function SimulationRoute({
  content,
  initialConfig,
}: SimulationRouteProps) {
  const [formConfig, setFormConfig] = useState<GameConfig>(initialConfig);
  const [simulationState, setSimulationState] = useState(() =>
    restartSimulation(content, initialConfig),
  );

  const resourceIds = useMemo(
    () => content.resources.map((resource) => resource.id),
    [content.resources],
  );
  const resourceLabels = useMemo(
    () =>
      new Map(
        content.resources.map((resource) => [resource.id, resource.label]),
      ),
    [content.resources],
  );
  const dishIds = useMemo(
    () => content.dishes.map((dish) => dish.id),
    [content.dishes],
  );
  const dishLabels = useMemo(
    () => new Map(content.dishes.map((dish) => [dish.id, dish.title])),
    [content.dishes],
  );
  const customerLabels = useMemo(
    () =>
      new Map(
        content.customers.map((customer) => [customer.id, customer.title]),
      ),
    [content.customers],
  );
  const rows = simulationState.logRows.map((row, index, allRows) => {
    const previousRow = allRows[index - 1];
    const isFirstRowOfRound = !previousRow || previousRow.round !== row.round;

    return {
      ...row,
      resourcesLabel: formatCounts(row.resources, resourceIds, resourceLabels),
      mealsLabel: formatCounts(row.meals, dishIds, dishLabels),
      roundStartSupplyLabel: isFirstRowOfRound
        ? formatCounts(
            simulationState.roundStartResourceSupply[row.round] ?? {},
            resourceIds,
            resourceLabels,
          )
        : undefined,
    };
  });
  const scoreRows: DisplayScoreRow[] = simulationState.players.map(
    (player) => ({
      player,
      claimedCustomers: player.claimedCustomers.map(
        (customerId) => customerLabels.get(customerId) ?? customerId,
      ),
      resourcesLabel: formatCounts(
        player.resources,
        resourceIds,
        resourceLabels,
      ),
      mealsLabel: formatCounts(player.meals, dishIds, dishLabels),
      score: calculatePlayerScoreBreakdown(content, player),
    }),
  );

  function updateConfigField(
    field: Exclude<keyof GameConfig, 'resourceSupply'>,
    value: number,
  ) {
    setFormConfig((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateResourceSupply(resourceId: string, value: number) {
    setFormConfig((current) => ({
      ...current,
      resourceSupply: {
        ...current.resourceSupply,
        [resourceId]: value,
      },
    }));
  }

  function restart() {
    setSimulationState(restartSimulation(content, formConfig));
  }

  function nextRound() {
    setSimulationState((current) => simulateNextRound(current));
  }

  return (
    <>
      <section className="hero simulation-hero">
        <div className="hero__intro">
          <p className="eyebrow">Playtest model</p>
          <h1>Simulation</h1>
          <p className="hero-copy">
            One player action per row, finite ingredient supply, visible
            customer decks.
          </p>
        </div>
        <dl className="stats">
          <div>
            <dt>Round</dt>
            <dd>{simulationState.round}</dd>
          </div>
          <div>
            <dt>Players</dt>
            <dd>{simulationState.players.length}</dd>
          </div>
          <div>
            <dt>Tasks</dt>
            <dd>{simulationState.bonusTasksRemaining}</dd>
          </div>
        </dl>
      </section>

      <section className="simulation-layout" aria-label="Simulation controls">
        <form className="simulation-config">
          <div className="section-heading">
            <p className="eyebrow">Config</p>
            <h2>Game variables</h2>
          </div>
          <div className="simulation-field-grid">
            <ConfigInput
              label="Players"
              value={formConfig.playerCount}
              onChange={(value) => updateConfigField('playerCount', value)}
            />
            <ConfigInput
              label="Starting resources"
              value={formConfig.startingResourcesPerPlayer}
              onChange={(value) =>
                updateConfigField('startingResourcesPerPlayer', value)
              }
            />
            <ConfigInput
              label="Bonus tasks"
              value={formConfig.bonusTaskCount}
              onChange={(value) => updateConfigField('bonusTaskCount', value)}
            />
            <ConfigInput
              label="Task reward resources"
              value={formConfig.bonusTaskRewardResources}
              onChange={(value) =>
                updateConfigField('bonusTaskRewardResources', value)
              }
            />
            <ConfigInput
              label="Customer decks"
              value={formConfig.customerDeckCount}
              onChange={(value) =>
                updateConfigField('customerDeckCount', value)
              }
            />
          </div>

          <div className="simulation-resource-config">
            {content.resources.map((resource) => (
              <ConfigInput
                key={resource.id}
                label={`${resource.label} supply`}
                value={formConfig.resourceSupply[resource.id] ?? 1}
                onChange={(value) => updateResourceSupply(resource.id, value)}
              />
            ))}
          </div>

          <div className="simulation-actions">
            <button type="button" onClick={restart}>
              Restart
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={nextRound}
            >
              Next Round
            </button>
          </div>
        </form>

        <aside className="simulation-state-panel" aria-label="Market state">
          <div>
            <span>Current round {simulationState.round}</span>
            <strong>
              {countTotal(simulationState.resourceSupply)} resources in supply
            </strong>
          </div>
          <ul>
            {getTopCustomers(simulationState).map((deck) => (
              <li key={deck.deck}>
                <span>Deck {deck.deck}</span>
                <strong>{deck.customer}</strong>
                <small>{deck.remaining} left</small>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="content-section simulation-table-section">
        <div className="section-heading">
          <p className="eyebrow">Round log</p>
          <h2>Player actions</h2>
        </div>
        <div className="planning-table-wrap">
          <table className="planning-table simulation-table">
            <caption>Simulation round results</caption>
            <thead>
              <tr>
                <th scope="col">Round</th>
                <th scope="col">Player</th>
                <th scope="col">Action</th>
                <th scope="col">Meals Made</th>
                <th scope="col">Customers Claimed</th>
                <th scope="col">Coins</th>
                <th scope="col">Resources</th>
                <th scope="col">Meals</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map(renderRoundRows)
              ) : (
                <tr>
                  <td colSpan={9}>No rounds generated.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="simulation-actions">
          <button type="button" className="button-primary" onClick={nextRound}>
            Next Round
          </button>
        </div>
      </section>

      <section className="content-section simulation-score-section">
        <div className="section-heading">
          <p className="eyebrow">Score</p>
          <h2>Claimed customers and final score</h2>
        </div>
        <div
          className="simulation-score-grid"
          data-testid="simulation-score-summary"
        >
          {scoreRows.map(
            ({
              claimedCustomers,
              player,
              resourcesLabel,
              mealsLabel,
              score,
            }) => (
              <article key={player.id} className="simulation-score-card">
                <div>
                  <span>{player.id}</span>
                  <strong>{score.total} points</strong>
                </div>
                <p>
                  {claimedCustomers.length > 0
                    ? claimedCustomers.join(', ')
                    : 'No customers claimed'}
                </p>
                <div className="simulation-score-details">
                  <p>Coins: {score.coins}</p>
                  <p>Unspent meals: {mealsLabel}</p>
                  <p>Dish bonus: {score.dishBonus}</p>
                  <p>Leftover resources: {resourcesLabel}</p>
                  <p>Resource bonus: {score.resourceBonus}</p>
                  <p>End game bonuses: {score.endgameBonus}</p>
                  {score.endgameBonusBreakdown.length > 0 ? (
                    <ul className="simulation-score-bonus-list">
                      {score.endgameBonusBreakdown.map((bonus) => (
                        <li key={`${player.id}-${bonus.customerId}`}>
                          {bonus.label}: +{bonus.points}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ),
          )}
        </div>
      </section>
    </>
  );
}
