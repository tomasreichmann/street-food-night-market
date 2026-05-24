import { CardPreview } from './components/CardPreview';
import type { CustomerCard, DishCard, GameContent } from './content/schema';

const CARDS_PER_PAGE = 9;
const PRINT_PAGE_WIDTH_MM = 210;
const PRINT_PAGE_HEIGHT_MM = 297;
const PRINT_CARD_WIDTH_MM = 69;
const PRINT_CARD_HEIGHT_MM = 94;
const PRINT_GRID_COLUMNS = 3;
const PRINT_GRID_ROWS = 3;
const PRINT_GRID_LEFT_MM =
  (PRINT_PAGE_WIDTH_MM - PRINT_GRID_COLUMNS * PRINT_CARD_WIDTH_MM) / 2;
const PRINT_GRID_TOP_MM =
  (PRINT_PAGE_HEIGHT_MM - PRINT_GRID_ROWS * PRINT_CARD_HEIGHT_MM) / 2;
const PRINT_GRID_WIDTH_MM = PRINT_GRID_COLUMNS * PRINT_CARD_WIDTH_MM;
const PRINT_GRID_HEIGHT_MM = PRINT_GRID_ROWS * PRINT_CARD_HEIGHT_MM;

type PrintableCard =
  | {
      kind: 'dish';
      item: DishCard;
    }
  | {
      kind: 'customer';
      item: CustomerCard;
    };

type PrintRouteProps = {
  content: GameContent;
};

function chunkCards<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getPrintableCards(content: GameContent) {
  return {
    dishCards: content.dishes.map(
      (item): PrintableCard => ({ kind: 'dish', item }),
    ),
    customerCards: content.customers.map(
      (item): PrintableCard => ({ kind: 'customer', item }),
    ),
  };
}

function RegistrationAndCropMarks() {
  return (
    <svg
      className="print-sheet__marks"
      viewBox={`0 0 ${PRINT_PAGE_WIDTH_MM} ${PRINT_PAGE_HEIGHT_MM}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g
        className="print-sheet__crop-marks"
        fill="none"
        stroke="#1f1d1b"
        strokeWidth="0.4"
        vectorEffect="non-scaling-stroke"
      >
        <line
          x1={PRINT_GRID_LEFT_MM}
          y1={PRINT_GRID_TOP_MM - 5}
          x2={PRINT_GRID_LEFT_MM}
          y2={PRINT_GRID_TOP_MM}
        />
        <line
          x1={0}
          y1={PRINT_GRID_TOP_MM}
          x2={PRINT_GRID_LEFT_MM}
          y2={PRINT_GRID_TOP_MM}
        />
        <line
          x1={PRINT_PAGE_WIDTH_MM - PRINT_GRID_LEFT_MM}
          y1={PRINT_GRID_TOP_MM - 5}
          x2={PRINT_PAGE_WIDTH_MM - PRINT_GRID_LEFT_MM}
          y2={PRINT_GRID_TOP_MM}
        />
        <line
          x1={PRINT_PAGE_WIDTH_MM - PRINT_GRID_LEFT_MM}
          y1={PRINT_GRID_TOP_MM}
          x2={PRINT_PAGE_WIDTH_MM}
          y2={PRINT_GRID_TOP_MM}
        />
        <line
          x1={PRINT_GRID_LEFT_MM}
          y1={PRINT_PAGE_HEIGHT_MM - PRINT_GRID_TOP_MM}
          x2={PRINT_GRID_LEFT_MM}
          y2={PRINT_PAGE_HEIGHT_MM - PRINT_GRID_TOP_MM + 5}
        />
        <line
          x1={0}
          y1={PRINT_PAGE_HEIGHT_MM - PRINT_GRID_TOP_MM}
          x2={PRINT_GRID_LEFT_MM}
          y2={PRINT_PAGE_HEIGHT_MM - PRINT_GRID_TOP_MM}
        />
        <line
          x1={PRINT_PAGE_WIDTH_MM - PRINT_GRID_LEFT_MM}
          y1={PRINT_PAGE_HEIGHT_MM - PRINT_GRID_TOP_MM}
          x2={PRINT_PAGE_WIDTH_MM - PRINT_GRID_LEFT_MM}
          y2={PRINT_PAGE_HEIGHT_MM - PRINT_GRID_TOP_MM + 5}
        />
        <line
          x1={PRINT_PAGE_WIDTH_MM - PRINT_GRID_LEFT_MM}
          y1={PRINT_PAGE_HEIGHT_MM - PRINT_GRID_TOP_MM}
          x2={PRINT_PAGE_WIDTH_MM}
          y2={PRINT_PAGE_HEIGHT_MM - PRINT_GRID_TOP_MM}
        />
      </g>
      <g
        className="print-sheet__registration-marks"
        fill="none"
        stroke="#1f1d1b"
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
      >
        {[
          [7, 7],
          [PRINT_PAGE_WIDTH_MM - 7, 7],
          [7, PRINT_PAGE_HEIGHT_MM - 7],
          [PRINT_PAGE_WIDTH_MM - 7, PRINT_PAGE_HEIGHT_MM - 7],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <line x1={x - 2.5} y1={y} x2={x + 2.5} y2={y} />
            <line x1={x} y1={y - 2.5} x2={x} y2={y + 2.5} />
          </g>
        ))}
      </g>
    </svg>
  );
}

function PrintSheet({
  cards,
  dishes,
}: {
  cards: PrintableCard[];
  dishes: DishCard[];
}) {
  return (
    <article className="print-sheet" data-testid="print-sheet">
      <RegistrationAndCropMarks />
      <div
        className="print-sheet__grid"
        style={{
          left: `${PRINT_GRID_LEFT_MM}mm`,
          top: `${PRINT_GRID_TOP_MM}mm`,
          width: `${PRINT_GRID_WIDTH_MM}mm`,
          height: `${PRINT_GRID_HEIGHT_MM}mm`,
          gridTemplateColumns: `repeat(${PRINT_GRID_COLUMNS}, ${PRINT_CARD_WIDTH_MM}mm)`,
          gridTemplateRows: `repeat(${PRINT_GRID_ROWS}, ${PRINT_CARD_HEIGHT_MM}mm)`,
        }}
      >
        {Array.from({ length: CARDS_PER_PAGE }, (_, index) => {
          const card = cards[index];

          if (!card) {
            return <div key={index} className="print-sheet__slot" />;
          }

          return (
            <div key={`${card.kind}-${card.item.id}`} className="print-sheet__slot">
              {card.kind === 'dish' ? (
                <CardPreview kind="dish" item={card.item} />
              ) : (
                <CardPreview kind="customer" item={card.item} dishes={dishes} />
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function PrintSection({
  title,
  cards,
  dishes,
}: {
  title: string;
  cards: PrintableCard[];
  dishes: DishCard[];
}) {
  const pages = chunkCards(cards, CARDS_PER_PAGE);
  const headingId = `${slugify(title)}-heading`;

  return (
    <section className="print-section" aria-labelledby={headingId}>
      <div className="print-section__heading">
        <p className="eyebrow">Printable sheets</p>
        <h2 id={headingId}>{title}</h2>
        <p className="print-section__copy">
          One-sided cards are split into A4 pages with crop and registration
          marks.
        </p>
      </div>
      <div className="print-section__pages">
        {pages.map((pageCards, index) => (
          <PrintSheet
            key={`${title}-${index}`}
            cards={pageCards}
            dishes={dishes}
          />
        ))}
      </div>
    </section>
  );
}

export function PrintRoute({ content }: PrintRouteProps) {
  const { dishCards, customerCards } = getPrintableCards(content);

  return (
    <div className="print-route">
      <section className="print-route__intro" aria-labelledby="print-route-title">
        <p className="eyebrow">Print compositor</p>
        <h1 id="print-route-title">A4 card sheets</h1>
        <p className="hero-copy">
          Dish cards and customer cards are arranged separately for one-sided
          printing.
        </p>
      </section>

      <PrintSection title="Dish cards" cards={dishCards} dishes={content.dishes} />
      <PrintSection
        title="Customer cards"
        cards={customerCards}
        dishes={content.dishes}
      />
    </div>
  );
}
