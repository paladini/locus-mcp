import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { extname } from "node:path";
import type { LanguageServerConfig } from "../registry/registry.js";
import { BUILTIN_SERVERS } from "../registry/builtins.js";
import { LspClient } from "./client.js";
import type { ServerState } from "./types.js";

export interface ServerStatus {
  languageId: string;
  extensions: string[];
  command: string;
  state: ServerState;
  binaryAvailable: boolean;
  serverInfo?: { name: string; version?: string };
  openDocuments: number;
  warmed: boolean;
}

export class LspManager {
  private clients = new Map<string, LspClient>();
  private warmedLanguages = new Set<string>();
  private readonly rootPath: string;
  private readonly configs: LanguageServerConfig[];

  constructor(rootPath: string, configs?: LanguageServerConfig[]) {
    this.rootPath = rootPath;
    this.configs = configs ?? BUILTIN_SERVERS;
  }

  getConfigs(): LanguageServerConfig[] {
    return this.configs;
  }

  configForExtension(ext: string): LanguageServerConfig | undefined {
    const normalized = ext.startsWith(".") ? ext : `.${ext}`;
    return this.configs.find((c) => c.extensions.includes(normalized));
  }

  configForFile(filePath: string): LanguageServerConfig | undefined {
    return this.configForExtension(extname(filePath));
  }

  async getClientForFile(filePath: string): Promise<LspClient | undefined> {
    const config = this.configForFile(filePath);
    if (!config) return undefined;

    let client = this.clients.get(config.id);
    if (!client) {
      client = new LspClient({ rootPath: this.rootPath, serverConfig: config });
      this.clients.set(config.id, client);
    }

    if (client.serverState === "stopped" || client.serverState === "unavailable") {
      try {
        await client.start();
      } catch {
        return client;
      }
    }

    return client;
  }

  async warm(languageIds?: string[]): Promise<void> {
    const targets = languageIds?.length
      ? this.configs.filter((c) => languageIds.includes(c.languageId))
      : this.configs;

    for (const config of targets) {
      let client = this.clients.get(config.id);
      if (!client) {
        client = new LspClient({ rootPath: this.rootPath, serverConfig: config });
        this.clients.set(config.id, client);
      }

      try {
        await client.start();
        this.warmedLanguages.add(config.languageId);
      } catch {
        // Skip unavailable servers during warm
      }
    }
  }

  async status(): Promise<ServerStatus[]> {
    const statuses: ServerStatus[] = [];

    for (const config of this.configs) {
      const binaryAvailable = await isBinaryAvailable(config.command);
      const client = this.clients.get(config.id);

      statuses.push({
        languageId: config.languageId,
        extensions: config.extensions,
        command: config.command,
        state: client?.serverState ?? "stopped",
        binaryAvailable,
        serverInfo: client?.info,
        openDocuments: client?.getOpenDocuments().length ?? 0,
        warmed: this.warmedLanguages.has(config.languageId),
      });
    }

    return statuses;
  }

  async stopAll(): Promise<void> {
    for (const client of this.clients.values()) {
      await client.stop();
    }
    this.clients.clear();
    this.warmedLanguages.clear();
  }
}

async function isBinaryAvailable(command: string): Promise<boolean> {
  if (command.includes("/") || command.includes("\\")) {
    try {
      await access(command, constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }

  const lookup = process.platform === "win32" ? "where" : "which";
  const { spawn } = await import("node:child_process");

  return new Promise((resolve) => {
    const proc = spawn(lookup, [command], { shell: true, stdio: "ignore" });
    proc.on("exit", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}
