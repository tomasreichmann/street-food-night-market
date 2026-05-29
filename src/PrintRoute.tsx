import { CardPreview } from './components/CardPreview';
import { PrintCropMarks } from './components/PrintCropMarks';
import backfaceTemplate from './assets/backface.png';
import stallTemplate from './assets/stall.png';
import styles from './PrintRoute.module.css';
import { cx } from './utils/cx';
import {
  CARDS_PER_PAGE,
  PRINT_CARD_CORNER_RADIUS_MM,
  PRINT_CARD_HEIGHT_MM,
  PRINT_CARD_TRIM_HEIGHT_MM,
  PRINT_CARD_TRIM_INSET_MM,
  PRINT_CARD_TRIM_WIDTH_MM,
  PRINT_CARD_WIDTH_MM,
  PRINT_GRID_COLUMNS,
  PRINT_GRID_HEIGHT_MM,
  PRINT_GRID_LEFT_MM,
  PRINT_GRID_ROWS,
  PRINT_GRID_TOP_MM,
  PRINT_GRID_WIDTH_MM,
  PRINT_PAGE_HEIGHT_MM,
  PRINT_PAGE_WIDTH_MM,
  chunkItems,
} from './print/printSheetLayout';
import type { CustomerCard, DishCard, GameContent } from './content/schema';

const STALL_SHEET_COUNT = 2;

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

function expandPrintableCards(content: GameContent): PrintableCardInstance[] {
  const cards: PrintableCardInstance[] = [];

  for (const item of content.dishes) {
    for (
      let instanceIndex = 0;
      instanceIndex < item.copies;
      instanceIndex += 1
    ) {
      cards.push({
        kind: 'dish',
        item,
        instanceIndex,
      });
    }
  }

  for (const item of content.customers) {
    for (
      let instanceIndex = 0;
      instanceIndex < item.copies;
      instanceIndex += 1
    ) {
      cards.push({
        kind: 'customer',
        item,
        instanceIndex,
      });
    }
  }

  return cards;
}

function PrintSheetMarks() {
  return <PrintSheetMarksInner zIndex={0} />;
}

function PrintSheetMarksInner({ zIndex }: { zIndex: number }) {
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

      return {
        bottom,
        key: `${row}-${column}`,
        left,
        right,
        top,
      };
    },
  );

  return (
    <PrintCropMarks
      pageHeightMm={PRINT_PAGE_HEIGHT_MM}
      pageWidthMm={PRINT_PAGE_WIDTH_MM}
      rects={cropMarks}
      zIndex={zIndex}
    />
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
    <article className={styles.sheet} data-testid="print-sheet">
      <PrintSheetMarks />
      <div
        className={styles.grid}
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
            return <div key={index} className={styles.slot} />;
          }

          return (
            <div
              key={`${card.kind}-${card.item.id}-${card.instanceIndex}`}
              className={styles.slot}
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

function StallSheet({ index }: { index: number }) {
  return (
    <article className={styles.sheet} data-testid="stall-sheet">
      <PrintSheetMarks />
      <div
        className={styles.grid}
        style={{
          left: `${PRINT_GRID_LEFT_MM}mm`,
          top: `${PRINT_GRID_TOP_MM}mm`,
          width: `${PRINT_GRID_WIDTH_MM}mm`,
          height: `${PRINT_GRID_HEIGHT_MM}mm`,
          gridTemplateColumns: `repeat(${PRINT_GRID_COLUMNS}, ${PRINT_CARD_WIDTH_MM}mm)`,
          gridTemplateRows: `repeat(${PRINT_GRID_ROWS}, ${PRINT_CARD_HEIGHT_MM}mm)`,
        }}
      >
        {Array.from({ length: CARDS_PER_PAGE }, (_, cardIndex) => (
          <div
            key={`${index}-${cardIndex}`}
            className={cx(styles.slot, styles.stallSlot)}
          >
            <img
              className={styles.stallCard}
              src={stallTemplate}
              alt="Stall card template"
            />
          </div>
        ))}
      </div>
    </article>
  );
}

function BackfaceSheet({ index }: { index: number }) {
  return (
    <article className={styles.sheet} data-testid="backface-sheet">
      <PrintSheetMarksInner zIndex={0} />
      <div
        className={styles.grid}
        style={{
          left: `${PRINT_GRID_LEFT_MM}mm`,
          top: `${PRINT_GRID_TOP_MM}mm`,
          width: `${PRINT_GRID_WIDTH_MM}mm`,
          height: `${PRINT_GRID_HEIGHT_MM}mm`,
          gridTemplateColumns: `repeat(${PRINT_GRID_COLUMNS}, ${PRINT_CARD_WIDTH_MM}mm)`,
          gridTemplateRows: `repeat(${PRINT_GRID_ROWS}, ${PRINT_CARD_HEIGHT_MM}mm)`,
        }}
      >
        {Array.from({ length: CARDS_PER_PAGE }, (_, cardIndex) => (
          <div
            key={`${index}-${cardIndex}`}
            className={cx(styles.slot, styles.backfaceSlot)}
          >
            <img
              className={styles.backfaceCard}
              data-testid="backface-card"
              src={backfaceTemplate}
              alt=""
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </article>
  );
}

export function PrintRoute({ content }: PrintRouteProps) {
  const cards = expandPrintableCards(content);
  const pages = chunkItems(cards, CARDS_PER_PAGE);

  return (
    <div className={styles.route}>
      {pages.flatMap((pageCards, index) => [
        <PrintSheet
          key={`page-${index}`}
          cards={pageCards}
          dishes={content.dishes}
        />,
        <BackfaceSheet key={`backface-${index}`} index={index} />,
      ])}
      {Array.from({ length: STALL_SHEET_COUNT }, (_, index) => [
        <StallSheet key={`stall-${index}`} index={index} />,
        <BackfaceSheet
          key={`stall-backface-${index}`}
          index={pages.length + index}
        />,
      ]).flat()}
    </div>
  );
}
