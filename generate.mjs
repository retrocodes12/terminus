// Draws countdown.svg — a poster counting down the weeks of the 2020s.
// No dependencies. Run: node generate.mjs
// Prints the commit-message line ("1,241 days") to stdout.

import { readFileSync, writeFileSync } from "node:fs";

const DAY = 86_400_000;
const WEEK = 7 * DAY;
const START = Date.UTC(2020, 0, 1); // 2020-01-01 00:00 UTC
const TARGET = Date.UTC(2030, 0, 1); // 2030-01-01 00:00 UTC
const TOTAL_WEEKS = Math.ceil((TARGET - START) / WEEK); // 522 — the last cell is a 5-day week

const rawNow = process.env.COUNTDOWN_NOW;
const now = Math.min(
  TARGET,
  Math.max(START, rawNow ? Date.parse(rawNow) || Number(rawNow) : Date.now()),
);

const daysLeft = Math.ceil((TARGET - now) / DAY);
const weeksSpent = Math.min(Math.floor((now - START) / WEEK), TOTAL_WEEKS - 1);
const weeksLit = TOTAL_WEEKS - weeksSpent - 1; // full weeks after the orange one
const over = daysLeft === 0;
const stamp = new Date(now).toISOString().slice(0, 10);
const fmt = (n) => new Intl.NumberFormat("en-US").format(n);

// ---- palette ----
const BG = "#101113"; // cool near-black
const EDGE = "#26282B"; // hairline card border
const INK = "#EDEAE6"; // warm off-white — headline + lit weeks
const MUTED = "#8A867D"; // captions, ≥4.5:1 on BG
const SPENT = "#2E3033"; // outline of burned weeks
const ACCENT = "#FF4D00"; // this week, and nothing else

// ---- geometry ----
const W = 880;
const COLS = 58; // 58 × 9 = 522, the decade is an exact rectangle
const ROWS = 9;
const PITCH = W / COLS;
const CELL = 10;
const GRID_TOP = 296;
const H = Math.round(GRID_TOP + (ROWS - 1) * PITCH + CELL); // bottom row flush with the edge

let cells = "";
for (let i = 0; i < TOTAL_WEEKS; i++) {
  const x = (i % COLS) * PITCH + (PITCH - CELL) / 2;
  const y = GRID_TOP + Math.floor(i / COLS) * PITCH;
  const paint =
    !over && i === weeksSpent
      ? `fill="${ACCENT}"`
      : i < weeksSpent || over
        ? `fill="none" stroke="${SPENT}"`
        : `fill="${INK}"`;
  cells += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${CELL}" height="${CELL}" ${paint}/>`;
}

const font = readFileSync(new URL("./font/archivo-expanded-latin.woff2", import.meta.url))
  .toString("base64");

const line1 = over ? "the wall" : `${fmt(daysLeft)} days`;
const line2 = over ? "is dark." : "then dark.";
const capLeft = over
  ? "ALL 522 LIGHTS ARE OUT"
  : "ONE LIGHT GOES OUT EVERY WEEK";
const capRight = `REDRAWN DAILY · ${stamp}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
<title id="t">terminus</title>
<desc id="d">${line1} ${line2} ${fmt(weeksLit)} of ${TOTAL_WEEKS} lights still burn. Redrawn ${stamp}.</desc>
<style>
@font-face{font-family:'Archivo';font-weight:500 700;font-stretch:125%;font-display:block;src:url(data:font/woff2;base64,${font}) format('woff2')}
text{font-family:'Archivo','Helvetica Neue',Arial,sans-serif;font-stretch:125%}
.display{font-size:84px;font-weight:700;letter-spacing:-1.7px;fill:${INK}}
.dim{fill:${MUTED}}
.caption{font-size:11.5px;font-weight:500;letter-spacing:1.6px;fill:${MUTED}}
</style>
<rect width="${W}" height="${H}" fill="${BG}"/>
<text class="display" x="52" y="118">${line1}</text>
<text class="display dim" x="52" y="202">${line2}</text>
<text class="caption" x="53" y="252">${capLeft}</text>
<text class="caption" x="${W - 53}" y="252" text-anchor="end">${capRight}</text>
${cells}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${EDGE}"/>
</svg>
`;

writeFileSync(new URL("./countdown.svg", import.meta.url), svg);
process.stdout.write(over ? "the wall is dark\n" : `${fmt(daysLeft)} days remain\n`);
