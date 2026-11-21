/*
  Content + layout for the Life OS diagram. Pure data (no imports) so the Node
  test runner can check it — including that no private details leak into it.

  Coordinates are SVG units: desktop viewBox is DESKTOP, mobile is MOBILE.
*/

export const DESKTOP = { width: 1000, height: 760 };
export const MOBILE = { width: 400, height: 1660 };

type Rect = { x: number; y: number; w: number; h: number };

export type LifeOsNode = {
  id: string;
  kind: "group" | "box" | "pill" | "db" | "analog";
  label: string;
  sub?: string;
  lines?: string[]; // extra monospace lines (cron jobs, tables)
  labelAt?: "top" | "bottom"; // groups: where the caption sits (default top)
  description: string;
  desktop: Rect;
  mobile: Rect;
};

// Column / layer headings (x, y = text baseline).
export const LANES: {
  label: string;
  desktop: { x: number; y: number };
  mobile: { x: number; y: number };
}[] = [
  { label: "Inputs", desktop: { x: 40, y: 33 }, mobile: { x: 20, y: 20 } },
  { label: "Backend", desktop: { x: 20, y: 113 }, mobile: { x: 10, y: 120 } },
  { label: "Database", desktop: { x: 450, y: 80 }, mobile: { x: 10, y: 562 } },
  { label: "Interfaces", desktop: { x: 740, y: 80 }, mobile: { x: 50, y: 1000 } },
  { label: "Rituals", desktop: { x: 20, y: 515 }, mobile: { x: 10, y: 1335 } },
];

export type LifeOsEdge = {
  from: string;
  to: string;
  dashed?: boolean; // drawn by hand, not automated
  twoWay?: boolean; // reads and writes
  desktop: string; // SVG path
  mobile: string;
};

export const INTRO =
  "My life runs on a small, slightly over-engineered system. Notion is the database. A personal AI agent and an automation server, both on a DigitalOcean droplet, write to it — and a weekly → quarterly → yearly review system reads from it.";

export const NODES: LifeOsNode[] = [
  {
    id: "telegram",
    kind: "pill",
    label: "Chat",
    sub: "Telegram",
    description:
      "How I talk to my AI agent. I message it like I'd message a person — “spent 18 on lunch” or “what's on Thursday?”.",
    desktop: { x: 40, y: 45, w: 160, h: 55 },
    mobile: { x: 20, y: 30, w: 170, h: 60 },
  },
  {
    id: "calendar",
    kind: "pill",
    label: "Calendar",
    sub: "Google Calendar",
    description:
      "My schedule. My AI agent reads and adds events whenever I ask it to.",
    desktop: { x: 220, y: 45, w: 170, h: 55 },
    mobile: { x: 210, y: 30, w: 170, h: 60 },
  },
  {
    id: "droplet",
    kind: "group",
    label: "DigitalOcean",
    labelAt: "bottom",
    description:
      "An always-on server that runs my AI agent and automation server, so they keep working while I sleep.",
    desktop: { x: 20, y: 120, w: 370, h: 345 },
    mobile: { x: 10, y: 130, w: 380, h: 380 },
  },
  {
    id: "hermes",
    kind: "box",
    label: "Personal AI agent",
    sub: "Hermes",
    description:
      "Reads my Telegram messages and acts on them: logs expenses, keeps my budget up to date, manages my calendar, and reads or writes anything else in Notion.",
    desktop: { x: 45, y: 165, w: 320, h: 80 },
    mobile: { x: 30, y: 175, w: 315, h: 80 },
  },
  {
    id: "server",
    kind: "box",
    label: "Automation server",
    sub: "Node.js",
    lines: [
      "weekdays → time trackers",
      "saturdays → weekly review page",
      "1st → subs, insurance, allowances, tax",
      "1st → sync finances sheet",
    ],
    description:
      "Runs scheduled jobs against my database: creates time-tracker pages every weekday, sets up the weekly review every Saturday, and on the 1st books recurring expenses and syncs the month into my finances.",
    desktop: { x: 45, y: 270, w: 320, h: 160 },
    mobile: { x: 30, y: 280, w: 315, h: 190 },
  },
  {
    id: "notion",
    kind: "db",
    label: "Database",
    sub: "Notion",
    lines: [
      "expenses",
      "subscriptions",
      "insurance",
      "allowances",
      "taxes",
      "time_tracker",
      "actions",
      "weekly_reviews",
      "goals",
      "side_quests",
      "travel",
      "trip_stops",
    ],
    description:
      "Holds every part of my life as a table — money, time, goals and trips. Everything else in the system reads from it or writes to it.",
    desktop: { x: 450, y: 90, w: 220, h: 400 },
    mobile: { x: 60, y: 570, w: 280, h: 400 },
  },
  {
    id: "sheet",
    kind: "box",
    label: "Finances",
    sub: "Google Sheets",
    description:
      "Tracks my long-term finances. On the 1st of every month it receives last month's expenses, totalled by category.",
    desktop: { x: 740, y: 110, w: 240, h: 80 },
    mobile: { x: 50, y: 1010, w: 300, h: 70 },
  },
  {
    id: "dashboard",
    kind: "box",
    label: "Todo dashboard",
    sub: "Notion",
    description:
      "Shows my day at a glance: today's and tomorrow's actions, active projects, side quests, the time tracker and my calendar.",
    desktop: { x: 740, y: 230, w: 240, h: 80 },
    mobile: { x: 50, y: 1100, w: 300, h: 70 },
  },
  {
    id: "vercel",
    kind: "group",
    label: "Vercel",
    labelAt: "bottom",
    description:
      "Hosts this website. It rebuilds from my database once a day.",
    desktop: { x: 740, y: 330, w: 240, h: 135 },
    mobile: { x: 50, y: 1190, w: 300, h: 115 },
  },
  {
    id: "website",
    kind: "box",
    label: "Personal website",
    sub: "Next.js",
    description:
      "This site, seantanyurong.com. The Places map and Sidequests are read from my database, so updating my life updates the site.",
    desktop: { x: 760, y: 350, w: 200, h: 80 },
    mobile: { x: 70, y: 1210, w: 260, h: 60 },
  },
  {
    id: "reviews",
    kind: "group",
    label: "Review system",
    description:
      "Closes the loop. Every week, quarter and year I look at what the database says I actually did, and decide what's next.",
    desktop: { x: 20, y: 525, w: 960, h: 135 },
    mobile: { x: 10, y: 1345, w: 380, h: 205 },
  },
  {
    id: "weekly",
    kind: "box",
    label: "Weekly review",
    sub: "Notion",
    description:
      "Every Saturday a review page is waiting with my hours already tallied. I fill in wins, goal progress and a reflection.",
    desktop: { x: 40, y: 570, w: 240, h: 70 },
    mobile: { x: 25, y: 1385, w: 165, h: 64 },
  },
  {
    id: "quarterly",
    kind: "box",
    label: "Quarterly review",
    sub: "Notion",
    description:
      "Every 12 weeks I check whether I finished my side quest, what worked, and what changes next quarter.",
    desktop: { x: 380, y: 570, w: 240, h: 70 },
    mobile: { x: 210, y: 1385, w: 165, h: 64 },
  },
  {
    id: "yearly",
    kind: "box",
    label: "Yearly & life goals",
    sub: "Notion",
    description:
      "Once a year I review and reset the goals every quarter rolls up to, measured against my life goals.",
    desktop: { x: 720, y: 570, w: 240, h: 70 },
    mobile: { x: 210, y: 1470, w: 165, h: 64 },
  },
  {
    id: "album",
    kind: "analog",
    label: "Photo album",
    sub: "Printed",
    description:
      "The one offline part. Every quarter I print the best photos into a physical album, so the year is something I can hold.",
    desktop: { x: 400, y: 680, w: 200, h: 60 },
    mobile: { x: 20, y: 1575, w: 170, h: 64 },
  },
  {
    id: "photos",
    kind: "box",
    label: "Photo storage",
    sub: "Google Photos",
    description:
      "Stores every photo I take. At each quarterly review I pick the ones worth printing.",
    desktop: { x: 150, y: 680, w: 200, h: 60 },
    mobile: { x: 215, y: 1575, w: 170, h: 64 },
  },
];

export const EDGES: LifeOsEdge[] = [
  { from: "calendar", to: "hermes", twoWay: true, desktop: "M305 100 L305 165", mobile: "M295 90 L295 175" },
  { from: "telegram", to: "hermes", desktop: "M120 100 L120 165", mobile: "M105 90 L105 175" },
  { from: "hermes", to: "notion", desktop: "M365 205 L450 205", mobile: "M345 215 L375 215 L375 550 L300 550 L300 572" },
  { from: "server", to: "notion", desktop: "M365 350 L450 350", mobile: "M120 470 L120 572" },
  { from: "notion", to: "sheet", desktop: "M670 150 L740 150", mobile: "M60 950 L30 950 L30 1045 L50 1045" },
  { from: "notion", to: "dashboard", desktop: "M670 270 L740 270", mobile: "M60 950 L30 950 L30 1135 L50 1135" },
  { from: "notion", to: "website", desktop: "M670 390 L760 390", mobile: "M60 950 L30 950 L30 1240 L70 1240" },
  { from: "notion", to: "reviews", desktop: "M560 490 L560 525", mobile: "M340 950 L372 950 L372 1345" },
  { from: "weekly", to: "quarterly", desktop: "M280 605 L380 605", mobile: "M190 1417 L210 1417" },
  { from: "quarterly", to: "yearly", desktop: "M620 605 L720 605", mobile: "M292 1449 L292 1470" },
  { from: "quarterly", to: "album", dashed: true, desktop: "M500 640 L500 680", mobile: "M230 1449 L230 1459 L105 1459 L105 1575" },
  { from: "photos", to: "album", dashed: true, desktop: "M350 710 L400 710", mobile: "M215 1607 L190 1607" },
];
