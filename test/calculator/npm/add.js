#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const bin = fileURLToPath(import.meta.resolve(`calculator-${process.platform}-${process.arch}/add`))
const cp = spawnSync(bin, process.argv.slice(2), { stdio: "inherit" });
if (cp.error) {
  console.error(cp.error);
  process.exit(100);
} else {
  process.exit(cp.status ?? 100);
}