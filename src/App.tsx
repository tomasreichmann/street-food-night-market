import { CardPreview } from './components/CardPreview';
import { summarizeCardContent } from './content/contentSummary';
import { loadDefaultGameConfig } from './content/loadGameConfig';
import { loadCardContent } from './content/loadContent';
import { BonusTasksRoute } from './BonusTasksRoute';
import { PlanningRoute } from './PlanningRoute';
import { RulesPrintRoute } from './RulesPrintRoute';
import { RulesRoute } from './RulesRoute';
import { PrintRoute } from './PrintRoute';
import { SimulationRoute } from './SimulationRoute';

function getContentState() {
  try {
    const content = loadCardContent();
    const config = loadDefaultGameConfig(content);
    const summary = summarizeCardContent(content);

    return { content, config, summary, error: null as Error | null };
  } catch (error) {
    return {
      content: null,
      config: null,
      summary: null,
      error:
        error instanceof Error
          ? error
          : new Error('Unknown content load failure'),
    };
  }
}

const contentState = getContentState();

function AppNav() {
  return (
    <nav className="app-nav" aria-label="Primary navigation">
      <a href="/">Home</a>
      <a href="/rules">Rules</a>
      <a href="/simulation">Simulation</a>
      <a href="/bonus-tasks">Bonus Tasks</a>
      <a href="/planning">Planning</a>
      <a href="/print">Print</a>
      <a href="/rules-print">Rules Print</a>
    </nav>
  );
}

function HomeRoute({
  content,
}: {
  content: NonNullable<typeof contentState.content>;
}) {
  const summary = contentState.summary;
  const { dishes, customers } = content;

  return (
    <>
      <section className="hero">
        <div className="hero__intro">
          <p className="eyebrow">Printable party game</p>
          <h1>Street Food Night Market</h1>
          <p className="hero-copy">
            A social night market game about trading ingredients, cooking
            dishes, and racing to serve the most tempting customers.
          </p>
        </div>

        <dl className="stats">
          <div>
            <dt>Dish cards</dt>
            <dd>{summary?.totals.dishCopies ?? 0}</dd>
          </div>
          <div>
            <dt>Customer cards</dt>
            <dd>{summary?.totals.customerCopies ?? 0}</dd>
          </div>
          <div>
            <dt>Total cards</dt>
            <dd>{summary?.totals.totalCardCopies ?? 0}</dd>
          </div>
        </dl>
      </section>

      <section className="content-section" aria-labelledby="dishes-heading">
        <div className="section-heading">
          <p className="eyebrow">Dish cards</p>
          <h2 id="dishes-heading">Cooked offerings</h2>
        </div>
        <div className="card-grid">
          {dishes.map((dish) => (
            <CardPreview key={dish.id} kind="dish" item={dish} />
          ))}
        </div>
      </section>

      <section className="content-section" aria-labelledby="customers-heading">
        <div className="section-heading">
          <p className="eyebrow">Customer cards</p>
          <h2 id="customers-heading">Visible demand on the market floor</h2>
        </div>
        <div className="card-grid card-grid--customer">
          {customers.map((customer) => (
            <CardPreview
              key={customer.id}
              kind="customer"
              item={customer}
              dishes={dishes}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default function App() {
  if (contentState.error || !contentState.content || !contentState.config) {
    return (
      <main className="app-shell">
        <section className="hero hero--error">
          <p className="eyebrow">Content load error</p>
          <h1>Street Food Night Market</h1>
          <p className="hero-copy">
            The card content could not be parsed. Fix the YAML and reload the
            app.
          </p>
          <pre className="error-block">
            {contentState.error?.message ?? 'Unknown error'}
          </pre>
        </section>
      </main>
    );
  }

  const isPrintRoute = window.location.pathname === '/print';
  const isRulesRoute = window.location.pathname === '/rules';
  const isRulesPrintRoute = window.location.pathname === '/rules-print';
  const isSimulationRoute = window.location.pathname === '/simulation';
  const isBonusTasksRoute = window.location.pathname === '/bonus-tasks';
  const isPlanningRoute = window.location.pathname === '/planning';

  return (
    <main className="app-shell">
      <AppNav />
      {isRulesPrintRoute ? (
        <RulesPrintRoute content={contentState.content} />
      ) : isRulesRoute ? (
        <RulesRoute content={contentState.content} />
      ) : isPlanningRoute ? (
        <PlanningRoute content={contentState.content} />
      ) : isPrintRoute ? (
        <PrintRoute content={contentState.content} />
      ) : isBonusTasksRoute ? (
        <BonusTasksRoute config={contentState.config} />
      ) : isSimulationRoute ? (
        <SimulationRoute
          content={contentState.content}
          initialConfig={contentState.config}
        />
      ) : (
        <HomeRoute content={contentState.content} />
      )}
    </main>
  );
}
