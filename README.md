# gta6-trophy-guide-sakura

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hellolucyheart/gta6-trophy-guide-sakura/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hellolucyheart/gta6-trophy-guide-sakura/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline GTA VI trophy guide and progress tracker covering all 55 PlayStation 5 trophies. What it gives you:

- A checklist of every trophy, with your progress saved in the browser (localStorage), so it keeps working with the network off.
- A guide for each trophy, written in this entry's own words and citing its sources — trophy names, descriptions and grades are shown exactly as PlayStation publishes them.
- Search across names, descriptions and guides, filters by kind and grade, export/import of your progress, a hide-earned toggle, and a spoiler setting that hides story trophy names until you earn them.
- A five-stage roadmap to the platinum, with the one possibly-missable trophy clearly flagged.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. The guide only loads its own files, so it works with the network off.

Or hand it in the way the bounty grades it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That writes `out/dossier.json`, the summary the judge reads.

---

<sub>Entered on [make.fun](https://make.fun/?ref=68wvraae&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
