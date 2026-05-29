export const CARDS_PER_PAGE = 9;
export const PRINT_PAGE_WIDTH_MM = 210;
export const PRINT_PAGE_HEIGHT_MM = 297;
export const PRINT_CARD_WIDTH_MM = 60;
export const PRINT_CARD_HEIGHT_MM = 92;
export const PRINT_GRID_COLUMNS = 3;
export const PRINT_GRID_ROWS = 3;
export const PRINT_GRID_LEFT_MM =
  (PRINT_PAGE_WIDTH_MM - PRINT_GRID_COLUMNS * PRINT_CARD_WIDTH_MM) / 2;
export const PRINT_GRID_TOP_MM =
  (PRINT_PAGE_HEIGHT_MM - PRINT_GRID_ROWS * PRINT_CARD_HEIGHT_MM) / 2;
export const PRINT_GRID_WIDTH_MM = PRINT_GRID_COLUMNS * PRINT_CARD_WIDTH_MM;
export const PRINT_GRID_HEIGHT_MM = PRINT_GRID_ROWS * PRINT_CARD_HEIGHT_MM;
export const PRINT_CARD_TRIM_INSET_MM = 3;
export const PRINT_CARD_TRIM_WIDTH_MM =
  PRINT_CARD_WIDTH_MM - PRINT_CARD_TRIM_INSET_MM * 2;
export const PRINT_CARD_TRIM_HEIGHT_MM =
  PRINT_CARD_HEIGHT_MM - PRINT_CARD_TRIM_INSET_MM * 2;
export const PRINT_CARD_CORNER_RADIUS_MM = 0;

export function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
