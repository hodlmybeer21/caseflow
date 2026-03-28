// Shim for dynamic require in bundled ESM
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id.startsWith('node:')) {
    // Convert node: prefix to actual module name
    return originalRequire.call(this, id.slice(5));
  }
  return originalRequire.apply(this, arguments);
};
