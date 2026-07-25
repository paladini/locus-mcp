/**
 * Fake LSP that accepts stdin but never responds to requests (for timeout tests).
 */
process.stdin.setEncoding("utf8");
process.stdin.on("data", () => {});
