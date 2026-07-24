import { loadConfig, createRegistry, LspManager, SymbolResolver } from "@locus-dev/core";
import type { LanguageServerConfig } from "@locus-dev/core";

export interface LocusServerContext {
  rootPath: string;
  manager: LspManager;
  resolver: SymbolResolver;
  configs: LanguageServerConfig[];
}

export function createLocusContext(cwd: string = process.cwd()): LocusServerContext {
  const { config, rootPath } = loadConfig(cwd);
  const registry = createRegistry(config);
  const configs = registry.list();

  return {
    rootPath,
    manager: new LspManager(rootPath, configs),
    resolver: new SymbolResolver({ rootPath }),
    configs,
  };
}

export async function shutdownContext(ctx: LocusServerContext): Promise<void> {
  await ctx.manager.stopAll();
}
