# Life OS section — design

## Intent
Show how Sean runs his life as a system, centred on one diagram: Notion as the
database, a droplet running Hermes + seantanyurong_server writing to it, outputs
(FIRE planner sheet, this website), the weekly → quarterly → yearly review loop,
and the analog photo album as the one offline part.

## Decisions (from conversation)
- Homepage section `#life-os` after Places, collapsible like the others, nav item
  "Life OS". (Considered a separate /life-os page; Sean prefers a section.)
- Notion drawn as a database (cylinder + snake_case table list).
- Droplet is its own box containing `hermes` (off-the-shelf agent, Telegram ↔
  Notion) and `seantanyurong_server` (node-cron jobs: weekday time trackers,
  Saturday weekly review page, 1st-of-month bookings of subscriptions /
  insurance / allowances / taxes, 1st-of-month 00:30 Google Sheet sync).
- Review chain weekly → quarterly (12W) → yearly/life goals; analog album hangs
  off quarterly, drawn dashed/warm ("by hand").
- Hover/focus/tap a node to read what it does in a panel under the diagram.
- Animated flow on arrows; static with prefers-reduced-motion. Separate vertical
  layout on phones.

## Approaches
Hand-built SVG component (chosen) — matches the site and the map, supports hover
and animation, no dependency. Mermaid — generic look, extra dependency. Static
image — no interactivity or theming.

## Privacy (anti-goals)
No amounts, sheet IDs, server addresses, personal pages (Girlfriend, Housing, Life
Milestones). A test scans the section's copy for long IDs and currency amounts.

## Left to the builder
Copy (in Sean's voice, he edits), exact layout, accent colour (lime).
