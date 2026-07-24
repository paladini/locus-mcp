import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  formatSymbolLocation,
  okResult,
  errorResult,
} from "@paladini/locus-core";
import type { LocusServerContext } from "../context.js";
import { handleLspError } from "./helpers.js";

export const locateTool = {
  name: "locate",
  description:
    "Find a symbol by name (supports qualified names like Foo.bar) or get document symbol overview. Primary navigation tool — prefer over Grep for semantic lookup.",
  inputSchema: {
    type: "object" as const,
    properties: {
      name: {
        type: "string",
        description: "Symbol name or qualified name (e.g. MyClass.method)",
      },
      file: {
        type: "string",
        description: "Optional file path to scope document symbol overview",
      },
    },
  },
};

const locateSchema = z.object({
  name: z.string().optional(),
  file: z.string().optional(),
});

export async function handleLocate(ctx: LocusServerContext, args: unknown): Promise<CallToolResult> {
  const input = locateSchema.parse(args ?? {});

  if (input.file && !input.name) {
    const client = await ctx.manager.getClientForFile(input.file);
    if (!client) {
      return textResult(errorResult("no_results", `No LSP configured for ${input.file}`));
    }

    try {
      const symbols = await client.documentSymbol(input.file);
      if (symbols.length === 0) {
        return textResult(errorResult("no_results", "No symbols in document"));
      }

      const lines = symbols.slice(0, 50).map((s) => {
        const filePath = s.location.uri.replace(/^file:\/\//, "");
        return `${filePath}:${s.location.range.start.line + 1}:${s.location.range.start.character + 1}: ${s.containerName ? `${s.containerName}.` : ""}${s.name}`;
      });

      return textResult(okResult(lines.join("\n"), `${symbols.length} symbol(s)`));
    } catch (err) {
      return textResult(handleLspError(err));
    }
  }

  if (!input.name) {
    return textResult(errorResult("error", "Provide 'name' or 'file'"));
  }

  const client = await getClientForQuery(ctx, input.name, input.file);
  if (!client) {
    return textResult(errorResult("server_unavailable", "No language server available for query"));
  }

  try {
    const result = await ctx.resolver.findByName(client, input.name);

    if (result.status === "no_results") {
      return textResult(errorResult("no_results", result.message ?? "No symbols found"));
    }

    if (result.status === "ambiguous_symbol") {
      const lines = result.symbols.map((s) => formatSymbolLocation(s, ctx.rootPath));
      return textResult({
        status: "ambiguous_symbol",
        message: result.message,
        data: lines.join("\n"),
      });
    }

    const lines = result.symbols.map((s) => formatSymbolLocation(s, ctx.rootPath));
    return textResult(okResult(lines.join("\n")));
  } catch (err) {
    return textResult(handleLspError(err));
  }
}

async function getClientForQuery(ctx: LocusServerContext, _name: string, file?: string) {
  if (file) {
    return ctx.manager.getClientForFile(file);
  }

  for (const config of ctx.configs) {
    const client = await ctx.manager.getClientForFile(`dummy${config.extensions[0]}`);
    if (client && client.serverState === "ready") {
      return client;
    }
  }

  return ctx.manager.getClientForFile("index.ts");
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
