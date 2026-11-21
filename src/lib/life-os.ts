/*
  Content + layout for the Life OS diagram. Pure data (no imports) so the Node
  test runner can check it — including that no private details leak into it.

  Coordinates are SVG units: desktop viewBox is DESKTOP, mobile is MOBILE.
*/

export const DESKTOP = { width: 1000, height: 730 };
export const MOBILE = { width: 400, height: 1390 };

type Rect = { x: number; y: number; w: number; h: number };

export type LifeOsNode = {
  id: string;
  kind: "group" | "box" | "pill" | "db" | "analog";
  label: string;
  sub?: string;
  lines?: string[]; // extra monospace lines (cron jobs, tables)
  description: string;
  desktop: Rect;
  mobile: Rect;
};

export type LifeOsEdge = {
  from: string;
  to: string;
  dashed?: boolean; // drawn by hand, not automated
  desktop: string; // SVG path
  mobile: string;
};

export const INTRO =
  "My life runs on a small, slightly over-engineered system. Notion is the database. A droplet running my personal assistant and my own cron server writes to it, and a weekly → quarterly → yearly review loop reads from it.";

export const NODES: LifeOsNode[] = [
  {
    id: "telegram",
    kind: "pill",
    label: "Telegram",
    sub: "me",
    description:
      "Where I talk to my agent. A quick “spent 18 on lunch” is all it takes to log an expense.",
    desktop: { x: 40, y: 20, w: 160, h: 40 },
    mobile: { x: 20, y: 10, w: 170, h: 40 },
  },
  {
    id: "droplet",
    kind: "group",
    label: "DigitalOcean droplet",
    description:
      "A small always-on server. It hosts the two things that write to my database for me.",
    desktop: { x: 20, y: 90, w: 370, h: 330 },
    mobile: { x: 10, y: 80, w: 380, h: 380 },
  },
  {
    id: "hermes",
    kind: "box",
    label: "hermes",
    sub: "personal AI agent · Telegram",
    description:
      "My personal assistant. I text it on Telegram like I would a person — it logs my expenses, keeps my budget up to date and reads or writes anything else in Notion for me.",
    desktop: { x: 45, y: 135, w: 320, h: 80 },
    mobile: { x: 30, y: 125, w: 315, h: 80 },
  },
  {
    id: "server",
    kind: "box",
    label: "seantanyurong_server",
    sub: "node-cron",
    lines: [
      "weekdays → time trackers",
      "saturdays → weekly review page",
      "1st → subs, insurance, allowances, tax",
      "1st → sync planner sheet",
    ],
    description:
      "My own Node server running cron jobs: it creates each weekday's time-tracker pages, sets up Saturday's weekly review, books recurring expenses on the 1st, then syncs the month into my planner.",
    desktop: { x: 45, y: 240, w: 320, h: 160 },
    mobile: { x: 30, y: 230, w: 315, h: 190 },
  },
  {
    id: "notion",
    kind: "db",
    label: "Notion",
    sub: "the database",
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
      "The database. Every part of my life is a table here — money, time, goals, trips. Everything else in the system reads from it or writes to it.",
    desktop: { x: 450, y: 60, w: 220, h: 400 },
    mobile: { x: 60, y: 520, w: 280, h: 400 },
  },
  {
    id: "sheet",
    kind: "box",
    label: "FIRE planner",
    sub: "Google Sheets · monthly",
    description:
      "My long-term financial planner. On the 1st of every month the server totals last month's expenses by category and writes them into the sheet.",
    desktop: { x: 740, y: 110, w: 240, h: 80 },
    mobile: { x: 10, y: 960, w: 170, h: 80 },
  },
  {
    id: "website",
    kind: "box",
    label: "seantanyurong.com",
    sub: "this site · daily",
    description:
      "You're looking at it. The Places map and Sidequests read straight from the same database, refreshed daily.",
    desktop: { x: 740, y: 300, w: 240, h: 80 },
    mobile: { x: 220, y: 960, w: 170, h: 80 },
  },
  {
    id: "reviews",
    kind: "group",
    label: "Review system",
    description:
      "How I close the loop. Every week, quarter and year I step back, look at what the database says I actually did, and decide what's next.",
    desktop: { x: 20, y: 495, w: 960, h: 135 },
    mobile: { x: 10, y: 1085, w: 380, h: 205 },
  },
  {
    id: "weekly",
    kind: "box",
    label: "Weekly review",
    sub: "every Saturday",
    description:
      "Every Saturday a review page is already waiting, with my hours per project tallied from the time tracker. I fill in wins, goal progress and a reflection.",
    desktop: { x: 40, y: 540, w: 240, h: 70 },
    mobile: { x: 25, y: 1125, w: 165, h: 64 },
  },
  {
    id: "quarterly",
    kind: "box",
    label: "Quarterly review",
    sub: "every 12 weeks",
    description:
      "Every 12 weeks: did I finish the side quest? What worked, what changes next quarter?",
    desktop: { x: 380, y: 540, w: 240, h: 70 },
    mobile: { x: 210, y: 1125, w: 165, h: 64 },
  },
  {
    id: "yearly",
    kind: "box",
    label: "Yearly & life goals",
    sub: "where it all rolls up",
    description:
      "The one-year and life goals that every quarter rolls up to.",
    desktop: { x: 720, y: 540, w: 240, h: 70 },
    mobile: { x: 210, y: 1210, w: 165, h: 64 },
  },
  {
    id: "album",
    kind: "analog",
    label: "Photo album",
    sub: "analog · by hand",
    description:
      "The one offline part. Each quarter I pick the best photos from Google Photos and print them into a physical album — so the year is something I can hold, not just rows in a database.",
    desktop: { x: 400, y: 650, w: 200, h: 60 },
    mobile: { x: 20, y: 1315, w: 170, h: 64 },
  },
  {
    id: "photos",
    kind: "box",
    label: "Google Photos",
    sub: "where photos live",
    description:
      "Where every photo I take ends up. At each quarterly review I go through the quarter here and pick the ones worth printing.",
    desktop: { x: 150, y: 650, w: 200, h: 60 },
    mobile: { x: 215, y: 1315, w: 170, h: 64 },
  },
];

export const EDGES: LifeOsEdge[] = [
  { from: "telegram", to: "hermes", desktop: "M120 60 L120 135", mobile: "M105 50 L105 125" },
  { from: "hermes", to: "notion", desktop: "M365 175 L450 175", mobile: "M345 165 C374 165 374 480 300 522" },
  { from: "server", to: "notion", desktop: "M365 320 L450 320", mobile: "M187 420 L187 520" },
  { from: "notion", to: "sheet", desktop: "M670 150 L740 150", mobile: "M140 920 L100 960" },
  { from: "notion", to: "website", desktop: "M670 340 L740 340", mobile: "M260 920 L300 960" },
  { from: "notion", to: "reviews", desktop: "M560 460 L560 495", mobile: "M200 920 L200 1085" },
  { from: "weekly", to: "quarterly", desktop: "M280 575 L380 575", mobile: "M190 1157 L210 1157" },
  { from: "quarterly", to: "yearly", desktop: "M620 575 L720 575", mobile: "M292 1189 L292 1210" },
  { from: "quarterly", to: "album", dashed: true, desktop: "M500 610 L500 650", mobile: "M230 1189 L230 1199 L105 1199 L105 1315" },
  { from: "photos", to: "album", dashed: true, desktop: "M350 680 L400 680", mobile: "M215 1347 L190 1347" },
];

export const LOOPS = [
  {
    title: "The money loop",
    body: "Telegram → Hermes → expenses. On the 1st, the server books subscriptions, insurance, allowances and tax, then syncs the month into my FIRE planner. I never open a spreadsheet to log anything.",
  },
  {
    title: "The review loop",
    body: "Daily time tracking feeds a weekly review that's ready before I am. Weeks roll into 12-week quarters, quarters into yearly goals — and each quarter ends with picking photos from Google Photos and printing them for the album.",
  },
  {
    title: "This site is part of it",
    body: "The map of places I've been and the sidequest list above aren't written here — they're read from the same database, so updating my life updates the site.",
  },
];
