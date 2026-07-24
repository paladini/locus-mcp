import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatLocations, okResult, errorResult } from "@locus-dev/core";
import type { LocusServerContext } from "../context.js";
import { getClientForSymbol, handleLspError, parsePosition } from "./helpers.js";

export const refsTool = {
  name: "refs",
  description: "Find references or implementations of a symbol. Accepts symbol name (via prior locate) or file:line:col position.",
  inputSchema: {
    type: "object" as const,
    properties: {
      file: { type: "string", description: "File path containing the symbol" },
      line: { type: "number", description: "0-based line number" },
      character: { type: "number", description: "0-based character offset" },
      position: { type: "string", description: "Alternative: path:line:col (1-based line/col)" },
      implementations: { type: "boolean", description: "Find implementations instead of references" },
      include_declaration: { type: "boolean", description: "Include declaration in references (default true)" },
      limit: { type: "number", description: "Max results (default 50)" },
    },
    required: ["file"],
  },
};

const refsSchema = z.object({
  file: z.string(),
  line: z.number().optional(),
  character: z.number().optional(),
  position: z.string().optional(),
  implementations: z.boolean().optional(),
  include_declaration: z.boolean().optional(),
  limit: z.number().optional(),
});

export async function handleRefs(ctx: LocusServerContext, args: unknown): Promise<CallToolResult> {
  const input = refsSchema.parse(args ?? {});
  const pos = parsePosition(input.position);
  const line = pos?.line ?? input.line;
  const character = pos?.character ?? input.character;
  const file = pos?.file ?? input.file;

  if (line === undefined || character === undefined) {
    return textResult(errorResult("error", "Provide line/character or position (path:line:col)"));
  }

  const client = await getClientForSymbol(ctx, file);
  if (!client) {
    return textResult(errorResult("server_unavailable", `No LSP for ${file}`));
  }

  try {
    const locations = input.implementations
      ? await client.implementation(file, line, character)
      : await client.references(file, line, character, input.include_declaration ?? true);

    if (locations.length === 0) {
      return textResult(errorResult("no_results", "No references found"));
    }

    const limit = input.limit ?? 50;
    const limited = locations.slice(0, limit);
    const formatted = formatLocations(limited, ctx.rootPath);

    let text = formatted.join("\n");
    if (locations.length > limit) {
      text += `\n\n... ${locations.length - limit} more (use limit param)`;
    }

    return textResult(okResult(text, `${locations.length} result(s)`));
  } catch (err) {
    return textResult(handleLspError(err));
  }
}

function textResult(result: { status: string; data?: string; message?: string }): CallToolResult {
  const parts = [`status: ${result.status}`];
  if (result.message) parts.push(result.message);
  if (result.data) parts.push("", result.data);
  return {
    content: [{ type: "text", text: parts.join("\n") }],
    isError: result.status !== "ok",
  };
}
