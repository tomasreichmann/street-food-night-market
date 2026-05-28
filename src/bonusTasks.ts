export type BonusTaskCell = {
  column: number;
  row: number;
  text: string;
};

export const bonusTaskCells: BonusTaskCell[] = [
  { row: 0, column: 0, text: 'Find what asian language someone speaks' },
  { row: 0, column: 1, text: 'Find what asian dish can someone cook' },
  {
    row: 0,
    column: 2,
    text: 'Find what is a favourite sushi someone can make',
  },
  {
    row: 1,
    column: 0,
    text: 'Find what asian countries someone visited',
  },
  { row: 1, column: 1, text: 'Get a kiss from someone' },
  { row: 1, column: 2, text: 'Find what anime someone likes' },
  { row: 2, column: 0, text: 'Find what what asian weapon someone owns' },
  { row: 2, column: 1, text: 'Find what manga someone owns' },
  {
    row: 2,
    column: 2,
    text: 'Learn an interesting fact about asia from someone',
  },
];

export const bonusTaskSheetCellCount = 9;
