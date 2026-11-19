# gta6-trophy-guide-sakura

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hellolucyheart/gta6-trophy-guide-sakura/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hellolucyheart/gta6-trophy-guide-sakura/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide is an offline web guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy is shown with its official name, description and grade, plus a guide written for this entry in our own words that names its source. A four-stage roadmap leads to the platinum, the three missable trophies are flagged with why they can be missed, and the checklist saves progress in the browser, exports it to a file and imports it back. Filters cover story, missions, activities, collectibles, combat, exploration, economy, social and missable trophies, and a spoiler-safe mode hides story and mission names until they are earned. It is plain static files under `app/` — no build step, no network at runtime, no official artwork.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
node serve.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json`. `serve.ts` serves `app/` on http://localhost:8080 so you can open the guide in a desktop browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=68wvraae&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
