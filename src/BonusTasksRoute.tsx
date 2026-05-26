import type { GameConfig } from './content/loadGameConfig';
import { bonusTaskCells, bonusTaskSheetCellCount } from './bonusTasks';
import { PrintCropMarks } from './components/PrintCropMarks';

const A4_PAGE_WIDTH_MM = 210;
const A4_PAGE_HEIGHT_MM = 297;
const SHEETS_PER_PAGE = 3;
const PAGE_HORIZONTAL_PADDING_MM = 4;
const PAGE_VERTICAL_PADDING_MM = 6;
const SHEET_WIDTH_MM = A4_PAGE_WIDTH_MM - PAGE_HORIZONTAL_PADDING_MM * 2;
const SHEET_HEIGHT_MM =
  (A4_PAGE_HEIGHT_MM - PAGE_VERTICAL_PADDING_MM * 2) / SHEETS_PER_PAGE;
const CELL_COLUMNS = 3;
const CELL_ROWS = 3;

type BonusTasksRouteProps = {
  config: GameConfig;
};

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function buildPageCropRects(pageIndex: number) {
  return Array.from({ length: SHEETS_PER_PAGE }, (_, sheetIndex) => {
    const top = PAGE_VERTICAL_PADDING_MM + sheetIndex * SHEET_HEIGHT_MM;
    const bottom = top + SHEET_HEIGHT_MM;

    return {
      bottom,
      key: `page-${pageIndex}-sheet-${sheetIndex}`,
      left: PAGE_HORIZONTAL_PADDING_MM,
      right: PAGE_HORIZONTAL_PADDING_MM + SHEET_WIDTH_MM,
      top,
    };
  });
}

function getCellText(row: number, column: number) {
  return (
    bonusTaskCells.find((cell) => cell.row === row && cell.column === column)
      ?.text ?? ''
  );
}

function BonusTaskSheet({ index }: { index: number }) {
  return (
    <section className="bonus-task-sheet" data-testid="bonus-task-sheet">
      <table
        className="bonus-task-sheet__table"
        aria-label={`Bonus task sheet ${index + 1}`}
      >
        <tbody>
          {Array.from({ length: CELL_ROWS }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: CELL_COLUMNS }, (_, column) => (
                <td key={`${row}-${column}`}>{getCellText(row, column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function BonusTasksPage({
  pageIndex,
  sheetIndexes,
}: {
  pageIndex: number;
  sheetIndexes: number[];
}) {
  return (
    <article
      className="print-sheet bonus-task-page"
      data-testid="bonus-task-page"
    >
      <PrintCropMarks
        pageHeightMm={A4_PAGE_HEIGHT_MM}
        pageWidthMm={A4_PAGE_WIDTH_MM}
        rects={buildPageCropRects(pageIndex)}
      />
      <div className="bonus-task-page__stack">
        {sheetIndexes.map((sheetIndex) => (
          <BonusTaskSheet key={sheetIndex} index={sheetIndex} />
        ))}
      </div>
    </article>
  );
}

export function BonusTasksRoute({ config }: BonusTasksRouteProps) {
  const sheetIndexes = Array.from(
    { length: config.playerCount },
    (_, index) => index,
  );
  const pages = chunkItems(sheetIndexes, SHEETS_PER_PAGE);

  return (
    <div className="bonus-tasks-route">
      <section className="bonus-tasks-route__intro">
        <div className="section-heading">
          <p className="eyebrow">Printable bonus task sheets</p>
          <h1>Bonus task sheets</h1>
        </div>
        <p className="print-route__intro">
          Print one sheet per player. Each sheet has 9 centered prompts in a 3x3
          grid. The default game config prints one page for every 3 players.
        </p>
        <p className="print-route__intro">
          Tasks per sheet: {bonusTaskSheetCellCount}
        </p>
      </section>

      <section className="print-section">
        <div className="print-section__pages">
          {pages.map((pageSheetIndexes, pageIndex) => (
            <BonusTasksPage
              key={pageIndex}
              pageIndex={pageIndex}
              sheetIndexes={pageSheetIndexes}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
