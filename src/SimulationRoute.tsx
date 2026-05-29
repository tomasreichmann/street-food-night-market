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
import layoutStyles from './App.module.css';
import tableStyles from './components/CardPlanningTable.module.css';
import styles from './SimulationRoute.module.css';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

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
    <label className={styles.field}>
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

function serializeCountMap(
  counts: CountMap,
  orderedIds: string[],
  labelById: Map<string, string>,
): SerializedCountEntry[] {
  return orderedIds
    .map((id) => ({
      id,
      label: labelById.get(id) ?? id,
      count: counts[id] ?? 0,
    }))
    .filter((entry) => entry.count > 0);
}

function buildSimulationExportPayload({
  content,
  state,
  resourceIds,
  resourceLabels,
  dishIds,
  dishLabels,
  customerLabels,
  scoreRows,
}: {
  content: GameContent;
  state: SimulationState;
  resourceIds: string[];
  resourceLabels: Map<string, string>;
  dishIds: string[];
  dishLabels: Map<string, string>;
  customerLabels: Map<string, string>;
  scoreRows: DisplayScoreRow[];
}): SimulationExportPayload {
  return {
    schemaVersion: 1,
    round: state.round,
    config: state.config,
    bonusTasksRemaining: state.bonusTasksRemaining,
    resources: serializeCountMap(
      state.resourceSupply,
      resourceIds,
      resourceLabels,
    ),
    dishes: serializeCountMap(state.dishSupply, dishIds, dishLabels),
    customers: content.customers.map((customer) => ({
      id: customer.id,
      title: customer.title,
      tier: customer.tier,
    })),
    roundStartResourceSupply: Object.entries(state.roundStartResourceSupply)
      .map(([round, counts]) => ({
        round: Number.parseInt(round, 10),
        resources: serializeCountMap(counts, resourceIds, resourceLabels),
      }))
      .sort((first, second) => first.round - second.round),
    players: state.players.map((player) => ({
      id: player.id,
      coins: player.coins,
      resources: serializeCountMap(
        player.resources,
        resourceIds,
        resourceLabels,
      ),
      meals: serializeCountMap(player.meals, dishIds, dishLabels),
      claimedCustomers: player.claimedCustomers.map((customerId) => ({
        id: customerId,
        title: customerLabels.get(customerId) ?? customerId,
      })),
      bonusTasksRemaining: player.bonusTasksRemaining,
      score:
        scoreRows.find((row) => row.player.id === player.id)?.score ??
        calculatePlayerScoreBreakdown(content, player),
    })),
    logRows: state.logRows.map((row) => ({
      round: row.round,
      playerId: row.playerId,
      action: row.action,
      mealsMade: row.mealsMade,
      customersClaimed: row.customersClaimed,
      coins: row.coins,
      resources: serializeCountMap(row.resources, resourceIds, resourceLabels),
      meals: serializeCountMap(row.meals, dishIds, dishLabels),
      notes: row.notes,
    })),
  };
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

type SerializedCountEntry = {
  id: string;
  label: string;
  count: number;
};

type SimulationExportPayload = {
  schemaVersion: 1;
  round: number;
  config: GameConfig;
  bonusTasksRemaining: number;
  resources: SerializedCountEntry[];
  dishes: SerializedCountEntry[];
  customers: Array<{
    id: string;
    title: string;
    tier: number;
  }>;
  roundStartResourceSupply: Array<{
    round: number;
    resources: SerializedCountEntry[];
  }>;
  players: Array<{
    id: string;
    coins: number;
    resources: SerializedCountEntry[];
    meals: SerializedCountEntry[];
    claimedCustomers: Array<{
      id: string;
      title: string;
    }>;
    bonusTasksRemaining: number;
    score: ReturnType<typeof calculatePlayerScoreBreakdown>;
  }>;
  logRows: Array<{
    round: number;
    playerId: string;
    action: SimulationState['logRows'][number]['action'];
    mealsMade: string[];
    customersClaimed: string[];
    coins: number;
    resources: SerializedCountEntry[];
    meals: SerializedCountEntry[];
    notes: string[];
  }>;
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
        <tr className={styles.roundDivider}>
          <th colSpan={9}>Round {row.round}</th>
        </tr>
      ) : null}
      {row.roundStartSupplyLabel ? (
        <tr
          className={styles.roundStart}
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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle',
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

  async function copySimulationData() {
    const payload = buildSimulationExportPayload({
      content,
      state: simulationState,
      resourceIds,
      resourceLabels,
      dishIds,
      dishLabels,
      customerLabels,
      scoreRows,
    });

    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <>
      <section className={cx(layoutStyles.hero, styles.hero)}>
        <div className={layoutStyles.heroIntro}>
          <p className={layoutStyles.eyebrow}>Playtest model</p>
          <h1>Simulation</h1>
          <p className={layoutStyles.heroCopy}>
            One player action per row, finite ingredient supply, visible
            customer decks.
          </p>
        </div>
        <dl className={layoutStyles.stats}>
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

      <section className={styles.layout} aria-label="Simulation controls">
        <form className={styles.config}>
          <div className={layoutStyles.sectionHeading}>
            <p className={layoutStyles.eyebrow}>Config</p>
            <h2>Game variables</h2>
          </div>
          <div className={styles.fieldGrid}>
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

          <div className={styles.resourceConfig}>
            {content.resources.map((resource) => (
              <ConfigInput
                key={resource.id}
                label={`${resource.label} supply`}
                value={formConfig.resourceSupply[resource.id] ?? 1}
                onChange={(value) => updateResourceSupply(resource.id, value)}
              />
            ))}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={restart}>
              Restart
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={nextRound}
            >
              Next Round
            </button>
          </div>
        </form>

        <aside className={styles.statePanel} aria-label="Market state">
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

      <section className={cx(layoutStyles.contentSection, styles.tableSection)}>
        <div className={layoutStyles.sectionHeading}>
          <p className={layoutStyles.eyebrow}>Round log</p>
          <h2>Player actions</h2>
        </div>
        <div className={tableStyles.wrap}>
          <table className={cx(tableStyles.table, styles.table)}>
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
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={nextRound}
          >
            Next Round
          </button>
          <button type="button" onClick={copySimulationData}>
            Copy data
          </button>
        </div>
        <p className={styles.copyStatus} aria-live="polite">
          {copyStatus === 'copied'
            ? 'Copied JSON to clipboard.'
            : copyStatus === 'error'
              ? 'Clipboard copy failed.'
              : null}
        </p>
      </section>

      <section className={cx(layoutStyles.contentSection, styles.scoreSection)}>
        <div className={layoutStyles.sectionHeading}>
          <p className={layoutStyles.eyebrow}>Score</p>
          <h2>Claimed customers and final score</h2>
        </div>
        <div
          className={styles.scoreGrid}
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
              <article key={player.id} className={styles.scoreCard}>
                <div>
                  <span>{player.id}</span>
                  <strong>{score.total} points</strong>
                </div>
                <p>
                  {claimedCustomers.length > 0
                    ? claimedCustomers.join(', ')
                    : 'No customers claimed'}
                </p>
                <div className={styles.scoreDetails}>
                  <p>Coins: {score.coins}</p>
                  <p>Unspent meals: {mealsLabel}</p>
                  <p>Dish bonus: {score.dishBonus}</p>
                  <p>Leftover resources: {resourcesLabel}</p>
                  <p>Resource bonus: {score.resourceBonus}</p>
                  <p>End game bonuses: {score.endgameBonus}</p>
                  {score.endgameBonusBreakdown.length > 0 ? (
                    <ul className={styles.bonusList}>
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
