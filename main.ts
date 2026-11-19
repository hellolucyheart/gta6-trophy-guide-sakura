// Leonida Trophy Guide — the entry program (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html, style.css,
// app.js and data/trophies.json, with no build step and no network at run
// time. This program is what hands the guide in: it copies app/ and
// screenshots/ from beside this file into the output directory and writes
// dossier.json there with the vendored make.fun library — the summary the
// judge reads (the screenshots, the first load's files and bytes, and the
// source outline).
//
// vendor/makefun-frontend.ts stays exactly as the kit shipped it: the gate
// rebuilds the dossier with its own copy and compares the two byte for byte,
// so any change there would fail the entry.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program runs twice in grading and both runs must write the same bytes,
// so it writes nothing time-dependent and copies files exactly as they are.
// Screenshots are regenerated fresh for each rebuild with a new earned-trophy
// seed (see shots.json and the shots.mjs work script), so the images in the
// dossier always match the current build rather than an older one.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps, from the kit's gate: at most 4 screenshots, each at most
// 256 KiB; at most 993 files and directories in app/ and 48 MiB of app files
// in all; the dossier text is capped at 160 KiB. The library enforces them
// and refuses an entry that would break them, so a bad build fails here
// loudly instead of passing a broken dossier to the judge.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
