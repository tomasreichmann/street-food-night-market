import {
  cardIcons,
  coinIconSrc,
  dishTypeIcons,
  resourceIcons,
} from './assets/icon-map';
import qrCodeRulesSrc from './assets/qr-code-rules.png';
import { CardPreview } from './components/CardPreview';
import type { ReactNode } from 'react';
import type { GameContent } from './content/schema';
import layoutStyles from './App.module.css';
import rulesStyles from './Rules.module.css';
import styles from './RulesPrintRoute.module.css';
import {
  ActionCard,
  ActionExample,
  CardLegend,
  CoinPill,
  ComponentPill,
  DishPill,
  ResourcePill,
  RulesIcon,
  RulesSection,
  TypeIconPill,
  WantsExampleCard,
} from './components/RulesShared';
import { findById } from './components/rulesUtils';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type RulesPrintRouteProps = {
  content: GameContent;
};

function PrintPage({ children }: { children: ReactNode }) {
  return (
    <article className={styles.page} data-testid="rules-print-page">
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
    <div className={styles.route}>
      <PrintPage>
        <section
          className={cx(layoutStyles.hero, rulesStyles.hero, styles.hero)}
        >
          <div className={layoutStyles.heroIntro}>
            <p className={layoutStyles.eyebrow}>Birthday night market rules</p>
            <h1>Street Food Night Market</h1>
            <p className={layoutStyles.heroCopy}>
              Move around the room, trade with other players, cook dishes, and
              serve visible customers before the market closes.
            </p>
          </div>
          <div className={styles.heroAside} aria-label="Print hero extras">
            <div className={rulesStyles.heroAside} aria-label="Game stats">
              <div className={rulesStyles.heroStat}>
                <span>Players</span>
                <strong>15-20</strong>
              </div>
              <div className={rulesStyles.heroStat}>
                <span>Time</span>
                <strong>60 min</strong>
              </div>
              <div className={rulesStyles.heroStat}>
                <span>Win</span>
                <strong>Most points</strong>
              </div>
            </div>
            <img
              className={styles.qr}
              src={qrCodeRulesSrc}
              alt="Rules QR code"
            />
          </div>
        </section>

        <RulesSection eyebrow="Goal" heading="What you are trying to do">
          <div className={rulesStyles.leadGrid}>
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
        </RulesSection>

        <RulesSection
          eyebrow="Setup"
          heading="At the start of the game, you will get"
        >
          <div className={rulesStyles.setupPanel}>
            <h3>Your starting pieces</h3>
            <ul className={rulesStyles.iconList}>
              <li>
                <span>5 random resources:</span>
                <div className={rulesStyles.pillRow}>
                  {content.resources.map((resource) => (
                    <ResourcePill key={resource.id} resource={resource} />
                  ))}
                </div>
              </li>
              <li>
                <div className={rulesStyles.pillRow}>
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
        </RulesSection>
      </PrintPage>

      <PrintPage>
        <RulesSection eyebrow="Actions" heading="What you can do">
          <div className={rulesStyles.actionGrid}>
            <ActionCard
              iconLabel="Dish card"
              iconSrc={cardIcons.dish}
              title="Cook a dish"
              className={styles.actionCard}
            >
              <p>
                Spend the resource icons printed at the bottom of a dish card.
                Take that dish. The spent resources go back to the supply.
              </p>
              <ActionExample
                label="Example"
                className={styles.example}
                from={
                  <>
                    <ComponentPill
                      iconLabel="Greens resource"
                      iconSrc="/src/assets/icons/weed.png"
                      tone="resource"
                    >
                      Greens
                    </ComponentPill>
                    <ComponentPill
                      iconLabel="Umami resource"
                      iconSrc="/src/assets/icons/mushroom.png"
                      tone="resource"
                    >
                      Fungi
                    </ComponentPill>
                    <ComponentPill
                      iconLabel="Fuel resource"
                      iconSrc="/src/assets/icons/wood.png"
                      tone="resource"
                    >
                      Fuel
                    </ComponentPill>
                  </>
                }
                to={<DishPill dish={ramen} />}
              />
            </ActionCard>

            <ActionCard
              iconLabel="Customer card"
              iconSrc={cardIcons.customer}
              title="Serve a customer"
              className={styles.actionCard}
            >
              <p>
                Spend dishes that match the customer wants icons. Put those
                dishes back in the dish supply, then take the printed coins.
              </p>
              <ActionExample
                label="Example"
                className={styles.example}
                from={
                  <>
                    <DishPill dish={sushi} />
                    <span className={rulesStyles.exampleWord}>or</span>
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
              className={styles.actionCard}
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
              className={styles.actionCard}
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
              className={styles.actionCard}
            >
              <p>
                When you complete a task with another player, get their
                signature, cross off the task, and take 3 resources of your
                choice from the supply. Each task can only be completed once.
              </p>
            </ActionCard>
          </div>
        </RulesSection>
      </PrintPage>

      <PrintPage>
        <RulesSection
          eyebrow="Customer wants"
          heading="How to read wants icons"
        >
          <div className={cx(rulesStyles.symbolGuide, styles.symbolGuide)}>
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
              <span className={rulesStyles.rangeChip}>2-5</span>
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

          <div className={cx(rulesStyles.wantsGrid, styles.wantsGrid)}>
            <WantsExampleCard
              className={styles.wantsCard}
              customer={salaryman}
              dishes={content.dishes}
              wantsText="Any Rice"
              description="Serve one dish with the Rice type, such as Rice Plate or Sushi Platter."
            />
            <WantsExampleCard
              className={styles.wantsCard}
              customer={maidCafeMaid}
              dishes={content.dishes}
              wantsText="Sweet + Drink"
              description="Serve one Sweet dish and one Drink dish. A dish can only be spent once."
            />
            <WantsExampleCard
              className={styles.wantsCard}
              customer={sumoWrestler}
              dishes={content.dishes}
              wantsText="2-5 Meat / Rice"
              description="Serve between 2 and 5 dishes. Each served dish must be Meat or Rice."
            />
            <WantsExampleCard
              className={styles.wantsCard}
              customer={foodBlogger}
              dishes={content.dishes}
              wantsText="3 different dish types"
              description="Serve 3 separate dishes. Even if one dish shows more than one matching type, it still only counts once."
            />
            <WantsExampleCard
              className={styles.wantsCard}
              customer={businessExecutive}
              dishes={content.dishes}
              wantsText="Premium + Noodles + Vegetarian"
              description="Serve dishes that cover all three listed types before taking the payout."
            />
          </div>
        </RulesSection>
      </PrintPage>

      <PrintPage>
        <RulesSection
          eyebrow="Scoring"
          heading="How the game ends and how points are counted"
        >
          <div className={rulesStyles.scorebox}>
            <p>The game ends when:</p>
            <ul className={cx(rulesStyles.steps, rulesStyles.stepsTight)}>
              <li>When all customers are claimed.</li>
              <li>After 60 minutes.</li>
            </ul>
            <ol className={cx(rulesStyles.steps, rulesStyles.stepsTight)}>
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
        </RulesSection>
      </PrintPage>

      <PrintPage>
        <RulesSection
          eyebrow="Card legend"
          heading="What the sample cards are showing"
        >
          <div className={rulesStyles.anatomyGrid}>
            <CardLegend
              kind="dish"
              title="Sample dish card"
              className={styles.cardLegend}
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
              className={styles.cardLegend}
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
        </RulesSection>
      </PrintPage>
    </div>
  );
}
