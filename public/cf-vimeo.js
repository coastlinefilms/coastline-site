/*
 * Click-to-play Vimeo (Nov 2026). Pages show a poster with a play button (.cf-vf) and only load
 * Vimeo's player (about 1 MB of scripts) when someone presses play. The player then starts on its own.
 * Fires "cf-vimeo-loaded" on the wrapper so other scripts (the home reel tilt) can talk to the player.
 */
(function () {
  function load(box) {
    if (!box || box.getAttribute('data-loaded') === '1') return
    var id = box.getAttribute('data-vimeo')
    if (!id || !/^\d+$/.test(id)) return
    var hash = box.getAttribute('data-h')
    var src = 'https://player.vimeo.com/video/' + id + '?title=0&byline=0&portrait=0&autoplay=1&dnt=1' + (hash && /^[a-f0-9]+$/i.test(hash) ? '&h=' + hash : '')
    var f = document.createElement('iframe')
    f.src = src
    f.title = box.getAttribute('data-title') || 'Coastline Films video'
    f.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture')
    f.setAttribute('allowfullscreen', '')
    f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0'
    box.setAttribute('data-loaded', '1')
    box.appendChild(f)
    var poster = box.querySelector('.cf-vf__poster'), btn = box.querySelector('.cf-vf__play')
    f.addEventListener('load', function () {
      if (poster) poster.style.opacity = '0'
      if (btn) btn.remove()
      setTimeout(function () { if (poster) poster.remove() }, 400)
    })
    try { box.dispatchEvent(new CustomEvent('cf-vimeo-loaded', { bubbles: true, detail: { iframe: f } })) } catch (e) {}
    return f
  }
  window.cfVimeoLoad = load
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.cf-vf__play')
    if (b) { e.preventDefault(); load(b.closest('.cf-vf')) }
  })
})()
