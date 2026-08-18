// scripts/update_streak.js
// Tracks your exact course structure: 27 modules + 7 checkpoint exams +
// end-of-course survey + final exam = 36 items total, completed in order.
// Logic: every time you PUSH a commit to this repo, the bot marks the next
// pending item as done and moves on. Scheduled/manual runs just refresh the
// display without advancing anything.

const fs = require("fs");

const README_PATH = "README.md";
const PLAN_PATH = "data/plan.json";
const STATE_PATH = "data/state.json";
const START_MARKER = "<!--START_SECTION:streak-->";
const END_MARKER = "<!--END_SECTION:streak-->";

const TYPE_ICON = {
  module: "📘",
  checkpoint: "🧩",
  survey: "📝",
  exam: "🏁",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function loadJSON(path, fallback) {
  if (!fs.existsSync(path)) return fallback;
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function saveJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

function main() {
  const plan = loadJSON(PLAN_PATH, []);
  const total = plan.length;
  let state = loadJSON(STATE_PATH, null);

  if (!state) {
    state = {
      completed: {}, // { "1": "2026-08-18", "2": "2026-08-19", ... }
      last_completed_date: null,
    };
  }

  const eventName = process.env.GITHUB_EVENT_NAME || "manual";
  const today = todayStr();

  // Only advance on an actual push (i.e. you committed finished work).
  if (eventName === "push") {
    const completedCount = Object.keys(state.completed).length;
    const alreadyDoneToday = state.last_completed_date === today;

    if (!alreadyDoneToday && completedCount < total) {
      const nextItem = completedCount + 1;
      state.completed[nextItem] = today;
      state.last_completed_date = today;
      console.log(`Marked item ${nextItem} as completed on ${today}.`);
    } else if (alreadyDoneToday) {
      console.log("Already completed an item today - one per day max.");
    } else {
      console.log("All items already completed!");
    }
  }

  saveJSON(STATE_PATH, state);

  const completedCount = Object.keys(state.completed).length;
  const badgeColor =
    completedCount >= total ? "00FF41" : completedCount > 0 ? "FFD700" : "FF3131";
  const badge = `![Progress](https://img.shields.io/badge/Cybersecurity%20Essentials-${completedCount}%20%2F%20${total}-${badgeColor}?style=for-the-badge&logo=hackthebox&logoColor=black)`;

  const rows = plan.map((p) => {
    const done = !!state.completed[p.id];
    const icon = done ? "✅" : "⬜";
    const typeIcon = TYPE_ICON[p.type] || "📘";
    return { id: p.id, title: p.title, typeIcon, icon };
  });

  let table = "| # | Item | Done |\n|:---:|:---|:---:|\n";
  for (const r of rows) {
    table += `| ${r.id} | ${r.typeIcon} ${r.title} | ${r.icon} |\n`;
  }

  const section = [
    START_MARKER,
    "",
    "## 🔐 Cybersecurity Essentials Course Progress (auto-updated)",
    "",
    '<div align="center">',
    "",
    badge,
    "",
    "</div>",
    "",
    `_Last checked: ${today} · An item is checked off automatically the next time you push a commit after finishing it - no manual editing._`,
    "",
    table.trim(),
    "",
    "> ✅ completed · ⬜ upcoming — 📘 module · 🧩 checkpoint exam · 📝 survey · 🏁 final exam. Items complete in order, one per day.",
    "",
    END_MARKER,
  ].join("\n");

  let readme = fs.readFileSync(README_PATH, "utf8");
  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `Could not find ${START_MARKER} / ${END_MARKER} markers in README.md.`
    );
    process.exit(1);
  }

  const before = readme.slice(0, startIdx);
  const after = readme.slice(endIdx + END_MARKER.length);
  readme = before + section + after;

  fs.writeFileSync(README_PATH, readme);
  console.log(`Rendered table: ${completedCount}/${total} items complete.`);
}

main();
