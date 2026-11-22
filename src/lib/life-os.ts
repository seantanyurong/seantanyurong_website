/*
  Content + layout for the Life OS diagram. Pure data (no imports) so the Node
  test runner can check it — including that no private details leak into it.

  Coordinates are SVG units: desktop viewBox is DESKTOP, mobile is MOBILE.
*/

export const DESKTOP = { width: 1000, height: 730 };
export const MOBILE = { width: 400, height: 1500 };

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

export type LifeOsEdge = {
  from: string;
  to: string;
  dashed?: boolean; // drawn by hand, not automated
  twoWay?: boolean; // reads and writes
  desktop: string; // SVG path
  mobile: string;
};

export const INTRO =
  "My life runs on a small, slightly over-engineered system, and it's something I'm constantly tweaking. Fundamentally, everything was built around supporting my rituals — daily todos, weekly reviews, monthly financial recaps and quarterly side quest checks. Notion serves as my database, with an AI agent and a server to maintain it, and a variety of interfaces to engage with it, like spreadsheets and dashboards.";

export const NODES: LifeOsNode[] = [
  {
    id: "telegram",
    kind: "pill",
    label: "Chat",
    sub: "Telegram",
    description:
      "How I talk to my AI agent. I message it like I'd message a person — “spent 18 on lunch” or “what's on Thursday?”.",
    desktop: { x: 40, y: 15, w: 160, h: 55 },
    mobile: { x: 20, y: 5, w: 170, h: 60 },
  },
  {
    id: "calendar",
    kind: "pill",
    label: "Calendar",
    sub: "Google Calendar",
    description:
      "My schedule. My AI agent reads and adds events whenever I ask it to.",
    desktop: { x: 220, y: 15, w: 170, h: 55 },
    mobile: { x: 210, y: 5, w: 170, h: 60 },
  },
  {
    id: "droplet",
    kind: "group",
    label: "DigitalOcean",
    labelAt: "bottom",
    description:
      "An always-on server that runs my AI agent and automation server, so they keep working while I sleep.",
    desktop: { x: 20, y: 90, w: 370, h: 320 },
    mobile: { x: 10, y: 80, w: 380, h: 350 },
  },
  {
    id: "hermes",
    kind: "box",
    label: "Personal AI Agent",
    sub: "Hermes",
    description:
      "Reads my Telegram messages and acts on them: logs expenses, keeps my budget up to date, manages my calendar, and reads or writes anything else in Notion.",
    desktop: { x: 45, y: 135, w: 320, h: 80 },
    mobile: { x: 30, y: 125, w: 315, h: 80 },
  },
  {
    id: "server",
    kind: "box",
    label: "Automation Server",
    sub: "Node.js",
    lines: [
      "saturdays → weekly review page",
      "1st → subs, insurance, allowances, tax",
      "1st → sync finances sheet",
    ],
    description:
      "Runs scheduled jobs against my database: sets up the weekly review every Saturday, and on the 1st books recurring expenses and syncs the month into my finances.",
    desktop: { x: 45, y: 240, w: 320, h: 135 },
    mobile: { x: 30, y: 230, w: 315, h: 160 },
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
      "actions",
      "weekly_reviews",
      "quarterly_reviews",
      "goals",
      "side_quests",
      "travel",
      "trip_stops",
    ],
    description:
      "Holds every part of my life as a table — money, time, goals and trips. Everything else in the system reads from it or writes to it.",
    desktop: { x: 450, y: 60, w: 220, h: 400 },
    mobile: { x: 60, y: 490, w: 280, h: 400 },
  },
  {
    id: "vercel",
    kind: "group",
    label: "Vercel",
    labelAt: "bottom",
    description:
      "Hosts this website. It rebuilds from my database once a day.",
    desktop: { x: 740, y: 190, w: 240, h: 135 },
    mobile: { x: 50, y: 930, w: 300, h: 115 },
  },
  {
    id: "website",
    kind: "box",
    label: "Personal Website",
    sub: "Next.js",
    description:
      "This site, seantanyurong.com. The Places map and Sidequests are read from my database, so updating my life updates the site.",
    desktop: { x: 760, y: 210, w: 200, h: 80 },
    mobile: { x: 70, y: 950, w: 260, h: 60 },
  },
  {
    id: "rituals",
    kind: "group",
    label: "Rituals",
    description:
      "The point of everything above. Each ritual starts with the work already done, so I just show up and review.",
    desktop: { x: 20, y: 495, w: 960, h: 215 },
    mobile: { x: 10, y: 1085, w: 380, h: 394 },
  },
  {
    id: "daily",
    kind: "box",
    label: "Daily Todos",
    sub: "Notion dashboard",
    description:
      "Every morning I open one Notion page with today's and tomorrow's actions, active projects, side quests and my calendar, and work from that.",
    desktop: { x: 40, y: 540, w: 168, h: 70 },
    mobile: { x: 25, y: 1125, w: 165, h: 64 },
  },
  {
    id: "weekly",
    kind: "box",
    label: "Weekly Review",
    sub: "Notion",
    description:
      "Every Saturday a fresh review page is waiting for me. I fill in wins, goal progress and a reflection.",
    desktop: { x: 228, y: 540, w: 168, h: 70 },
    mobile: { x: 210, y: 1125, w: 165, h: 64 },
  },
  {
    id: "monthly",
    kind: "box",
    label: "Monthly Finances",
    sub: "Google Sheets",
    description:
      "On the 1st, last month's expenses are already booked and synced into my finance sheet, so I just review where the money went and adjust my budget.",
    desktop: { x: 416, y: 540, w: 168, h: 70 },
    mobile: { x: 210, y: 1215, w: 165, h: 64 },
  },
  {
    id: "quarterly",
    kind: "box",
    label: "Quarterly Review",
    sub: "Notion",
    description:
      "Every 12 weeks I check whether I finished my side quest, what worked, and what changes next quarter.",
    desktop: { x: 604, y: 540, w: 168, h: 70 },
    mobile: { x: 25, y: 1215, w: 165, h: 64 },
  },
  {
    id: "yearly",
    kind: "box",
    label: "Yearly Goals",
    sub: "Notion",
    description:
      "Once a year I review and reset the goals every quarter rolls up to, measured against my life goals.",
    desktop: { x: 792, y: 540, w: 168, h: 70 },
    mobile: { x: 210, y: 1305, w: 165, h: 64 },
  },
  {
    id: "travel",
    kind: "box",
    label: "Travel Planning System",
    sub: "Notion",
    description:
      "Every trip gets a page from my trip template — itinerary, to-dos, budget and research — and once I've been, it shows up on the Places map.",
    desktop: { x: 40, y: 630, w: 260, h: 60 },
    mobile: { x: 210, y: 1395, w: 165, h: 64 },
  },
  {
    id: "album",
    kind: "analog",
    label: "Photo Album",
    sub: "Printed",
    description:
      "The one offline part. Every quarter I print the best photos into a physical album, so the year is something I can hold.",
    desktop: { x: 604, y: 630, w: 168, h: 60 },
    mobile: { x: 25, y: 1305, w: 165, h: 64 },
  },
  {
    id: "photos",
    kind: "box",
    label: "Photo Storage",
    sub: "Google Photos",
    description:
      "Stores every photo I take. At each quarterly review I pick the ones worth printing.",
    desktop: { x: 792, y: 630, w: 168, h: 60 },
    mobile: { x: 25, y: 1395, w: 165, h: 64 },
  },
];

export const EDGES: LifeOsEdge[] = [
  { from: "calendar", to: "hermes", twoWay: true, desktop: "M305 70 L305 135", mobile: "M295 65 L295 125" },
  { from: "telegram", to: "hermes", desktop: "M120 70 L120 135", mobile: "M105 65 L105 125" },
  { from: "hermes", to: "notion", desktop: "M365 175 L450 175", mobile: "M345 165 L375 165 L375 470 L300 470 L300 492" },
  { from: "server", to: "notion", desktop: "M365 320 L450 320", mobile: "M120 390 L120 492" },
  { from: "notion", to: "website", desktop: "M670 250 L760 250", mobile: "M200 890 L200 950" },
  { from: "notion", to: "rituals", desktop: "M560 460 L560 495", mobile: "M340 870 L372 870 L372 1085" },
  { from: "daily", to: "weekly", desktop: "M208 575 L228 575", mobile: "M190 1157 L210 1157" },
  { from: "weekly", to: "monthly", desktop: "M396 575 L416 575", mobile: "M292 1189 L292 1215" },
  { from: "monthly", to: "quarterly", desktop: "M584 575 L604 575", mobile: "M210 1247 L190 1247" },
  { from: "quarterly", to: "yearly", desktop: "M772 575 L792 575", mobile: "M170 1279 L170 1292 L292 1292 L292 1305" },
  { from: "quarterly", to: "album", dashed: true, desktop: "M688 610 L688 630", mobile: "M107 1279 L107 1305" },
  { from: "photos", to: "album", dashed: true, desktop: "M792 660 L772 660", mobile: "M107 1395 L107 1369" },
];
