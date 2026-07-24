import { resolve } from "node:path";
import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  formatDiagnostics,
  formatWorkspaceDiagnostics,
  okResult,
  errorResult,
} from "@locus-dev/core";
import { filePathToUri } from "@locus-dev/core";
import type { LocusServerContext } from "../context.js";
import { getClientForSymbol, handleLspError } from "./helpers.js";

export const diagnosticsTool = {
  name: "diagnostics",
  description: "Get compiler/linter diagnostics for a file or the entire workspace.",
  inputSchema: {
    type: "object" as const,
    properties: {
      file: { type: "string", description: "File path (omit for workspace-wide)" },
      workspace: { type: "boolean", description: "Collect from all open documents" },
    },
  },
};

const diagnosticsSchema = z.object({
  file: z.string().optional(),
  workspace: z.boolean().optional(),
});

export async function handleDiagnostics(ctx: LocusServerContext, args: unknown): Promise<CallToolResult> {
  const input = diagnosticsSchema.parse(args ?? {});

  if (input.file) {
    const filePath = resolve(ctx.rootPath, input.file);
    const client = await getClientForSymbol(ctx, filePath);
    if (!client) {
      return textResult(errorResult("server_unavailable", `No LSP for ${input.file}`));
    }

    try {
      await client.didOpen(filePath);
      await waitForDiagnostics(200);
      const uri = filePathToUri(filePath);
      const diags = client.getDiagnostics(uri);
      const text = formatDiagnostics(diags, filePath, ctx.rootPath);
      return textResult(okResult(text, `${diags.length} diagnostic(s)`));
    } catch (err) {
      return textResult(handleLspError(err));
    }
  }

  // Workspace diagnostics from all active clients
  const byFile = new Map<string, import("@locus-dev/core").Diagnostic[]>();

  for (const config of ctx.configs) {
    const dummy = resolve(ctx.rootPath, `dummy${config.extensions[0]}`);
    const client = await ctx.manager.getClientForFile(dummy);
    if (!client || client.serverState !== "ready") continue;

    for (const doc of client.getOpenDocuments()) {
      const diags = client.getDiagnostics(doc.uri);
      if (diags.length) {
        byFile.set(doc.uri, diags);
      }
    }
  }

  if (byFile.size === 0) {
    return textResult(okResult("No workspace diagnostics. Open files with locate/refs first, or pass a file path."));
  }

  const text = formatWorkspaceDiagnostics(byFile, ctx.rootPath);
  return textResult(okResult(text));
}

function waitForDiagnostics(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function textResult(result: { status: string; data?: string; message?: string }): CallToolResult {
  const parts = [`status: ${result.status}`];
  if (result.message) parts.push(result.message);
  if (result.data) parts.push("", result.data);
  return {
    content: [{ type: "text", text: parts.join("\n") }],
    isError: result.status !== "ok" && result.status !== "no_results",
  };
}
