# AGENTS.md

## Repo purpose

This repo is for designing and generating a printable party game called **Street Food Night Market**.

The game is a light, social, moving-around market game for roughly 15 to 20 players and 30 to 45 minutes. Players gather resources, trade, acquire dishes, serve guests, and earn coins.

## Current design decisions

- Theme: broad Asian cuisine
- Structure: Night Market + Festival hybrid
- Tone: light, social, party-friendly
- Players run nondescript food businesses and may name them
- Trading between players is encouraged and is part of the icebreaker value
- Guests are limited in a visible row so players race for them
- Hidden resources and hidden guests are allowed around the party area
- Social interaction tasks are handled through a bingo-style card
- No player powers for now
- Combo scoring is desired

## Economy decisions

- Coins are the main score and payment reward from guests
- Resources are physical tokens
- Dishes are normally spent when serving guests
- Tier 1 guests should pay roughly resource cost plus a small bonus
- Tier 2 guests should pay about double the total resource cost of required dishes
- Tier 3 guests should pay about triple, or grant scalable/endgame bonus value
- Resources should start with equal base value unless later testing proves otherwise

## Content system decisions

- Card definitions should be declarative
- Required copy counts should be explicit in data
- Card sizes should be variable and centrally configured
- Output should support page grouping by card size
- Browser print is the default export path
- Deterministic PDF export can be added later

## Art workflow decisions

- Card illustrations should use prompts stored alongside card definitions
- Icons may be generated as sheet illustrations on a solid background color
- Generated icon sheets can be background-removed and cut into individual icons
- SVG is not assumed as the primary art source

## Working rules

- Keep the implementation lightweight and iteration-friendly
- Favor content readability and print reliability over fancy architecture
- Preserve declarative data as the source of truth for cards
- Keep samples and docs aligned with real intended gameplay, not abstract placeholders
- Prefer exact sizing in print layouts and explicit page composition rules

## Expected future areas

- declarative schemas for dishes, guests, tasks, resources, and print sizes
- card preview components
- page composition logic for print sheets
- illustration/icon prompt management
- browser print and optional PDF export
