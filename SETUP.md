# Setting up your automatic Cybersecurity Essentials tracker

## What this does
A GitHub Action watches your profile repo. Every time you push a commit
after finishing an item in the course, it automatically checks off the next
item in the table (in the exact order of your course) and updates the
progress badge in your README. No manual editing.

Tracks all 36 items from your course, in order:
- 27 Modules
- 7 Checkpoint Exams
- 1 End of Course Survey
- 1 Final Exam

## Files in this package
```
.github/workflows/streak-bot.yml   -> the automation (runs on push + daily)
scripts/update_streak.js           -> the logic (advances items, rewrites README)
data/plan.json                     -> your exact 36-item course structure
README.md                          -> your profile README, with markers added
```

## Install steps

1. Go to your profile repo: `https://github.com/yohannesmelese06-droid/yohannesmelese06-droid`
   (create it first if it doesn't exist yet - name it exactly like your username).

2. Copy these into the repo, keeping the folder structure:
   - `.github/workflows/streak-bot.yml`
   - `scripts/update_streak.js`
   - `data/plan.json`
   - Replace your existing `README.md` with the one in this package (or copy
     the `<!--START_SECTION:streak-->...<!--END_SECTION:streak-->` block into
     your current README wherever you want the tracker to appear).

3. Commit and push everything to `main`.

4. Go to the repo's Actions tab -> "Update Cybersecurity Essentials Progress"
   -> click "Run workflow" once to confirm it works.

5. From now on: study an item -> when you finish it, make a commit (use the
   suggested commit message from `data/plan.json`, or your own notes for
   that module/exam) -> push -> the bot automatically checks that item off
   and updates the badge.

## About "Module 1: 72%"
Since you're already partway through Module 1, the tracker won't know that
until you push your first commit for it - at that point it marks item #1
(Module 1) as fully done and moves to item #2. If you'd rather it start
already reflecting "in progress" for Module 1, you can manually create
`data/state.json` before your first push with:
```json
{ "completed": {}, "last_completed_date": null }
```
and just push once you've actually finished Module 1 - the tracker is
binary (done / not done) by design, so partial percentages aren't tracked,
only completions.

## Rules built into the bot
- Items complete **in order**, one at a time, exactly matching your course
  sequence (modules, checkpoints, survey, final exam).
- Only **one item advances per calendar day**, even with multiple pushes -
  keeps it honest and matches real study pace.
- Scheduled daily runs and manual "Run workflow" clicks only refresh the
  display; only an actual push advances an item.

## Customizing
- **Edit the course list:** change `data/plan.json` - each entry has `id`,
  `type` (`module` / `checkpoint` / `survey` / `exam`), `title`, and a
  suggested `commit` message.
- **Restart the tracker:** delete `data/state.json` and push - next push
  starts again from item 1.
- **Allow more than one item/day:** in `scripts/update_streak.js`, remove
  the `alreadyDoneToday` check in the push-handling block.
