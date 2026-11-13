/* Home page cursor: an eased dot with a thin trailing line (modelled on mosaic.com). Desktop / mouse only. */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches) return
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  var NS = 'http://www.w3.org/2000/svg', N = 12, EASE = reduce ? 1 : 0.15
  var wrap = document.createElement('div')
  wrap.setAttribute('aria-hidden', 'true')
  wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;contain:strict;overflow:hidden;mix-blend-mode:difference;opacity:0;transition:opacity .3s cubic-bezier(.3,.1,.1,1)'
  var svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%')
  svg.style.display = 'block'
  var line = document.createElementNS(NS, 'polyline')
  line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#e4ddcb'); line.setAttribute('stroke-width', '1')
  line.setAttribute('stroke-linecap', 'round'); line.setAttribute('stroke-linejoin', 'round')
  var dot = document.createElementNS(NS, 'circle')
  dot.setAttribute('r', '3'); dot.setAttribute('fill', '#e4ddcb')
  if (!reduce) svg.appendChild(line)
  svg.appendChild(dot)
  wrap.appendChild(svg)

  var tx = 0, ty = 0, x = 0, y = 0, started = false, running = false
  var pts = new Float32Array(N * 2), head = 0

  function frame() {
    x += (tx - x) * EASE; y += (ty - y) * EASE
    if (Math.abs(tx - x) < 0.1) x = tx
    if (Math.abs(ty - y) < 0.1) y = ty
    dot.setAttribute('cx', x); dot.setAttribute('cy', y)
    pts[head] = x; pts[head + 1] = y
    head = (head + 2) % (N * 2)
    var s = '', still = true
    for (var i = 0; i < N; i++) {
      var k = (head + i * 2) % (N * 2)
      s += pts[k] + ' ' + pts[k + 1] + (i < N - 1 ? ',' : '')
      if (pts[k] !== x || pts[k + 1] !== y) still = false
    }
    line.setAttribute('points', s)
    // Sleep once the dot has settled and the tail has fully caught up
    if (still && x === tx && y === ty) { running = false; return }
    requestAnimationFrame(frame)
  }
  function wake() { if (!running) { running = true; requestAnimationFrame(frame) } }

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return
    tx = e.clientX; ty = e.clientY
    if (!started) {
      started = true; x = tx; y = ty
      for (var i = 0; i < N * 2; i += 2) { pts[i] = x; pts[i + 1] = y }
    }
    wrap.style.opacity = '1'
    wake()
  }, { passive: true })
  document.documentElement.addEventListener('mouseleave', function () { wrap.style.opacity = '0' })
  document.addEventListener('mouseenter', function () { if (started) wrap.style.opacity = '1' })

  function mount() { document.body.appendChild(wrap) }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount)
})()
