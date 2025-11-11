const { contextBridge, ipcRenderer } = require("electron");

// Expose safe IPC API to renderer process
// This prevents direct access to Node.js and Electron APIs
contextBridge.exposeInMainWorld("api", {
  // Generic CRUD operations
  invoke: (channel, ...args) => {
    // Whitelist of allowed IPC channels to prevent arbitrary channel access
    const validChannels = [
      // Client operations
      "client:getAll",
      "client:getById",
      "client:create",
      "client:update",
      "client:delete",
      "client:search",
      "client:getWithRelations",

      // Case operations
      "case:getAll",
      "case:getById",
      "case:create",
      "case:update",
      "case:delete",
      "case:search",
      "case:getWithRelations",

      // Court Session operations
      "courtSession:getAll",
      "courtSession:getById",
      "courtSession:create",
      "courtSession:update",
      "courtSession:delete",
      "courtSession:search",
      "courtSession:getUpcoming",

      // Document operations
      "document:getAll",
      "document:getById",
      "document:create",
      "document:update",
      "document:delete",
      "document:search",

      // Invoice operations
      "invoice:getAll",
      "invoice:getById",
      "invoice:create",
      "invoice:update",
      "invoice:delete",
      "invoice:search",
      "invoice:getWithPayments",

      // Payment operations
      "payment:getAll",
      "payment:getById",
      "payment:create",
      "payment:update",
      "payment:delete",
      "payment:search",

      // Expense operations
      "expense:getAll",
      "expense:getById",
      "expense:create",
      "expense:update",
      "expense:delete",
      "expense:search",

      // Appointment operations
      "appointment:getAll",
      "appointment:getById",
      "appointment:create",
      "appointment:update",
      "appointment:delete",
      "appointment:search",
      "appointment:getUpcoming",

      // User operations
      "user:getAll",
      "user:getById",
      "user:create",
      "user:update",
      "user:delete",
      "user:search",

      // Setting operations
      "setting:getAll",
      "setting:getById",
      "setting:create",
      "setting:update",
      "setting:delete",
      "setting:search",

      // Dashboard and reports
      "dashboard:getStats",
      "reports:financial",

      // Export operations
      "export:data",
    ];

    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }

    // Reject invalid channels
    throw new Error(`Invalid IPC channel: ${channel}`);
  },
});
