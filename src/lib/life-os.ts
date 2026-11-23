/*
  Content + layout for the Life OS diagram. Pure data (no imports) so the Node
  test runner can check it — including that no private details leak into it.

  Coordinates are SVG units: desktop viewBox is DESKTOP, mobile is MOBILE.
*/

export const DESKTOP = { width: 1000, height: 730 };
export const MOBILE = { width: 400, height: 1715 };

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
    desktop: { x: 700, y: 190, w: 280, h: 135 },
    mobile: { x: 50, y: 930, w: 300, h: 115 },
  },
  {
    id: "website",
    kind: "box",
    label: "Personal Website",
    sub: "Next.js",
    description:
      "This site, seantanyurong.com. The Places map and Sidequests are read from my database, so updating my life updates the site.",
    desktop: { x: 720, y: 210, w: 240, h: 80 },
    mobile: { x: 70, y: 950, w: 260, h: 60 },
  },
  {
    id: "todo",
    kind: "group",
    label: "Todo System",
    description:
      "How I keep track of what to do: every task goes into one list, and each morning I only look at what's due.",
    desktop: { x: 20, y: 495, w: 260, h: 215 },
    mobile: { x: 50, y: 1235, w: 300, h: 120 },
  },
  {
    id: "tasks",
    kind: "box",
    label: "Task List",
    sub: "Notion",
    description:
      "Every task lives in one Notion table with a due date, so nothing sits only in my head.",
    desktop: { x: 40, y: 540, w: 220, h: 62 },
    mobile: { x: 62, y: 1275, w: 130, h: 64 },
  },
  {
    id: "travel",
    kind: "group",
    label: "Travel System",
    description:
      "Every trip runs the same way: plan it from my template, go, then wrap it up with an album.",
    desktop: { x: 700, y: 345, w: 280, h: 130 },
    mobile: { x: 50, y: 1080, w: 300, h: 120 },
  },
  {
    id: "tripPlanner",
    kind: "box",
    label: "Trip Planner",
    sub: "Notion template",
    description:
      "Every trip starts as a page from my trip template, with the itinerary, to-dos, budget and research in one place. The places I stop at are logged there, and once I've been, they show up on the Places map.",
    desktop: { x: 715, y: 390, w: 115, h: 62 },
    mobile: { x: 62, y: 1120, w: 130, h: 64 },
  },
  {
    id: "tripAlbum",
    kind: "box",
    label: "Trip Album",
    sub: "Google Photos",
    description:
      "When I'm back, I gather the trip's photos into their own Google Photos album, so every trip has one place to relive it.",
    desktop: { x: 850, y: 390, w: 115, h: 62 },
    mobile: { x: 208, y: 1120, w: 130, h: 64 },
  },
  {
    id: "rituals",
    kind: "group",
    label: "Rituals",
    description:
      "The point of everything above. Each ritual starts with the work already done, so I just show up and review.",
    desktop: { x: 300, y: 495, w: 680, h: 215 },
    mobile: { x: 10, y: 1390, w: 380, h: 304 },
  },
  {
    id: "daily",
    kind: "box",
    label: "Daily Todos",
    sub: "Notion dashboard",
    description:
      "Every morning I open one Notion page with today's and tomorrow's actions, active projects, side quests and my calendar, and work from that.",
    desktop: { x: 40, y: 625, w: 220, h: 62 },
    mobile: { x: 208, y: 1275, w: 130, h: 64 },
  },
  {
    id: "weekly",
    kind: "box",
    label: "Weekly Review",
    sub: "Notion",
    description:
      "Every Saturday a fresh review page is waiting for me. I fill in wins, goal progress and a reflection.",
    desktop: { x: 320, y: 540, w: 145, h: 70 },
    mobile: { x: 25, y: 1430, w: 165, h: 64 },
  },
  {
    id: "monthly",
    kind: "box",
    label: "Monthly Finances",
    sub: "Google Sheets",
    description:
      "On the 1st, last month's expenses are already booked and synced into my finance sheet, so I just review where the money went and adjust my budget.",
    desktop: { x: 485, y: 540, w: 145, h: 70 },
    mobile: { x: 210, y: 1430, w: 165, h: 64 },
  },
  {
    id: "quarterly",
    kind: "box",
    label: "Quarterly Review",
    sub: "Notion",
    description:
      "Every 12 weeks I check whether I finished my side quest, what worked, and what changes next quarter.",
    desktop: { x: 650, y: 540, w: 145, h: 70 },
    mobile: { x: 210, y: 1520, w: 165, h: 64 },
  },
  {
    id: "yearly",
    kind: "box",
    label: "Yearly Goals",
    sub: "Notion",
    description:
      "Once a year I review and reset the goals every quarter rolls up to, measured against my life goals.",
    desktop: { x: 815, y: 540, w: 145, h: 70 },
    mobile: { x: 25, y: 1520, w: 165, h: 64 },
  },
  {
    id: "album",
    kind: "analog",
    label: "Photo Album",
    sub: "Printed",
    description:
      "The one offline part. Every quarter I print the best photos into a physical album, so the year is something I can hold.",
    desktop: { x: 650, y: 630, w: 145, h: 60 },
    mobile: { x: 210, y: 1610, w: 165, h: 64 },
  },
  {
    id: "photos",
    kind: "box",
    label: "Photo Storage",
    sub: "Google Photos",
    description:
      "Stores every photo I take. At each quarterly review I pick the ones worth printing.",
    desktop: { x: 815, y: 630, w: 145, h: 60 },
    mobile: { x: 25, y: 1610, w: 165, h: 64 },
  },
];

export const EDGES: LifeOsEdge[] = [
  { from: "calendar", to: "hermes", twoWay: true, desktop: "M305 70 L305 135", mobile: "M295 65 L295 125" },
  { from: "telegram", to: "hermes", desktop: "M120 70 L120 135", mobile: "M105 65 L105 125" },
  { from: "hermes", to: "notion", desktop: "M365 175 L450 175", mobile: "M345 165 L375 165 L375 470 L300 470 L300 492" },
  { from: "server", to: "notion", desktop: "M365 320 L450 320", mobile: "M120 390 L120 492" },
  { from: "notion", to: "website", desktop: "M670 250 L720 250", mobile: "M200 890 L200 950" },
  { from: "notion", to: "rituals", desktop: "M560 460 L560 495", mobile: "M340 870 L372 870 L372 1390" },
  { from: "notion", to: "travel", desktop: "M670 410 L700 410", mobile: "M60 860 L30 860 L30 1140 L50 1140" },
  { from: "tripPlanner", to: "tripAlbum", dashed: true, desktop: "M830 421 L850 421", mobile: "M192 1152 L208 1152" },
  { from: "notion", to: "todo", desktop: "M450 440 L150 440 L150 495", mobile: "M60 880 L18 880 L18 1295 L50 1295" },
  { from: "tasks", to: "daily", desktop: "M150 602 L150 625", mobile: "M192 1307 L208 1307" },
  { from: "weekly", to: "monthly", desktop: "M465 575 L485 575", mobile: "M190 1462 L210 1462" },
  { from: "monthly", to: "quarterly", desktop: "M630 575 L650 575", mobile: "M292 1494 L292 1520" },
  { from: "quarterly", to: "yearly", desktop: "M795 575 L815 575", mobile: "M210 1552 L190 1552" },
  { from: "quarterly", to: "album", dashed: true, desktop: "M722 610 L722 630", mobile: "M292 1584 L292 1610" },
  { from: "photos", to: "album", dashed: true, desktop: "M815 660 L795 660", mobile: "M190 1642 L210 1642" },
];
