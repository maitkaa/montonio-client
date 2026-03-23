// CJS shim for uuid v13 (pure ESM) – test environment only
// Uses Node.js built-in crypto.randomUUID() which produces UUID v4 format
const { randomUUID } = require("node:crypto");
module.exports = { v4: randomUUID };
