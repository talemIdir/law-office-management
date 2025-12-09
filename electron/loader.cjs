// CommonJS loader that dynamically imports the ES module main file
(async () => {
  try {
    await import('./main.js');
  } catch (error) {
    console.error('Failed to load main.js:', error);
    process.exit(1);
  }
})();
