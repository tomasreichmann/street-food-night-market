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
const PRINT_CARD_TRIM_INSET_MM = 3;
const PRINT_CARD_TRIM_WIDTH_MM = PRINT_CARD_WIDTH_MM - PRINT_CARD_TRIM_INSET_MM * 2;
const PRINT_CARD_TRIM_HEIGHT_MM =
  PRINT_CARD_HEIGHT_MM - PRINT_CARD_TRIM_INSET_MM * 2;
const PRINT_CROP_MARK_LENGTH_MM = 1;
const PRINT_CARD_CORNER_RADIUS_MM = 0;

type PrintableCard =
  | {
      kind: 'dish';
      item: DishCard;
    }
  | {
      kind: 'customer';
      item: CustomerCard;
    };

type PrintableCardInstance = PrintableCard & {
  instanceIndex: number;
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

function expandPrintableCards(content: GameContent): PrintableCardInstance[] {
  const cards: PrintableCardInstance[] = [];

  for (const item of content.dishes) {
    for (let instanceIndex = 0; instanceIndex < item.copies; instanceIndex += 1) {
      cards.push({
        kind: 'dish',
        item,
        instanceIndex,
      });
    }
  }

  for (const item of content.customers) {
    for (let instanceIndex = 0; instanceIndex < item.copies; instanceIndex += 1) {
      cards.push({
        kind: 'customer',
        item,
        instanceIndex,
      });
    }
  }

  return cards;
}

function renderCropMarksForRect(
  left: number,
  top: number,
  right: number,
  bottom: number,
  keyPrefix: string,
) {
  return (
    <g key={keyPrefix}>
      <line
        x1={left}
        y1={top - PRINT_CROP_MARK_LENGTH_MM}
        x2={left}
        y2={top}
      />
      <line x1={0} y1={top} x2={left} y2={top} />
      <line
        x1={right}
        y1={top - PRINT_CROP_MARK_LENGTH_MM}
        x2={right}
        y2={top}
      />
      <line x1={right} y1={top} x2={PRINT_PAGE_WIDTH_MM} y2={top} />
      <line
        x1={left}
        y1={bottom}
        x2={left}
        y2={bottom + PRINT_CROP_MARK_LENGTH_MM}
      />
      <line x1={0} y1={bottom} x2={left} y2={bottom} />
      <line
        x1={right}
        y1={bottom}
        x2={right}
        y2={bottom + PRINT_CROP_MARK_LENGTH_MM}
      />
      <line x1={right} y1={bottom} x2={PRINT_PAGE_WIDTH_MM} y2={bottom} />
    </g>
  );
}

function PrintSheetMarks() {
  const cropMarks = Array.from(
    { length: PRINT_GRID_ROWS * PRINT_GRID_COLUMNS },
    (_, index) => {
      const column = index % PRINT_GRID_COLUMNS;
      const row = Math.floor(index / PRINT_GRID_COLUMNS);
      const left =
        PRINT_GRID_LEFT_MM +
        column * PRINT_CARD_WIDTH_MM +
        PRINT_CARD_TRIM_INSET_MM;
      const top =
        PRINT_GRID_TOP_MM +
        row * PRINT_CARD_HEIGHT_MM +
        PRINT_CARD_TRIM_INSET_MM;
      const right = left + PRINT_CARD_TRIM_WIDTH_MM;
      const bottom = top + PRINT_CARD_TRIM_HEIGHT_MM;

      return renderCropMarksForRect(left, top, right, bottom, `${row}-${column}`);
    },
  );

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
        {cropMarks}
      </g>
    </svg>
  );
}

function PrintSheet({
  cards,
  dishes,
}: {
  cards: PrintableCardInstance[];
  dishes: DishCard[];
}) {
  return (
    <article className="print-sheet" data-testid="print-sheet">
      <PrintSheetMarks />
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
            <div
              key={`${card.kind}-${card.item.id}-${card.instanceIndex}`}
              className="print-sheet__slot"
            >
              {card.kind === 'dish' ? (
                <CardPreview
                  cornerRadius={PRINT_CARD_CORNER_RADIUS_MM}
                  kind="dish"
                  item={card.item}
                />
              ) : (
                <CardPreview
                  cornerRadius={PRINT_CARD_CORNER_RADIUS_MM}
                  kind="customer"
                  item={card.item}
                  dishes={dishes}
                />
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function PrintRoute({ content }: PrintRouteProps) {
  const cards = expandPrintableCards(content);
  const pages = chunkCards(cards, CARDS_PER_PAGE);

  return (
    <div className="print-route">
      {pages.map((pageCards, index) => (
        <PrintSheet key={index} cards={pageCards} dishes={content.dishes} />
      ))}
    </div>
  );
}
