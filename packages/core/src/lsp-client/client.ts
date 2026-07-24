import { readFileSync, existsSync } from "node:fs";
import { extname, relative } from "node:path";
import type {
  Diagnostic,
  DocumentState,
  Hover,
  InitializeResult,
  Location,
  PublishDiagnosticsParams,
  ServerState,
  SymbolInformation,
  TextDocumentItem,
  WorkspaceEdit,
} from "./types.js";
import { LspConnection, filePathToUri, uriToFilePath } from "./connection.js";
import type { LanguageServerConfig } from "../registry/registry.js";

const DIAGNOSTIC_DEBOUNCE_MS = 150;

export interface LspClientOptions {
  rootPath: string;
  serverConfig: LanguageServerConfig;
  requestTimeoutMs?: number;
}

export class LspClient {
  readonly languageId: string;
  private connection: LspConnection;
  private state: ServerState = "stopped";
  private documents = new Map<string, DocumentState>();
  private diagnostics = new Map<string, Diagnostic[]>();
  private diagnosticTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private restartAttempts = 0;
  private readonly maxRestarts = 3;
  private initialized = false;
  private serverInfo?: { name: string; version?: string };

  constructor(private readonly options: LspClientOptions) {
    this.languageId = options.serverConfig.languageId;
    this.connection = this.createConnection();
  }

  get serverState(): ServerState {
    return this.state;
  }

  get info(): { name: string; version?: string } | undefined {
    return this.serverInfo;
  }

  getDiagnostics(uri?: string): Diagnostic[] {
    if (uri) {
      return this.diagnostics.get(uri) ?? [];
    }
    const all: Diagnostic[] = [];
    for (const diags of this.diagnostics.values()) {
      all.push(...diags);
    }
    return all;
  }

  getOpenDocuments(): DocumentState[] {
    return [...this.documents.values()];
  }

  async start(): Promise<void> {
    if (this.state === "ready") return;

    this.state = "starting";
    try {
      await this.connection.start();
      const rootUri = filePathToUri(this.options.rootPath);

      const initResult = await this.connection.request<InitializeResult>("initialize", {
        processId: process.pid,
        rootUri,
        capabilities: {
          workspace: {
            workspaceFolders: true,
            symbol: { dynamicRegistration: false },
          },
          textDocument: {
            synchronization: { dynamicRegistration: false, willSave: false, didSave: false },
            completion: { dynamicRegistration: false },
            hover: { contentFormat: ["markdown", "plaintext"] },
            references: { dynamicRegistration: false },
            documentSymbol: { dynamicRegistration: false },
            rename: { dynamicRegistration: false, prepareSupport: true },
            publishDiagnostics: { relatedInformation: false },
          },
        },
        workspaceFolders: [{ uri: rootUri, name: "workspace" }],
      });

      this.serverInfo = initResult.serverInfo;
      this.connection.notify("initialized", {});
      this.initialized = true;
      this.state = "ready";
      this.restartAttempts = 0;
    } catch (err) {
      this.state = "unavailable";
      throw err;
    }
  }

  async stop(): Promise<void> {
    for (const timer of this.diagnosticTimers.values()) {
      clearTimeout(timer);
    }
    this.diagnosticTimers.clear();
    await this.connection.stop();
    this.state = "stopped";
    this.initialized = false;
  }

  async restart(): Promise<void> {
    if (this.restartAttempts >= this.maxRestarts) {
      this.state = "unavailable";
      throw new Error("Maximum LSP restart attempts exceeded");
    }
    this.restartAttempts++;
    await this.stop();
    this.connection = this.createConnection();
    await this.start();

    for (const doc of this.documents.values()) {
      await this.didOpen(doc.uri, doc.languageId, doc.text, false);
    }
  }

  async didOpen(filePath: string, languageId?: string, text?: string, bumpVersion = true): Promise<void> {
    await this.ensureReady();

    const uri = filePath.startsWith("file:") ? filePath : filePathToUri(filePath);
    const content = text ?? (existsSync(uriToFilePath(uri)) ? readFileSync(uriToFilePath(uri), "utf8") : "");
    const lang = languageId ?? this.guessLanguageId(uri);

    const existing = this.documents.get(uri);
    const version = bumpVersion ? (existing?.version ?? 0) + 1 : (existing?.version ?? 1);

    const item: TextDocumentItem = { uri, languageId: lang, version, text: content };
    this.documents.set(uri, { uri, languageId: lang, version, text: content });

    if (!existing) {
      this.connection.notify("textDocument/didOpen", { textDocument: item });
    } else if (bumpVersion) {
      this.connection.notify("textDocument/didChange", {
        textDocument: { uri, version },
        contentChanges: [{ text: content }],
      });
    }
  }

  async didChange(filePath: string, text: string): Promise<void> {
    await this.ensureReady();
    const uri = filePath.startsWith("file:") ? filePath : filePathToUri(filePath);
    const existing = this.documents.get(uri);
    const version = (existing?.version ?? 0) + 1;
    const languageId = existing?.languageId ?? this.guessLanguageId(uri);

    this.documents.set(uri, { uri, languageId, version, text });
    this.connection.notify("textDocument/didChange", {
      textDocument: { uri, version },
      contentChanges: [{ text }],
    });
  }

  async workspaceSymbol(query: string): Promise<SymbolInformation[]> {
    await this.ensureReady();
    const result = await this.connection.request<SymbolInformation[] | null>("workspace/symbol", { query });
    return result ?? [];
  }

  async documentSymbol(filePath: string): Promise<SymbolInformation[]> {
    await this.ensureReady();
    const uri = filePath.startsWith("file:") ? filePath : filePathToUri(filePath);
    await this.didOpen(uriToFilePath(uri));

    const symbols = await this.connection.request<
      import("./types.js").DocumentSymbol[] | SymbolInformation[] | null
    >("textDocument/documentSymbol", { textDocument: { uri } });

    if (!symbols) return [];

    if (symbols.length > 0 && "location" in symbols[0]!) {
      return symbols as SymbolInformation[];
    }

    return flattenDocumentSymbols(symbols as import("./types.js").DocumentSymbol[], uri);
  }

  async references(filePath: string, line: number, character: number, includeDeclaration = true): Promise<Location[]> {
    await this.ensureReady();
    const uri = filePath.startsWith("file:") ? filePath : filePathToUri(filePath);
    await this.didOpen(uriToFilePath(uri));

    const result = await this.connection.request<Location[] | null>("textDocument/references", {
      textDocument: { uri },
      position: { line, character },
      context: { includeDeclaration },
    });
    return result ?? [];
  }

  async implementation(filePath: string, line: number, character: number): Promise<Location[]> {
    await this.ensureReady();
    const uri = filePath.startsWith("file:") ? filePath : filePathToUri(filePath);
    await this.didOpen(uriToFilePath(uri));

    const result = await this.connection.request<Location[] | null>("textDocument/implementation", {
      textDocument: { uri },
      position: { line, character },
    });
    return result ?? [];
  }

  async hover(filePath: string, line: number, character: number): Promise<Hover | null> {
    await this.ensureReady();
    const uri = filePath.startsWith("file:") ? filePath : filePathToUri(filePath);
    await this.didOpen(uriToFilePath(uri));

    return this.connection.request<Hover | null>("textDocument/hover", {
      textDocument: { uri },
      position: { line, character },
    });
  }

  async prepareRename(filePath: string, line: number, character: number): Promise<{ range: import("./types.js").Range } | null> {
    await this.ensureReady();
    const uri = filePath.startsWith("file:") ? filePath : filePathToUri(filePath);
    await this.didOpen(uriToFilePath(uri));

    try {
      return await this.connection.request("textDocument/prepareRename", {
        textDocument: { uri },
        position: { line, character },
      });
    } catch {
      return null;
    }
  }

  async rename(filePath: string, line: number, character: number, newName: string): Promise<WorkspaceEdit | null> {
    await this.ensureReady();
    const uri = filePath.startsWith("file:") ? filePath : filePathToUri(filePath);
    await this.didOpen(uriToFilePath(uri));

    return this.connection.request<WorkspaceEdit | null>("textDocument/rename", {
      textDocument: { uri },
      position: { line, character },
      newName,
    });
  }

  async definition(filePath: string, line: number, character: number): Promise<Location | Location[] | null> {
    await this.ensureReady();
    const uri = filePath.startsWith("file:") ? filePath : filePathToUri(filePath);
    await this.didOpen(uriToFilePath(uri));

    return this.connection.request("textDocument/definition", {
      textDocument: { uri },
      position: { line, character },
    });
  }

  private createConnection(): LspConnection {
    const { command, args, env } = this.options.serverConfig;
    return new LspConnection(
      {
        command,
        args,
        cwd: this.options.rootPath,
        env,
        requestTimeoutMs: this.options.requestTimeoutMs,
      },
      {
        onNotification: (method, params) => {
          if (method === "textDocument/publishDiagnostics") {
            this.handleDiagnostics(params as PublishDiagnosticsParams);
          }
        },
        onExit: () => {
          if (this.state === "ready" || this.state === "starting") {
            this.state = "unavailable";
          }
        },
      },
    );
  }

  private handleDiagnostics(params: PublishDiagnosticsParams): void {
    const existing = this.diagnosticTimers.get(params.uri);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.diagnostics.set(params.uri, params.diagnostics);
      this.diagnosticTimers.delete(params.uri);
    }, DIAGNOSTIC_DEBOUNCE_MS);

    this.diagnosticTimers.set(params.uri, timer);
  }

  private async ensureReady(): Promise<void> {
    if (this.state === "starting") {
      throw new Error("server_starting");
    }
    if (this.state === "unavailable") {
      throw new Error("server_unavailable");
    }
    if (!this.initialized) {
      await this.start();
    }
  }

  private guessLanguageId(uri: string): string {
    const ext = extname(uriToFilePath(uri)).toLowerCase();
    const map: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescriptreact",
      ".js": "javascript",
      ".jsx": "javascriptreact",
      ".py": "python",
      ".go": "go",
      ".rs": "rust",
    };
    return map[ext] ?? this.languageId;
  }
}

function flattenDocumentSymbols(
  symbols: import("./types.js").DocumentSymbol[],
  uri: string,
  containerName?: string,
): SymbolInformation[] {
  const result: SymbolInformation[] = [];

  for (const symbol of symbols) {
    const qualified = containerName ? `${containerName}.${symbol.name}` : symbol.name;
    result.push({
      name: qualified,
      kind: symbol.kind,
      location: { uri, range: symbol.selectionRange },
      containerName,
    });

    if (symbol.children?.length) {
      result.push(...flattenDocumentSymbols(symbol.children, uri, qualified));
    }
  }

  return result;
}

export function relativePath(rootPath: string, uri: string): string {
  return relative(rootPath, uriToFilePath(uri)).replace(/\\/g, "/");
}
