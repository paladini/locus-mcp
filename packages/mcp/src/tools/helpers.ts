import type { LocusResult } from "@locus-dev/core";
import type { LspClient } from "@locus-dev/core";

export function handleLspError(err: unknown): LocusResult {
  const message = err instanceof Error ? err.message : String(err);

  if (message === "server_starting") {
    return { status: "server_starting", message: "Language server is still starting. Retry in a few seconds or call status/warm." };
  }

  if (message === "server_unavailable") {
    return { status: "server_unavailable", message: "Language server is unavailable. Run `locus check` to verify binaries." };
  }

  if (message.includes("timed out")) {
    return { status: "server_starting", message: message };
  }

  return { status: "error", message };
}

export async function getClientForSymbol(
  ctx: { manager: { getClientForFile: (f: string) => Promise<LspClient | undefined> } },
  filePath: string,
): Promise<LspClient | undefined> {
  return ctx.manager.getClientForFile(filePath);
}

export function parsePosition(input?: string): { file: string; line: number; character: number } | undefined {
  if (!input) return undefined;

  const match = input.match(/^(.+?):(\d+):(\d+)$/);
  if (!match) return undefined;

  return {
    file: match[1]!,
    line: Number.parseInt(match[2]!, 10) - 1,
    character: Number.parseInt(match[3]!, 10) - 1,
  };
}
