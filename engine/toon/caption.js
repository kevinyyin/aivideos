// One-word-at-a-time caption of narrated explainer shorts: a heavy sans, white with a black stroke, lower middle,
// hard swaps on each word (no fades, no pops). words = [[t0, t1, 'word'], ...]. Lives in the page's #ui overlay.
// Optional keyword colour (several viral explainers colour the one word that matters, e.g. a red "IMPOSSIBLE"): words
// matching `keys` (RegExp) or carrying a 4th element { accent: true } are drawn in `accent`. The colour is static, so it
// keeps the house rule (no pulsing / popping text).
export function makeWordCaption(words, { y = 1352, size = 66, font = "'Avenir Next', 'Arial Rounded MT Bold', sans-serif", weight = 800, accent = '#ffd23f', keys = null } = {}) {
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;left:0;right:0;top:${y}px;transform:translateY(-50%);text-align:center;z-index:2;`
    + `font-family:${font};font-weight:${weight};font-size:${size}px;line-height:1;color:#fff;letter-spacing:-0.01em;`
    + `-webkit-text-stroke:${(size * 0.16).toFixed(1)}px #000;paint-order:stroke fill;`
    + `text-shadow:0 ${(size * 0.05).toFixed(1)}px ${(size * 0.08).toFixed(1)}px rgba(0,0,0,.55);`;
  document.getElementById('ui').appendChild(el);
  let last = null;
  function update(t) {
    const w = words.find(([a, b]) => t >= a && t < b);
    const txt = w ? w[2] : '';
    if (txt !== last) {
      el.textContent = txt; last = txt;
      el.style.color = w && ((w[3] && w[3].accent) || (keys && txt.match(keys))) ? accent : '#fff';
    }
  }
  return { el, update };
}
