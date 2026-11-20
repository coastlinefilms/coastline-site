/* Home page card tilt (Nov 2026), modelled on refs.gallery: the card leans toward the mouse
 * (up to 10deg at the corners), grows 1.5%, and its shadow slides against the lean.
 * Applies to the reel (.why-video-wrap), the centre card of the work carousel (.cf-flow__card.is-active)
 * and the two "Two ways to work with us" cards (.sv-card). Desktop / mouse only, off for reduced motion.
 *
 * The reel is a Vimeo iframe, which swallows mouse events (so neither the tilt nor the trailing cursor
 * could see the mouse over it). A transparent shield now sits over the picture, leaving Vimeo's control
 * bar along the bottom uncovered; a click on the shield plays or pauses the reel through Vimeo's
 * postMessage API. */
/* Other pages reuse it through the script tag: data-cards is a selector list of cards to tilt
 * (default: the home service cards), data-strength scales the effect (the blog uses 0.64).
 * The reel runs at half strength. */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  var me = document.currentScript
  var S = parseFloat((me && me.getAttribute('data-strength')) || '1') || 1
  /* "selector" or "selector@factor", comma separated: .journal-featured@0.5 tilts at half the page strength */
  var CARDS = ((me && me.getAttribute('data-cards')) || '.sv-card').split(',').map(function (x) {
    var p = x.trim().split('@'); return { sel: p[0], k: parseFloat(p[1] || '1') || 1 }
  })
  var MAX = 10 * S, LIFT = 1 + 0.015 * S, SHIFT = 9 * S, EASE = 'cubic-bezier(0,0,.2,1)'
  var FAST = 'transform .2s ' + EASE + ', box-shadow .2s ' + EASE

  function shadow(px, py, k) {
    var sx = ((0.5 - px) * 2 * SHIFT * k).toFixed(1), sy = ((0.5 - py) * 2 * SHIFT * k).toFixed(1)
    return '0 30px 80px -45px rgba(0,0,0,.55), ' + sx + 'px ' + sy + 'px 44px -34px rgba(0,0,0,.35), 0 2px 10px rgba(0,0,0,.08)'
  }
  function angles(el, e, k) {
    var r = el.getBoundingClientRect()
    var px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    var py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    return { px: px, py: py, rx: ((py - 0.5) * 2 * MAX * k).toFixed(2), ry: ((0.5 - px) * 2 * MAX * k).toFixed(2) }
  }

  /* Plain cards: the reel and the two service cards */
  function tilt(el, k) {
    if (!el || el.__cfTilt) return
    k = k || 1
    var lift = (1 + (LIFT - 1) * k).toFixed(4)
    el.__cfTilt = true
    var base = getComputedStyle(el).transition
    el.style.transition = (base && base !== 'all 0s ease 0s' ? base + ', ' : '') + FAST
    el.style.willChange = 'transform'
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return
      var a = angles(el, e, k)
      el.style.transform = 'perspective(900px) rotateX(' + a.rx + 'deg) rotateY(' + a.ry + 'deg) scale(' + lift + ')'
      el.style.boxShadow = shadow(a.px, a.py, k)
    }, { passive: true })
    el.addEventListener('pointerleave', function () { flat(el) })
  }
  function flat(el) { el.style.transform = ''; el.style.boxShadow = '' }

  /* Work carousel: only the centre card tilts. Its resting transform belongs to the carousel. */
  function flow() {
    var stage = document.querySelector('.cf-flow__stage')
    if (!stage) return
    var REST = 'translateX(0) rotateY(0) scale(1)', current = null, timer = null
    function release(c, restore) {
      if (!c) return
      clearTimeout(timer)
      c.style.boxShadow = ''
      if (restore) c.style.transform = REST
      timer = setTimeout(function () { c.style.transition = '' }, 220)
      if (current === c) current = null
    }
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return
      var c = e.target.closest && e.target.closest('.cf-flow__card')
      if (!c || !c.classList.contains('is-active')) { if (current) release(current, current.classList.contains('is-active')); return }
      if (current !== c) {
        clearTimeout(timer)
        if (current) release(current, current.classList.contains('is-active'))
        current = c
        c.style.transition = FAST + ', opacity .7s cubic-bezier(.22,.61,.36,1), filter .7s cubic-bezier(.22,.61,.36,1)'
      }
      var a = angles(c, e, 1)
      c.style.transform = 'rotateX(' + a.rx + 'deg) rotateY(' + a.ry + 'deg) scale(' + LIFT + ')'
      c.style.boxShadow = shadow(a.px, a.py, 1)
    }, { passive: true })
    stage.addEventListener('pointerleave', function () { if (current) release(current, current.classList.contains('is-active')) })
    /* If the carousel moves on while a card is tilted, hand that card straight back to the carousel */
    var mo = new MutationObserver(function () {
      if (current && !current.classList.contains('is-active')) {
        var c = current; current = null
        c.style.transition = ''; c.style.boxShadow = ''
      }
    })
    ;[].slice.call(stage.querySelectorAll('.cf-flow__card')).forEach(function (c) { mo.observe(c, { attributes: true, attributeFilter: ['class'] }) })
  }

  /* Reel: shield the Vimeo iframe so the mouse stays visible to the page */
  function reel() {
    var wrap = document.querySelector('.why-video-wrap')
    var frame = wrap && wrap.querySelector('iframe')
    if (!frame) return
    var shield = document.createElement('button')
    shield.type = 'button'
    shield.className = 'cf-reel-shield'
    shield.setAttribute('aria-label', 'Play or pause the showreel')
    shield.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:64px;z-index:2;margin:0;padding:0;border:0;background:transparent;cursor:pointer;appearance:none;-webkit-appearance:none'
    wrap.appendChild(shield)

    var playing = false, origin = 'https://player.vimeo.com'
    function send(method, value) {
      var msg = { method: method }
      if (value !== undefined) msg.value = value
      try { frame.contentWindow.postMessage(JSON.stringify(msg), origin) } catch (_) {}
    }
    function listen() { send('addEventListener', 'play'); send('addEventListener', 'pause'); send('addEventListener', 'ended') }
    window.addEventListener('message', function (e) {
      if (e.origin !== origin || e.source !== frame.contentWindow) return
      var d = e.data
      if (typeof d === 'string') { try { d = JSON.parse(d) } catch (_) { return } }
      if (!d) return
      if (d.event === 'ready') listen()
      if (d.event === 'play') playing = true
      if (d.event === 'pause' || d.event === 'ended') playing = false
    })
    frame.addEventListener('load', listen)
    listen()
    shield.addEventListener('click', function () { send(playing ? 'pause' : 'play'); playing = !playing })

    /* Over Vimeo's own control bar the page loses the mouse again, so settle the tilt there */
    frame.addEventListener('pointerover', function () { flat(wrap) })
    tilt(wrap, 0.5)
  }

  function init() {
    reel()
    CARDS.forEach(function (c) { [].slice.call(document.querySelectorAll(c.sel)).forEach(function (el) { tilt(el, c.k) }) })
    flow()
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
