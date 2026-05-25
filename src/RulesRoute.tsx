import type { ReactNode } from 'react';
import { CardPreview } from './components/CardPreview';
import type { GameContent } from './content/schema';

type RulesRouteProps = {
  content: GameContent;
};

function RulesSection({
  eyebrow,
  heading,
  children,
  testId,
}: {
  eyebrow: string;
  heading: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section className="rules-section" data-testid={testId}>
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{heading}</h2>
      </div>
      {children}
    </section>
  );
}

function CalloutList({
  items,
}: {
  items: Array<{ title: string; text: string }>;
}) {
  return (
    <dl className="rules-callout-list">
      {items.map((item) => (
        <div key={item.title} className="rules-callout-item">
          <dt>{item.title}</dt>
          <dd>{item.text}</dd>
        </div>
      ))}
    </dl>
  );
}

function SampleCardAnatomy({
  title,
  card,
  items,
  kind,
}: {
  title: string;
  card: ReactNode;
  items: Array<{ title: string; text: string }>;
  kind: 'dish' | 'customer';
}) {
  return (
    <article className={`rules-anatomy-card rules-anatomy-card--${kind}`}>
      <div className="rules-anatomy-card__preview">{card}</div>
      <div className="rules-anatomy-card__content">
        <p className="eyebrow">{title}</p>
        <CalloutList items={items} />
      </div>
    </article>
  );
}

export function RulesRoute({ content }: RulesRouteProps) {
  const featuredDish =
    content.dishes.find((dish) => dish.id === 'ramen-bowl') ??
    content.dishes[0];
  const featuredCustomer =
    content.customers.find((customer) => customer.id === 'seafood-lover') ??
    content.customers[0];

  if (!featuredDish || !featuredCustomer) {
    return null;
  }

  return (
    <div className="rules-route">
      <section className="hero rules-hero">
        <div className="hero__intro">
          <p className="eyebrow">Printable rules handout</p>
          <h1>Street Food Night Market</h1>
          <p className="hero-copy">
            Welcome to the market. You will trade, cook, serve, and race to the
            best score in 60 minutes or before the customer stacks disappear.
          </p>
        </div>

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
            <span>Goal</span>
            <strong>Most points</strong>
          </div>
        </div>
      </section>

      <RulesSection eyebrow="Overview" heading="How to play">
        <div className="rules-text-grid">
          <p>
            Each of you runs a small food stall in a busy night market. You get
            resources, make dishes, trade with each other, and try to serve the
            customers before someone else does.
          </p>
          <p>
            Keep the game social. Move around, make deals, and use the visible
            customer stacks as your shared race track.
          </p>
        </div>
      </RulesSection>

      <RulesSection eyebrow="Setup" heading="Get ready to play">
        <ol className="rules-steps">
          <li>Give each player 5 random resources.</li>
          <li>Give each player a sheet with bonus tasks.</li>
          <li>
            Put the rest of the resources, dishes, and coins in their supply
            piles.
          </li>
          <li>Shuffle the customer deck and reveal 4 customer stacks.</li>
          <li>Put the market where everyone can reach it.</li>
          <li>
            If you want a shorter or easier first game, keep the same setup and
            just stop when time is up.
          </li>
        </ol>
      </RulesSection>

      <RulesSection eyebrow="Actions" heading="What you can do">
        <div className="rules-flow">
          <article>
            <h3>Exchange resources for dishes</h3>
            <p>
              Spend the listed resources to take that dish. The spent resources
              go back to the supply.
            </p>
          </article>
          <article>
            <h3>Exchange dishes for customers</h3>
            <p>
              Spend the dishes a customer asks for. The dishes go back to the
              supply, and you take coins from the supply based on that
              customer&apos;s reward.
            </p>
          </article>
          <article>
            <h3>Exchange coins for resources</h3>
            <p>
              You may buy resources from the supply at 1 coin for 1 resource if
              you need to keep moving.
            </p>
          </article>
          <article>
            <h3>Trade with other players</h3>
            <p>
              Trade resources, coins, and dishes in any way you want. Do not
              trade customers.
            </p>
          </article>
          <article>
            <h3>Complete bonus tasks</h3>
            <p>
              Cross off a task by getting a signature from the person you
              completed it with, then take 3 resources of your choice from the
              supply. Each task can only be completed once.
            </p>
          </article>
        </div>
      </RulesSection>

      <RulesSection
        eyebrow="Scoring"
        heading="How the game ends and how points are counted"
        testId="rules-scoring"
      >
        <div className="rules-scorebox">
          <ol className="rules-steps rules-steps--tight">
            <li>Coins earned during play are 1 point each.</li>
            <li>
              Each unspent dish is worth points equal to its printed resource
              cost.
            </li>
            <li>Every 2 leftover resources score 1 point, rounded down.</li>
            <li>
              Add any endgame bonus points printed on served customer cards.
            </li>
          </ol>
          <p>
            The game ends at 60 minutes or when 3 of the 4 customer stacks are
            gone. Tiebreakers, in order: most served customers, then most
            leftover dishes, then most leftover resources.
          </p>
        </div>
      </RulesSection>

      <RulesSection
        eyebrow="Card anatomy"
        heading="What the sample cards are showing"
        testId="rules-anatomy"
      >
        <div className="rules-anatomy-grid">
          <SampleCardAnatomy
            kind="dish"
            title="Sample dish card"
            card={
              <CardPreview kind="dish" item={featuredDish} cornerRadius={0} />
            }
            items={[
              {
                title: 'Title',
                text: 'This is the dish name you are buying or trading for.',
              },
              {
                title: 'Artwork',
                text: 'The picture helps you spot the dish quickly in the market.',
              },
              {
                title: 'Type icons',
                text: 'These show what kind of customer can be served by this dish.',
              },
              {
                title: 'Cost',
                text: 'These are the resources you spend to get the dish.',
              },
              {
                title: 'Card text',
                text: 'This is the short reminder text for the dish.',
              },
            ]}
          />

          <SampleCardAnatomy
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
            items={[
              {
                title: 'Title and tier',
                text: 'The name tells you who wants the food. The stars show how demanding they are.',
              },
              {
                title: 'Artwork',
                text: 'The portrait helps you read the customer at a glance.',
              },
              {
                title: 'Requirement row',
                text: 'This row shows what you must spend. For example: type + type, type / type, 1-2 type, or dish =/= dish means the customer wants different kinds of dishes or specific dish matches, not a customer trade.',
              },
              {
                title: 'Payout',
                text: 'This shows the coins you take from the supply when you serve the customer.',
              },
              {
                title: 'Endgame bonus',
                text: 'If a bonus is printed here, score it at the end after the customer has been served.',
              },
              {
                title: 'Card text',
                text: 'This is the plain-language reminder of what the customer wants.',
              },
            ]}
          />
        </div>
      </RulesSection>
    </div>
  );
}
