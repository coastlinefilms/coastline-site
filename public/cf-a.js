/* Coastline Films first-party analytics. No cookies, no personal data: random ids in localStorage only. */
(function () {
  if (navigator.webdriver || /bot|crawl|spider|preview|headless/i.test(navigator.userAgent)) return
  var d = document, w = window, s = d.currentScript
  var status = +((s && s.getAttribute('data-status')) || 200)
  function rid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }
  function store(k, make) { try { var v = localStorage.getItem(k); if (!v) { v = make(); localStorage.setItem(k, v) } return v } catch (e) { return make() } }
  var vid = store('cf_vid', rid)
  var sid
  try {
    var last = +localStorage.getItem('cf_sid_t') || 0
    sid = localStorage.getItem('cf_sid')
    if (!sid || Date.now() - last > 30 * 60 * 1000) { sid = rid(); localStorage.setItem('cf_sid', sid) }
  } catch (e) { sid = rid() }
  var pv = rid()
  function send(o) {
    o.pv = pv; o.sid = sid; o.vid = vid; o.path = location.pathname; o.host = location.hostname; o.status = status
    try { localStorage.setItem('cf_sid_t', String(Date.now())) } catch (e) {}
    var body = JSON.stringify(o)
    if (navigator.sendBeacon && navigator.sendBeacon('/api/collect', body)) return
    try { fetch('/api/collect', { method: 'POST', body: body, keepalive: true }) } catch (e) {}
  }
  var ref = ''
  try { if (d.referrer) { var r = new URL(d.referrer); if (r.hostname !== location.hostname) ref = r.hostname.replace(/^www\./, '') } } catch (e) {}
  var q = new URLSearchParams(location.search)
  send({ t: 'pageview', ref: ref, us: q.get('utm_source'), um: q.get('utm_medium'), uc: q.get('utm_campaign'), lang: navigator.language })

  // Engaged time (visible only) and max scroll depth, sent whenever the tab is hidden
  var since = d.visibilityState === 'visible' ? Date.now() : 0, total = 0, maxScroll = 0
  function onScroll() {
    var h = d.documentElement, room = h.scrollHeight - h.clientHeight
    var p = room > 0 ? Math.round((100 * (w.scrollY || h.scrollTop)) / room) : 100
    if (p > maxScroll) maxScroll = Math.min(100, p)
  }
  w.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  d.addEventListener('visibilitychange', function () {
    if (d.visibilityState === 'hidden') {
      if (since) { total += Date.now() - since; since = 0 }
      send({ t: 'leave', dur: total, scroll: maxScroll })
    } else since = Date.now()
  })

  // Clicks on buttons, links and Work cards
  d.addEventListener('click', function (e) {
    var t = e.target
    var el = t && t.closest && t.closest('a, button, [role="button"], .w-button, input[type="submit"], .work-cms-item')
    if (!el) return
    var href = el.getAttribute('href') || ''
    var label, kind
    if (el.classList.contains('work-cms-item')) {
      var n = el.querySelector('.work-project')
      label = 'Work: ' + (n ? n.textContent.trim() : 'card')
      kind = 'card'
    } else {
      label = (el.getAttribute('aria-label') || el.innerText || el.value || href || '').replace(/\s+/g, ' ').trim()
      kind = /^mailto:/.test(href) ? 'email' : /^tel:/.test(href) ? 'phone'
        : el.tagName !== 'A' || /button|btn|cta/i.test(el.className) ? 'button' : 'link'
    }
    send({ t: 'click', label: label.slice(0, 80), href: href.slice(0, 300), el: kind })
  }, true)
})()
