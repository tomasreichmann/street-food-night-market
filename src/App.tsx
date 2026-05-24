import { CardPreview } from './components/CardPreview';
import { CardMockups } from './components/CardMockups';
import { CardPlanningTable } from './components/CardPlanningTable';
import { loadDefaultGameConfig } from './content/loadGameConfig';
import { loadCardContent } from './content/loadContent';
import { PrintRoute } from './PrintRoute';
import { SimulationRoute } from './SimulationRoute';

function getContentState() {
  try {
    const content = loadCardContent();
    const config = loadDefaultGameConfig(content);

    return { content, config, error: null as Error | null };
  } catch (error) {
    return {
      content: null,
      config: null,
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
      <a href="/simulation">Simulation</a>
      <a href="/print">Print</a>
    </nav>
  );
}

function HomeRoute({
  content,
}: {
  content: NonNullable<typeof contentState.content>;
}) {
  const { resources, dishes, customers } = content;
  const featuredDish = dishes[0];
  const featuredCustomer = customers[0];

  return (
    <>
      <section className="hero">
        <div className="hero__intro">
          <p className="eyebrow">Printable party game scaffold</p>
          <h1>Street Food Night Market</h1>
          <p className="hero-copy">
            Declarative card content, validated at load time, ready for a future
            print compositor.
          </p>
        </div>

        <dl className="stats">
          <div>
            <dt>Resources</dt>
            <dd>{resources.length}</dd>
          </div>
          <div>
            <dt>Dishes</dt>
            <dd>{dishes.length}</dd>
          </div>
          <div>
            <dt>Customers</dt>
            <dd>{customers.length}</dd>
          </div>
        </dl>
      </section>

      <CardMockups
        dish={featuredDish!}
        customer={featuredCustomer!}
        dishes={dishes}
      />

      <section className="content-section" aria-labelledby="resources-heading">
        <div className="section-heading">
          <p className="eyebrow">Resource set</p>
          <h2 id="resources-heading">Core ingredients and symbols</h2>
        </div>
        <div className="resource-ribbon">
          {resources.map((resource) => (
            <CardPreview key={resource.id} kind="resource" item={resource} />
          ))}
        </div>
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

      <CardPlanningTable content={content} />
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
  const isSimulationRoute = window.location.pathname === '/simulation';

  return (
    <main className="app-shell">
      <AppNav />
      {isPrintRoute ? (
        <PrintRoute content={contentState.content} />
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
