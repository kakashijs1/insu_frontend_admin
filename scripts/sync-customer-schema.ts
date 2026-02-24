import { readFile, writeFile } from "node:fs/promises";

const CUSTOMER_SCHEMA = "../customer_frontend/prisma/schema.prisma";
const ADMIN_SCHEMA = "prisma/schema.prisma";

const ADMIN_HEADER = `generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

generator prismabox {
  provider                    = "prismabox"
  typeboxImportDependencyName = "elysia"
  typeBoxImportVariableName   = "t"
  inputModel                  = true
  output                      = "../app/generated/prismabox"
}

datasource db {
  provider = "postgresql"
}`;

function extractModelsAndEnums(schema: string): string {
  const lines = schema.split("\n");
  const resultLines: string[] = [];
  let capturing = false;
  let braceDepth = 0;
  const pendingComments: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!capturing && trimmed.startsWith("// ──")) {
      pendingComments.push(line);
      continue;
    }

    if (!capturing && pendingComments.length > 0 && trimmed.startsWith("//")) {
      pendingComments.push(line);
      continue;
    }

    if (!capturing && pendingComments.length > 0 && trimmed === "") {
      pendingComments.push(line);
      continue;
    }

    if (
      !capturing &&
      (trimmed.startsWith("model ") || trimmed.startsWith("enum "))
    ) {
      capturing = true;
      braceDepth = 0;
      resultLines.push(...pendingComments);
      pendingComments.length = 0;
    } else {
      pendingComments.length = 0;
    }

    if (capturing) {
      resultLines.push(line);
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;

      if (braceDepth === 0 && resultLines.length > 1) {
        resultLines.push("");
        capturing = false;
      }
    }
  }

  return resultLines.join("\n").trim();
}

async function main() {
  const customerSchema = await readFile(CUSTOMER_SCHEMA, "utf-8");
  const allModels = extractModelsAndEnums(customerSchema);

  const output = [
    ADMIN_HEADER,
    "",
    "// ──────────────────────────────────────────────",
    "// All models (auto-synced from customer_frontend)",
    "// DO NOT EDIT — run `bun run sync:schema` to update",
    "// ──────────────────────────────────────────────",
    "",
    allModels,
    "",
  ].join("\n");

  await writeFile(ADMIN_SCHEMA, output, "utf-8");
  console.log("Synced models into admin schema.");
}

main();
