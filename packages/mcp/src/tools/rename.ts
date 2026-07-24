import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  formatRenamePreview,
  okResult,
  errorResult,
} from "@locus-dev/core";
import type { LocusServerContext } from "../context.js";
import { getClientForSymbol, handleLspError, parsePosition } from "./helpers.js";

export const renameTool = {
  name: "rename",
  description: "Preview or apply a symbol rename. Defaults to dry-run preview; set apply=true to execute.",
  inputSchema: {
    type: "object" as const,
    properties: {
      file: { type: "string", description: "File containing the symbol" },
      line: { type: "number", description: "0-based line" },
      character: { type: "number", description: "0-based character" },
      position: { type: "string", description: "Alternative: path:line:col (1-based)" },
      new_name: { type: "string", description: "New symbol name" },
      apply: { type: "boolean", description: "Apply rename (default false = preview only)" },
    },
    required: ["new_name"],
  },
};

const renameSchema = z.object({
  file: z.string().optional(),
  line: z.number().optional(),
  character: z.number().optional(),
  position: z.string().optional(),
  new_name: z.string(),
  apply: z.boolean().optional(),
});

export async function handleRename(ctx: LocusServerContext, args: unknown): Promise<CallToolResult> {
  const input = renameSchema.parse(args ?? {});
  const pos = parsePosition(input.position);
  const file = pos?.file ?? input.file;
  const line = pos?.line ?? input.line;
  const character = pos?.character ?? input.character;

  if (!file || line === undefined || character === undefined) {
    return textResult(errorResult("error", "Provide file+position or position string"));
  }

  const client = await getClientForSymbol(ctx, file);
  if (!client) {
    return textResult(errorResult("server_unavailable", `No LSP for ${file}`));
  }

  try {
    const prepared = await client.prepareRename(file, line, character);
    if (!prepared) {
      return textResult(errorResult("no_results", "Symbol cannot be renamed at this position"));
    }

    const edit = await client.rename(file, line, character, input.new_name);
    if (!edit?.changes && !edit?.documentChanges) {
      return textResult(errorResult("no_results", "Rename produced no changes"));
    }

    const changes = edit.changes ?? {};
    const preview = formatRenamePreview(changes, ctx.rootPath);

    if (!input.apply) {
      return textResult(okResult(preview, "Dry run — set apply=true to execute"));
    }

    // MVP: report preview; actual file writes delegated to host agent
    return textResult(
      okResult(
        `${preview}\n\nNote: apply=true returns the edit plan. Apply edits via host Edit tool.`,
        "Rename plan generated",
      ),
    );
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
