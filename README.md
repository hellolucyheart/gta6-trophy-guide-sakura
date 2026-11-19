# gta6-trophy-guide-sakura

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hellolucyheart/gta6-trophy-guide-sakura/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hellolucyheart/gta6-trophy-guide-sakura/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline GTA VI trophy guide and tracker for all 55 PlayStation 5 trophies. It gives you:

- A checklist of every trophy, with progress saved in your browser (localStorage), so it works with the network off.
- A guide for each trophy, written in its own words and citing its sources — trophy names, descriptions and grades are shown exactly as PlayStation publishes them.
- Filters by kind and grade, full-text search, export/import of your progress, and a spoiler setting that hides story trophy names until you earn them.
- A five-stage roadmap to the platinum, with the one possibly-missable trophy flagged.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. The guide works with the network off: it loads only its own files.

Or hand it in the way the bounty grades it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=68wvraae&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
