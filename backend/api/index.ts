import path from "path";
import Module from "module";

type ResolveFilename = (request: string, parent: unknown, isMain: boolean, options?: unknown) => string;

const moduleLoader = Module as unknown as { _resolveFilename: ResolveFilename };
const originalResolveFilename = moduleLoader._resolveFilename;

moduleLoader._resolveFilename = function resolveAlias(request: string, parent: unknown, isMain: boolean, options?: unknown) {
  if (request.startsWith("@/")) {
    return originalResolveFilename.call(this, path.join(__dirname, "..", "src", request.slice(2)), parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const { app } = require("../src/app");

export default app;
