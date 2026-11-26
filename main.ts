// News-image entry: the finished front page is entry.png beside this file,
// and the program writes those exact bytes to the output directory as
// entry.png. It runs twice and both runs write identical bytes, because it
// only copies the file and never renders anything.
// Run it with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const source = join(here, "entry.png");
const target = join(outDir, "entry.png");
copyFileSync(source, target);
// Verify the copy is whole: same length and same sha256 as the source,
// so a truncated write fails loudly instead of shipping a broken image.
// Each file is read once; a size mismatch and a hash mismatch are reported
// separately, with the numbers, so the failure tells you which check broke.
const sourceBytes = readFileSync(source);
const targetBytes = readFileSync(target);
if (targetBytes.length !== sourceBytes.length) {
  throw new Error(
    `entry.png was not copied whole: expected ${sourceBytes.length} bytes, got ${targetBytes.length}`
  );
}
const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");
if (sha256(targetBytes) !== sha256(sourceBytes)) {
  throw new Error(
    `entry.png was not copied whole: sha256 mismatch, expected ${sha256(sourceBytes)}, got ${sha256(targetBytes)}`
  );
}
