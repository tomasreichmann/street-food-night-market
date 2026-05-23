# Implementation Notes

## Recommended stack

- React
- TypeScript
- Vite
- declarative content files
- print-oriented CSS layout

## Why this stack

- fast iteration
- reusable card components
- easy browser preview
- easy print layout control
- good fit for declarative content plus export

## Data design goals

Each card should be definable in structured content with fields like:
- id
- type
- tier
- size
- title
- tags
- copy count
- cost
- payout
- rules text
- illustration prompt
- icon references

## Print design goals

- variable card sizes
- page grouping by card size
- explicit margins and gaps
- reliable browser print output
- later optional PDF generation

## Art pipeline notes

- icon generation may happen outside this device and outside this repo
- prompts should still live in repo content
- produced icons and illustrations can later be imported as generated assets
