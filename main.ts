/* Leonida Trophy Guide — entrypoint.
   Copies app/ and screenshots/ from this repository into the output
   directory and writes dossier.json with the kit library. Runs the
   same way twice and produces identical bytes both times. */
import { cpSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = resolve(".");
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

function wipeDir(path: string): void {
  rmSync(path, { force: true, recursive: true });
  mkdirSync(path, { recursive: true });
}

function listFilesSorted(dir: string): string[] {
  const names = readdirSync(dir).sort();
  const found: string[] = [];
  for (const name of names) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      found.push(...listFilesSorted(full));
    } else {
      found.push(full);
    }
  }
  return found;
}

function copyTreeInto(srcDir: string, destDir: string): void {
  const files = listFilesSorted(srcDir);
  for (const file of files) {
    const rel = file.slice(srcDir.length + 1);
    const target = join(destDir, rel);
    mkdirSync(join(target, ".."), { recursive: true });
    cpSync(file, target);
  }
}

wipeDir(outDir);
mkdirSync(join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
copyTreeInto(join(repoRoot, "app"), join(outDir, "app"));
copyTreeInto(join(repoRoot, "screenshots"), join(outDir, "screenshots"));

const dossier = buildDossier(outDir, { text_max_bytes: 163840 });
writeFileSync(join(outDir, "dossier.json"), dossier);
console.log("wrote dossier.json (" + dossier.length + " bytes) to " + outDir);
