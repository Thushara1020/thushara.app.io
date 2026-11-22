// Apply the saved preference before styles load, avoiding a flash of the other theme.
(function () {
  var saved;
  try { saved = localStorage.getItem('portfolio-theme'); } catch (_) {}
  var theme = saved === 'light' || saved === 'dark' ? saved :
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'light' ? '#f7f6f2' : '#0c0c12';
})();
