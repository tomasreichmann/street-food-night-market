# Design Decisions

## Game shape

Street Food Night Market is a lightweight party game where players:

- gather resources
- trade with each other
- convert resources into dishes
- serve visible customers for coins
- use social bingo tasks to earn more resources
- race for limited customer opportunities

## Intended session

- 15 to 20 players
- 30 to 45 minutes
- moving around the party space
- low rules overhead
- self-running as much as possible

## Resource model

Planned resources:

- Sea
- Greens/Grain
- Fuel/Wood
- Fungi/Umami
- Meat/Protein

The icon meaning can stay intentionally broad rather than hyper-literal.

## Card families

- Resource references / icon sheets
- Dish cards
- Customer cards
- Hidden customer cards
- Hidden resource or opportunity cards
- Bingo task cards or sheets
- Market rules card
- Customer crowd rules card

## Customer tier model

### Tier 1

Easy, low-complexity customers.

Economic rule:

- total payout should be about the total value of spent resources plus a small bonus

### Tier 2

Mid-tier customers with stronger dish requirements or combinations.

Economic rule:

- payout should be about double the total resource cost of required dishes

### Tier 3

Prestige customers.

Economic rule:

- payout should be about triple, or use scalable and endgame bonus structures

## Export strategy

Recommended primary export path:

- browser print layout grouped by card size

Possible later export path:

- deterministic PDF export

## Art strategy

- Store illustration prompts directly with card content
- Store icon-sheet prompts separately
- Use solid background colors for icon-sheet generation when helpful
- Run icon sheets through background removal and slicing as a separate pipeline
