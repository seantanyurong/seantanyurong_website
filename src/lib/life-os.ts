/*
  Content + layout for the Life OS diagram. Pure data (no imports) so the Node
  test runner can check it — including that no private details leak into it.

  Coordinates are SVG units: desktop viewBox is DESKTOP, mobile is MOBILE.
*/

export const DESKTOP = { width: 1000, height: 825 };
export const MOBILE = { width: 400, height: 1950 };

type Rect = { x: number; y: number; w: number; h: number };

export type LifeOsNode = {
  id: string;
  kind: "group" | "box" | "pill" | "db" | "analog";
  label: string;
  sub?: string;
  lines?: string[]; // extra monospace lines (cron jobs, pages)
  sections?: DbSection[]; // database only: its tables, grouped by what uses them
  labelAt?: "top" | "bottom"; // groups: where the caption sits (default top)
  description: string;
  desktop: Rect;
  mobile: Rect;
};

export type DbSection = { id: string; label: string; tables: string[] };

export type LifeOsEdge = {
  from: string;
  to: string;
  fromSection?: string; // starts at this database section (drawn with a dot)
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
    sections: [
      { id: "money", label: "Money", tables: ["expenses", "subscriptions", "insurance", "allowances", "taxes"] },
      { id: "travel", label: "Travel", tables: ["travel", "trip_stops"] },
      { id: "tasks", label: "Tasks", tables: ["actions"] },
      { id: "gear", label: "Gear", tables: ["gear"] },
      { id: "reviews", label: "Reviews & Goals", tables: ["weekly_reviews", "quarterly_reviews", "goals", "side_quests"] },
    ],
    description: 
      "Holds every part of my life as tables, grouped by what uses them: money, travel, tasks, gear, and reviews and goals. Everything else in the system reads from it or writes to it.",
    desktop: { x: 450, y: 40, w: 220, h: 490 },
    mobile: { x: 60, y: 490, w: 280, h: 560 },
  },
  {
    id: "vercel",
    kind: "group",
    label: "Vercel",
    labelAt: "bottom",
    description:
      "Hosts this website. It rebuilds from my database once a day.",
    desktop: { x: 700, y: 40, w: 280, h: 195 },
    mobile: { x: 50, y: 1085, w: 300, h: 210 },
  },
  {
    id: "website",
    kind: "box",
    label: "Personal Website",
    sub: "Next.js",
    lines: ["travel → Places map", "side_quests → Sidequests", "gear → Gear page"],
    description: 
      "This site, seantanyurong.com. The Places map, Sidequests and Gear are read straight from my database, so updating my life updates the site.",
    desktop: { x: 720, y: 60, w: 240, h: 135 },
    mobile: { x: 70, y: 1105, w: 260, h: 155 },
  },
  {
    id: "todo",
    kind: "group",
    label: "Todo System",
    description:
      "How I keep track of what to do: every task goes into one list, and each morning I only look at what's due.",
    desktop: { x: 20, y: 435, w: 370, h: 120 },
    mobile: { x: 50, y: 1325, w: 300, h: 120 },
  },
  {
    id: "tasks",
    kind: "box",
    label: "Task List",
    sub: "Notion",
    description:
      "Every task lives in one Notion table with a due date, so nothing sits only in my head.",
    desktop: { x: 40, y: 475, w: 160, h: 62 },
    mobile: { x: 62, y: 1365, w: 130, h: 64 },
  },
  {
    id: "travel",
    kind: "group",
    label: "Travel System",
    description:
      "Every trip runs the same way: plan it from my template, go, then wrap it up with an album.",
    desktop: { x: 700, y: 255, w: 280, h: 130 },
    mobile: { x: 50, y: 1475, w: 300, h: 120 },
  },
  {
    id: "tripPlanner",
    kind: "box",
    label: "Trip Planner",
    sub: "Notion template",
    description:
      "Every trip starts as a page from my trip template, with the itinerary, to-dos, budget and research in one place. The places I stop at are logged there, and once I've been, they show up on the Places map.",
    desktop: { x: 715, y: 300, w: 115, h: 62 },
    mobile: { x: 62, y: 1515, w: 130, h: 64 },
  },
  {
    id: "tripAlbum",
    kind: "box",
    label: "Trip Album",
    sub: "Google Photos",
    description:
      "When I'm back, I gather the trip's photos into their own Google Photos album, so every trip has one place to relive it.",
    desktop: { x: 850, y: 300, w: 115, h: 62 },
    mobile: { x: 208, y: 1515, w: 130, h: 64 },
  },
  {
    id: "rituals",
    kind: "group",
    label: "Rituals",
    description:
      "The point of everything above. Each ritual starts with the work already done, so I just show up and review.",
    desktop: { x: 20, y: 590, w: 960, h: 215 },
    mobile: { x: 10, y: 1625, w: 380, h: 304 },
  },
  {
    id: "daily",
    kind: "box",
    label: "Daily Todos",
    sub: "Notion dashboard",
    description:
      "Every morning I open one Notion page with today's and tomorrow's actions, active projects, side quests and my calendar, and work from that.",
    desktop: { x: 220, y: 475, w: 155, h: 62 },
    mobile: { x: 208, y: 1365, w: 130, h: 64 },
  },
  {
    id: "weekly",
    kind: "box",
    label: "Weekly Review",
    sub: "Notion",
    description:
      "Every Saturday a fresh review page is waiting for me. I fill in wins, goal progress and a reflection.",
    desktop: { x: 40, y: 635, w: 200, h: 70 },
    mobile: { x: 25, y: 1665, w: 165, h: 64 },
  },
  {
    id: "monthly",
    kind: "box",
    label: "Monthly Finances",
    sub: "Google Sheets",
    description:
      "On the 1st, last month's expenses are already booked and synced into my finance sheet, so I just review where the money went and adjust my budget.",
    desktop: { x: 280, y: 635, w: 200, h: 70 },
    mobile: { x: 210, y: 1665, w: 165, h: 64 },
  },
  {
    id: "quarterly",
    kind: "box",
    label: "Quarterly Review",
    sub: "Notion",
    description:
      "Every 12 weeks I check whether I finished my side quest, what worked, and what changes next quarter.",
    desktop: { x: 520, y: 635, w: 200, h: 70 },
    mobile: { x: 210, y: 1755, w: 165, h: 64 },
  },
  {
    id: "yearly",
    kind: "box",
    label: "Yearly Goals",
    sub: "Notion",
    description:
      "Once a year I review and reset the goals every quarter rolls up to, measured against my life goals.",
    desktop: { x: 760, y: 635, w: 200, h: 70 },
    mobile: { x: 25, y: 1755, w: 165, h: 64 },
  },
  {
    id: "album",
    kind: "analog",
    label: "Photo Album",
    sub: "Printed",
    description:
      "The one offline part. Every quarter I print the best photos into a physical album, so the year is something I can hold.",
    desktop: { x: 520, y: 725, w: 200, h: 60 },
    mobile: { x: 210, y: 1845, w: 165, h: 64 },
  },
  {
    id: "photos",
    kind: "box",
    label: "Photo Storage",
    sub: "Google Photos",
    description:
      "Stores every photo I take. At each quarterly review I pick the ones worth printing.",
    desktop: { x: 760, y: 725, w: 200, h: 60 },
    mobile: { x: 25, y: 1845, w: 165, h: 64 },
  },
];

/*
  Where each database section sits, in SVG units. The diagram draws the
  section headers and tables from this, and edges that start at a section
  use its `mid` so the arrow leaves from the right rows.
*/
export const DB_ROWS = { top: 104, header: 16, line: 18, gap: 10 };

export function dbSectionBands(node: LifeOsNode, layout: "desktop" | "mobile") {
  const k = layout === "mobile" ? 1.15 : 1;
  let y = node[layout].y + DB_ROWS.top * k;
  return (node.sections ?? []).map((section) => {
    const top = y;
    const bottom = y + (DB_ROWS.header + section.tables.length * DB_ROWS.line) * k;
    y = bottom + DB_ROWS.gap * k;
    return { ...section, top, bottom, mid: Math.round((top + bottom) / 2) };
  });
}

const notion = NODES.find((n) => n.id === "notion")!;
const band = (id: string, layout: "desktop" | "mobile") =>
  dbSectionBands(notion, layout).find((b) => b.id === id)!.mid;
const dTravel = band("travel", "desktop");
const dTasks = band("tasks", "desktop");
const mTravel = band("travel", "mobile");
const mTasks = band("tasks", "mobile");
const mReviews = band("reviews", "mobile");

export const EDGES: LifeOsEdge[] = [
  { from: "calendar", to: "hermes", twoWay: true, desktop: "M305 70 L305 135", mobile: "M295 65 L295 125" },
  { from: "telegram", to: "hermes", desktop: "M120 70 L120 135", mobile: "M105 65 L105 125" },
  { from: "hermes", to: "notion", desktop: "M365 175 L450 175", mobile: "M345 165 L375 165 L375 470 L300 470 L300 492" },
  { from: "server", to: "notion", desktop: "M365 250 L450 250", mobile: "M120 390 L120 492" },
  // The website reads several tables, so it joins the database as a whole.
  { from: "notion", to: "website", desktop: "M670 110 L720 110", mobile: "M200 1050 L200 1105" },
  { from: "notion", to: "travel", fromSection: "travel",
    desktop: `M670 ${dTravel} L700 ${dTravel}`,
    mobile: `M60 ${mTravel} L18 ${mTravel} L18 1547 L50 1547` },
  { from: "notion", to: "todo", fromSection: "tasks",
    desktop: `M450 ${dTasks} L420 ${dTasks} L420 470 L390 470`,
    mobile: `M60 ${mTasks} L30 ${mTasks} L30 1397 L50 1397` },
  { from: "notion", to: "rituals", fromSection: "reviews",
    desktop: "M560 530 L560 590",
    mobile: `M340 ${mReviews} L372 ${mReviews} L372 1625` },
  { from: "tripPlanner", to: "tripAlbum", dashed: true, desktop: "M830 331 L850 331", mobile: "M192 1547 L208 1547" },
  { from: "tasks", to: "daily", desktop: "M200 506 L220 506", mobile: "M192 1397 L208 1397" },
  { from: "weekly", to: "monthly", desktop: "M240 670 L280 670", mobile: "M190 1697 L210 1697" },
  { from: "monthly", to: "quarterly", desktop: "M480 670 L520 670", mobile: "M292 1729 L292 1755" },
  { from: "quarterly", to: "yearly", desktop: "M720 670 L760 670", mobile: "M210 1787 L190 1787" },
  { from: "quarterly", to: "album", dashed: true, desktop: "M620 705 L620 725", mobile: "M292 1819 L292 1845" },
  { from: "photos", to: "album", dashed: true, desktop: "M760 755 L720 755", mobile: "M190 1877 L210 1877" },
];
