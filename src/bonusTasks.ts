export type BonusTaskCell = {
  column: number;
  row: number;
  text: string;
};

export const bonusTaskCells: BonusTaskCell[] = [
  { row: 0, column: 0, text: 'Find someone who speaks an asian language' },
  { row: 0, column: 1, text: 'Find someone who can cook a vietnamese dish' },
  { row: 0, column: 2, text: 'Find someone who can make sushi' },
  {
    row: 1,
    column: 0,
    text: 'Find someone who visited the most asian countries',
  },
  { row: 1, column: 1, text: 'Get a kiss from someone' },
  { row: 1, column: 2, text: 'Find someone who likes anime' },
  { row: 2, column: 0, text: 'Find someone who owns an asian weapon' },
  { row: 2, column: 1, text: 'Find someone who owns manga' },
  {
    row: 2,
    column: 2,
    text: 'Learn an interesting fact about asia from someone',
  },
];

export const bonusTaskSheetCellCount = 9;
