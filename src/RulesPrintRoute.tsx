import type { CSSProperties, ReactNode } from 'react';
import {
  cardIcons,
  coinIconSrc,
  dishTypeIcons,
  resourceIcons,
} from './assets/icon-map';
import qrCodeRulesSrc from './assets/qr-code-rules.png';
import { CardPreview } from './components/CardPreview';
import type {
  CustomerCard,
  DishCard,
  GameContent,
  ResourceDefinition,
} from './content/schema';

type RulesPrintRouteProps = {
  content: GameContent;
};

type ComponentPillTone = 'coin' | 'customer' | 'dish' | 'resource' | 'task';

function findById<T extends { id: string }>(
  items: T[],
  id: string,
  fallbackIndex = 0,
) {
  return items.find((item) => item.id === id) ?? items[fallbackIndex];
}

function RulesIcon({ label, src }: { label: string; src: string }) {
  return <img className="rules-icon" src={src} alt={label} />;
}

function ComponentPill({
  children,
  iconLabel,
  iconSrc,
  tone,
}: {
  children: ReactNode;
  iconLabel: string;
  iconSrc: string;
  tone: ComponentPillTone;
}) {
  return (
    <span className={`rules-pill rules-pill--${tone}`}>
      <RulesIcon src={iconSrc} label={iconLabel} />
      <span>{children}</span>
    </span>
  );
}

function ResourcePill({ resource }: { resource: ResourceDefinition }) {
  return (
    <ComponentPill
      iconLabel={`${resource.label} resource`}
      iconSrc={resourceIcons[resource.id as keyof typeof resourceIcons]}
      tone="resource"
    >
      {resource.label}
    </ComponentPill>
  );
}

function DishPill({ dish }: { dish: DishCard }) {
  return (
    <ComponentPill iconLabel="Dish card" iconSrc={cardIcons.dish} tone="dish">
      {dish.title}
    </ComponentPill>
  );
}

function CoinPill({ children }: { children: ReactNode }) {
  return (
    <ComponentPill iconLabel="Coins" iconSrc={coinIconSrc} tone="coin">
      {children}
    </ComponentPill>
  );
}

function ActionCard({
  children,
  iconLabel,
  iconSrc,
  title,
}: {
  children: ReactNode;
  iconLabel: string;
  iconSrc: string;
  title: string;
}) {
  return (
    <article className="rules-action-card">
      <div className="rules-action-card__header">
        <RulesIcon src={iconSrc} label={iconLabel} />
        <h3>{title}</h3>
      </div>
      {children}
    </article>
  );
}

function ActionExample({
  from,
  label,
  to,
}: {
  from: ReactNode;
  label: string;
  to: ReactNode;
}) {
  return (
    <div className="rules-example-strip">
      <span className="rules-example-strip__label">{label}</span>
      <div className="rules-example-strip__flow">
        <div>{from}</div>
        <strong aria-hidden="true">-&gt;</strong>
        <div>{to}</div>
      </div>
    </div>
  );
}

function TypeIconPill({ label, tag }: { label: string; tag: string }) {
  return (
    <ComponentPill
      iconLabel={`${label} type`}
      iconSrc={dishTypeIcons[tag as keyof typeof dishTypeIcons]}
      tone="dish"
    >
      {label}
    </ComponentPill>
  );
}

function WantsExampleCard({
  customer,
  description,
  dishes,
  wantsText,
}: {
  customer: CustomerCard;
  description: string;
  dishes: DishCard[];
  wantsText: string;
}) {
  return (
    <article className="rules-wants-card">
      <div className="rules-wants-card__preview">
        <CardPreview
          kind="customer"
          item={customer}
          dishes={dishes}
          cornerRadius={0}
        />
      </div>
      <div className="rules-wants-card__copy">
        <p className="eyebrow">{customer.title}</p>
        <h3>{wantsText}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

function LegendItem({
  index,
  text,
  title,
}: {
  index: number;
  text: string;
  title: string;
}) {
  return (
    <li className="rules-legend-item">
      <strong>{index}</strong>
      <span>
        <b>{title}</b>
        {text}
      </span>
    </li>
  );
}

type CardLegendMarker = {
  label: string;
  style: CSSProperties;
};

function CardLegend({
  card,
  items,
  kind,
  markers,
  title,
}: {
  card: ReactNode;
  items: Array<{ title: string; text: string }>;
  kind: 'customer' | 'dish';
  markers: CardLegendMarker[];
  title: string;
}) {
  return (
    <article className={`rules-card-legend rules-card-legend--${kind}`}>
      <div className="rules-card-legend__preview">
        <p className="eyebrow">{title}</p>
        <div className="rules-card-legend__stage">
          {card}
          {markers.map((marker, index) => (
            <span
              key={marker.label}
              aria-hidden="true"
              className="rules-card-legend__marker"
              data-testid={`rules-card-legend-marker-${kind}-${index + 1}`}
              style={marker.style}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>
      <ol className="rules-legend-list">
        {items.map((item, index) => (
          <LegendItem
            key={item.title}
            index={index + 1}
            title={item.title}
            text={item.text}
          />
        ))}
      </ol>
    </article>
  );
}

function PrintPage({
  children,
  testId,
}: {
  children: ReactNode;
  testId: string;
}) {
  return (
    <article
      className="rules-print-page"
      data-page={testId}
      data-testid="rules-print-page"
    >
      {children}
    </article>
  );
}

export function RulesPrintRoute({ content }: RulesPrintRouteProps) {
  const resourcesById = new Map(
    content.resources.map((resource) => [resource.id, resource]),
  );
  const greens = resourcesById.get('greens') ?? content.resources[0];
  const umami = resourcesById.get('fungi') ?? content.resources[1];
  const fuel = resourcesById.get('fuel') ?? content.resources[2];
  const featuredCustomer = findById(content.customers, 'seafood-lover');
  const ramen = findById(content.dishes, 'ramen-bowl');
  const sushi = findById(content.dishes, 'sushi-platter');
  const sashimi = findById(content.dishes, 'sashimi');
  const salaryman = findById(content.customers, 'salaryman');
  const maidCafeMaid = findById(content.customers, 'maid-cafe-maid');
  const sumoWrestler = findById(content.customers, 'sumo-wrestler');
  const foodBlogger = findById(content.customers, 'food-blogger');
  const businessExecutive = findById(content.customers, 'business-executive');

  if (
    !greens ||
    !umami ||
    !fuel ||
    !featuredCustomer ||
    !ramen ||
    !sushi ||
    !sashimi ||
    !salaryman ||
    !maidCafeMaid ||
    !sumoWrestler ||
    !foodBlogger ||
    !businessExecutive
  ) {
    return null;
  }

  return (
    <div className="rules-print-route">
      <PrintPage testId="rules-print-page-goal">
        <section className="hero rules-hero rules-hero--web rules-print-hero">
          <div className="hero__intro">
            <p className="eyebrow">Birthday night market rules</p>
            <h1>Street Food Night Market</h1>
            <p className="hero-copy">
              Move around the room, trade with other players, cook dishes, and
              serve visible customers before the market closes.
            </p>
          </div>
          <div
            className="rules-print-hero__aside"
            aria-label="Print hero extras"
          >
            <div className="rules-hero__aside" aria-label="Game stats">
              <div className="rules-hero__stat">
                <span>Players</span>
                <strong>15-20</strong>
              </div>
              <div className="rules-hero__stat">
                <span>Time</span>
                <strong>60 min</strong>
              </div>
              <div className="rules-hero__stat">
                <span>Win</span>
                <strong>Most points</strong>
              </div>
            </div>
            <img
              className="rules-print-hero__qr"
              src={qrCodeRulesSrc}
              alt="Rules QR code"
            />
          </div>
        </section>
        <section className="rules-print-page__content">
          <div className="section-heading section-heading--rules">
            <p className="eyebrow">Goal</p>
            <h2>What you are trying to do</h2>
          </div>
          <div className="rules-lead-grid">
            <p>
              You run a food stall. Your job is to turn resources into dishes,
              spend those dishes to claim customers, and finish with the most
              points.
            </p>
            <p>
              Most of the game happens through talking: trade resources, dishes,
              and coins with other players. Customers stay in front of the
              market; you never trade customers.
            </p>
          </div>
        </section>
        <section className="rules-print-page__content">
          <div className="section-heading section-heading--rules">
            <p className="eyebrow">Setup</p>
            <h2>At the start of the game, you will get</h2>
          </div>
          <div className="rules-setup-panel">
            <h3>Your starting pieces</h3>
            <ul className="rules-icon-list">
              <li>
                <span>5 random resources:</span>
                <div className="rules-pill-row">
                  {content.resources.map((resource) => (
                    <ResourcePill key={resource.id} resource={resource} />
                  ))}
                </div>
              </li>
              <li>
                <div className="rules-pill-row">
                  <ComponentPill
                    iconLabel="Bonus task sheet"
                    iconSrc={cardIcons.customer}
                    tone="task"
                  >
                    1 bonus task sheet
                  </ComponentPill>
                  <ComponentPill
                    iconLabel="Stall card"
                    iconSrc={cardIcons.dish}
                    tone="task"
                  >
                    1 stall card
                  </ComponentPill>
                </div>
              </li>
              <li>
                <span>
                  Pick a cool name and customize your stall card to earn extra
                  coins at the end of the game
                </span>
              </li>
            </ul>
          </div>
          <div className="rules-setup-grid">
            {/* {<div className="rules-setup-panel">
              <h3>The shared market</h3>
              <ul className="rules-icon-list">
                <li>Put all remaining resources, dishes, and coins nearby.</li>
                <li>
                  Shuffle customers and reveal 4 visible customer stacks where
                  everyone can reach them.
                </li>
                <li>
                  Start the timer. The market closes after 60 minutes, or when 3
                  of the 4 customer stacks are gone.
                </li>
              </ul>
            </div>} */}
          </div>
        </section>
      </PrintPage>

      <PrintPage testId="rules-print-page-actions">
        <section className="rules-print-page__content">
          <div className="section-heading section-heading--rules">
            <p className="eyebrow">Actions</p>
            <h2>What you can do</h2>
          </div>
          <div className="rules-action-grid">
            <ActionCard
              iconLabel="Dish card"
              iconSrc={cardIcons.dish}
              title="Cook a dish"
            >
              <p>
                Spend the resource icons printed at the bottom of a dish card.
                Take that dish. The spent resources go back to the supply.
              </p>
              <ActionExample
                label="Example"
                from={
                  <>
                    <ResourcePill resource={greens} />
                    <ResourcePill resource={umami} />
                    <ResourcePill resource={fuel} />
                  </>
                }
                to={<DishPill dish={ramen} />}
              />
            </ActionCard>

            <ActionCard
              iconLabel="Customer card"
              iconSrc={cardIcons.customer}
              title="Serve a customer"
            >
              <p>
                Spend dishes that match the customer wants icons. Put those
                dishes back in the dish supply, then take the printed coins.
              </p>
              <ActionExample
                label="Example"
                from={
                  <>
                    <DishPill dish={sushi} />
                    <span className="rules-example-word">or</span>
                    <DishPill dish={sashimi} />
                  </>
                }
                to={
                  <>
                    <ComponentPill
                      iconLabel="Customer card"
                      iconSrc={cardIcons.customer}
                      tone="customer"
                    >
                      Seafood Lover
                    </ComponentPill>
                    <CoinPill>7 coins per served dish</CoinPill>
                  </>
                }
              />
            </ActionCard>

            <ActionCard
              iconLabel="Coins"
              iconSrc={coinIconSrc}
              title="Buy a resource"
            >
              <p>
                You can spend 1 coin to take 1 resource from the supply. Use
                this when a trade is not available and you need one more token.
              </p>
              <p>
                If you have 8 or more coins after claiming a customer or a
                trade, you cannot receive any more coins unless you spend some.
                Claiming another customer when you are at maximum means you get
                the card, but not the coins.
              </p>
            </ActionCard>

            <ActionCard
              iconLabel="Resources"
              iconSrc={resourceIcons.meat}
              title="Trade with players"
            >
              <p>
                You can trade resources, coins, and dishes in any deal both
                players accept. Customers are claimed points, so customers are
                not traded.
              </p>
            </ActionCard>

            <ActionCard
              iconLabel="Bonus task"
              iconSrc={dishTypeIcons.premium}
              title="Complete a bonus task"
            >
              <p>
                When you complete a task with another player, get their
                signature, cross off the task, and take 3 resources of your
                choice from the supply. Each task can only be completed once.
              </p>
            </ActionCard>
          </div>
        </section>
      </PrintPage>

      <PrintPage testId="rules-print-page-wants">
        <section className="rules-print-page__content">
          <div className="section-heading section-heading--rules">
            <p className="eyebrow">Customer wants</p>
            <h2>How to read wants icons</h2>
          </div>
          <div className="rules-symbol-guide">
            <div>
              <TypeIconPill tag="rice" label="Rice" />
              <p>One icon means spend one dish with that type.</p>
            </div>
            <div>
              <TypeIconPill tag="sweet" label="Sweet" />
              <strong>+</strong>
              <TypeIconPill tag="drink" label="Drink" />
              <p>A plus means the customer needs every listed type.</p>
            </div>
            <div>
              <span className="rules-range-chip">2-5</span>
              <TypeIconPill tag="meat" label="Meat" />
              <strong>/</strong>
              <TypeIconPill tag="rice" label="Rice" />
              <p>A range means you may serve that many matching dishes.</p>
            </div>
            <div>
              <RulesIcon src={cardIcons.dish} label="Dish type" />
              <strong>!=</strong>
              <RulesIcon src={cardIcons.dish} label="Dish type" />
              <strong>!=</strong>
              <RulesIcon src={cardIcons.dish} label="Dish type" />
              <p>
                Different dish types means you need three separate dishes, and
                each dish can only count once even if it matches more than one
                required type.
              </p>
            </div>
          </div>

          <div className="rules-wants-grid">
            <WantsExampleCard
              customer={salaryman}
              dishes={content.dishes}
              wantsText="Any Rice"
              description="Serve one dish with the Rice type, such as Rice Plate or Sushi Platter."
            />
            <WantsExampleCard
              customer={maidCafeMaid}
              dishes={content.dishes}
              wantsText="Sweet + Drink"
              description="Serve one Sweet dish and one Drink dish. A dish can only be spent once."
            />
            <WantsExampleCard
              customer={sumoWrestler}
              dishes={content.dishes}
              wantsText="2-5 Meat / Rice"
              description="Serve between 2 and 5 dishes. Each served dish must be Meat or Rice."
            />
            <WantsExampleCard
              customer={foodBlogger}
              dishes={content.dishes}
              wantsText="3 different dish types"
              description="Serve 3 separate dishes. Even if one dish shows more than one matching type, it still only counts once."
            />
            <WantsExampleCard
              customer={businessExecutive}
              dishes={content.dishes}
              wantsText="Premium + Noodles + Vegetarian"
              description="Serve dishes that cover all three listed types before taking the payout."
            />
          </div>
        </section>
      </PrintPage>

      <PrintPage testId="rules-print-page-scoring">
        <section className="rules-print-page__content">
          <div className="section-heading section-heading--rules">
            <p className="eyebrow">Scoring</p>
            <h2>How the game ends and how points are counted</h2>
          </div>
          <div className="rules-scorebox">
            <p>The game ends when:</p>
            <ul className="rules-steps rules-steps--tight">
              <li>When all customers are claimed.</li>
              <li>After 60 minutes.</li>
            </ul>
            <ol className="rules-steps rules-steps--tight">
              <li>Coins earned during play are 1 point each.</li>
              <li>
                Each unspent dish is worth points equal to its printed coin
                value.
              </li>
              <li>Every 2 leftover resources score 1 point, rounded down.</li>
              <li>The coolest stall card gets +10 points.</li>
              <li>
                Add any endgame bonus points printed on served customer cards.
              </li>
            </ol>
            <p>
              Tiebreakers, in order: most served customers, then most leftover
              dishes, then most leftover resources. If there is still a tie,
              share the win.
            </p>
          </div>
        </section>
      </PrintPage>

      <PrintPage testId="rules-print-page-legend">
        <section className="rules-print-page__content">
          <div className="section-heading section-heading--rules">
            <p className="eyebrow">Card legend</p>
            <h2>What the sample cards are showing</h2>
          </div>
          <div className="rules-anatomy-grid">
            <CardLegend
              kind="dish"
              title="Sample dish card"
              card={<CardPreview kind="dish" item={ramen} cornerRadius={0} />}
              markers={[
                { label: 'Dish title', style: { top: '13%', left: '34%' } },
                {
                  label: 'Printed coin value',
                  style: { top: '10%', right: '7%' },
                },
                { label: 'Type icons', style: { top: '39%', right: '8%' } },
                {
                  label: 'Resource cost',
                  style: { bottom: '9%', left: '50%' },
                },
              ]}
              items={[
                {
                  title: 'Dish title',
                  text: ' is the name players use when trading or serving.',
                },
                {
                  title: 'Printed coin value',
                  text: ' is the endgame value if this dish is still unspent.',
                },
                {
                  title: 'Type icons',
                  text: ' show which customer wants this dish can satisfy.',
                },
                {
                  title: 'Resource cost',
                  text: ' is what you spend from your hand to cook this dish.',
                },
              ]}
            />

            <CardLegend
              kind="customer"
              title="Sample customer card"
              card={
                <CardPreview
                  kind="customer"
                  item={featuredCustomer}
                  dishes={content.dishes}
                  cornerRadius={0}
                />
              }
              markers={[
                { label: 'Tier stars', style: { top: '11%', left: '17%' } },
                {
                  label: 'Customer wants',
                  style: { bottom: '12%', left: '48%' },
                },
                { label: 'Payout', style: { top: '10%', right: '8%' } },
                {
                  label: 'Endgame bonus area',
                  style: { bottom: '26%', left: '50%' },
                },
              ]}
              items={[
                {
                  title: 'Tier stars',
                  text: ' show how demanding the customer is.',
                },
                {
                  title: 'Customer wants',
                  text: ' show the dishes you must spend to claim this customer.',
                },
                {
                  title: 'Payout',
                  text: ' is the coins you take immediately after serving.',
                },
                {
                  title: 'Endgame bonus area',
                  text: ' scores only if you served that customer.',
                },
              ]}
            />
          </div>
        </section>
      </PrintPage>
    </div>
  );
}
