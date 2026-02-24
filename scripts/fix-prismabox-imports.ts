import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const GENERATED_DIR = "app/generated/prismabox";

const ELYSIA_IMPORT = /^(import \{[^}]*)\bType\b([^}]*\} from "elysia")/gm;

function fixLine(match: string, before: string, after: string): string {
  if (before.includes("t as Type")) return match;
  return `${before}t as Type${after}`;
}

async function getTypeScriptFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getTypeScriptFiles(fullPath)));
    } else if (entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  let fixedCount = 0;

  try {
    const files = await getTypeScriptFiles(GENERATED_DIR);

    for (const file of files) {
      const content = await readFile(file, "utf-8");

      if (content.includes("t as Type")) continue;

      const updated = content.replace(ELYSIA_IMPORT, fixLine);
      if (updated !== content) {
        await writeFile(file, updated, "utf-8");
        fixedCount++;
      }
    }

    console.log(
      `Fixed prismabox imports in ${fixedCount} file(s): Type -> t as Type`,
    );
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      console.log("No prismabox generated directory found. Skipping.");
      return;
    }
    throw err;
  }
}

main();
