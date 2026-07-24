import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatHover, okResult, errorResult } from "@locus-dev/core";
import type { LocusServerContext } from "../context.js";
import { getClientForSymbol, handleLspError, parsePosition } from "./helpers.js";

export const hoverTool = {
  name: "hover",
  description: "Get type information and documentation for a symbol or position.",
  inputSchema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "Symbol name to resolve" },
      file: { type: "string", description: "File path" },
      line: { type: "number", description: "0-based line" },
      character: { type: "number", description: "0-based character" },
      position: { type: "string", description: "Alternative: path:line:col (1-based)" },
    },
  },
};

const hoverSchema = z.object({
  name: z.string().optional(),
  file: z.string().optional(),
  line: z.number().optional(),
  character: z.number().optional(),
  position: z.string().optional(),
});

export async function handleHover(ctx: LocusServerContext, args: unknown): Promise<CallToolResult> {
  const input = hoverSchema.parse(args ?? {});
  const pos = parsePosition(input.position);

  let file = pos?.file ?? input.file;
  let line = pos?.line ?? input.line;
  let character = pos?.character ?? input.character;

  if (input.name && file) {
    const client = await getClientForSymbol(ctx, file);
    if (!client) {
      return textResult(errorResult("server_unavailable", `No LSP for ${file}`));
    }

    try {
      const resolved = await ctx.resolver.findByName(client, input.name);
      if (resolved.status !== "ok" || resolved.symbols.length === 0) {
        return textResult(errorResult(resolved.status === "ambiguous_symbol" ? "ambiguous_symbol" : "no_results", resolved.message ?? "Symbol not found"));
      }

      const sym = resolved.symbols[0]!;
      file = sym.filePath;
      line = sym.line;
      character = sym.character;
    } catch (err) {
      return textResult(handleLspError(err));
    }
  }

  if (!file || line === undefined || character === undefined) {
    return textResult(errorResult("error", "Provide file+position or name+file"));
  }

  const client = await getClientForSymbol(ctx, file);
  if (!client) {
    return textResult(errorResult("server_unavailable", `No LSP for ${file}`));
  }

  try {
    const hover = await client.hover(file, line, character);
    const markdown = formatHover(hover);
    return textResult(okResult(markdown));
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
