/*
 * Booking conversions (Nov 2026). Runs on the "you're booked" pages the calendars redirect to.
 * Sends Meta Lead + Schedule and GA4 generate_lead + book_appointment, once per booking (per tab session).
 * /call-confirmed already sends Meta Schedule from metaleadevents-1.1.0.js, so only Lead is added there.
 */
(function () {
  var s = document.currentScript
  var kind = (s && s.getAttribute('data-kind')) || 'Discovery call'
  var skipSchedule = s && s.getAttribute('data-skip-schedule') === '1'
  var key = 'cf_conv_' + location.pathname + (location.search || '')
  try { if (sessionStorage.getItem(key) === '1') return } catch (e) {}

  var params = { content_name: kind + ' booked', content_category: 'Booking' }
  var tries = 0, metaDone = false, gaDone = false
  function send() {
    if (!metaDone && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', params)
      if (!skipSchedule) window.fbq('track', 'Schedule', params)
      metaDone = true
    }
    if (!gaDone && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { lead_source: kind })
      window.gtag('event', 'book_appointment', { appointment_type: kind })
      gaDone = true
    }
    if (metaDone && gaDone) {
      try { sessionStorage.setItem(key, '1') } catch (e) {}
      return
    }
    // the tags load async; keep checking for ~8s
    if (++tries < 40) setTimeout(send, 200)
    else try { sessionStorage.setItem(key, '1') } catch (e) {}
  }
  send()
})()
