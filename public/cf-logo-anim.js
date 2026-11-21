/* Header logo reveal on hover (Nov 2026).
 * Source: Coastline_Films_Logo_Reveal_Swirl_White_4K_24fps_ProRes4444_Alpha.mov (4K, 19 MB).
 * Processed to /logo-reveal-v1.webp: the 43-frame reveal (the hold after it dropped), each frame resampled
 * into the header PNG's own coordinates so the last frame sits exactly on the static logo, recoloured to
 * bone #E4DDCB, duplicates removed (30 unique frames), 400x125 per frame (3x a 40px logo), lossless with alpha.
 *
 * At rest the page always shows the normal logo image. On hover a canvas plays the reveal over it, then the
 * logo image comes back underneath and the canvas fades off it. Desktop mouse only (nothing on phones or
 * tablets), off for reduced motion, and the sprite loads only after the page has finished loading. */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  var M = {
    src: '/logo-reveal-v1.webp', w: 400, h: 125, cols: 6, fps: 24,
    top: -4.1667, height: 104.1667, /* frame area vs the logo box, in % of its height: the swirl rises just above the letters */
    t: [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29]
  }

  var link = document.querySelector('.cf-nav__logo')
  var img = link && link.querySelector('img')
  if (!img) return

  var sprite = null, cv = null, cx = null, playing = false

  function setup() {
    if (getComputedStyle(link).position === 'static') link.style.position = 'relative'
    cv = document.createElement('canvas')
    cv.width = M.w
    cv.height = M.h
    cv.className = 'cf-nav__logo-anim'
    cv.setAttribute('aria-hidden', 'true')
    cv.style.cssText = 'position:absolute;left:0;top:' + M.top + '%;width:100%;height:' + M.height + '%;pointer-events:none;opacity:0'
    link.appendChild(cv)
    cx = cv.getContext('2d')
    link.addEventListener('mouseenter', play)
  }

  function draw(i) {
    var c = i % M.cols, r = (i / M.cols) | 0
    cx.clearRect(0, 0, M.w, M.h)
    cx.drawImage(sprite, c * M.w, r * M.h, M.w, M.h, 0, 0, M.w, M.h)
  }

  function play() {
    if (playing || !sprite) return
    playing = true
    draw(M.t[0])
    cv.style.transition = 'none'
    cv.style.opacity = '1'
    img.style.transition = 'none'
    img.style.opacity = '0'
    var t0 = performance.now(), shown = -1
    requestAnimationFrame(function tick(now) {
      var k = Math.floor(Math.max(0, now - t0) * M.fps / 1000)
      if (k >= M.t.length) return finish()
      if (M.t[k] !== shown) { draw(M.t[k]); shown = M.t[k] }
      requestAnimationFrame(tick)
    })
  }

  /* The last frame matches the logo image, so bring the image back underneath and fade the canvas off it */
  function finish() {
    draw(M.t[M.t.length - 1])
    img.style.opacity = '1'
    requestAnimationFrame(function () {
      cv.style.transition = 'opacity .18s ease'
      cv.style.opacity = '0'
      setTimeout(function () {
        img.style.transition = ''
        img.style.opacity = ''
        playing = false
      }, 220)
    })
  }

  function load() {
    var s = new Image()
    s.decoding = 'async'
    s.onload = function () {
      var ready = function () { sprite = s; setup() }
      if (s.decode) s.decode().then(ready, ready)
      else ready()
    }
    s.src = M.src
  }

  function whenIdle() {
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 3000 })
    else setTimeout(load, 1200)
  }

  if (document.readyState === 'complete') whenIdle()
  else window.addEventListener('load', whenIdle)
})()
