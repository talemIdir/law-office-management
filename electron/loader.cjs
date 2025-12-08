// CommonJS loader that dynamically imports the ES module main file
(async () => {
  const { default: main } = await import('./main.js');
})();
