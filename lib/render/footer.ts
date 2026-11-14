/**
 * Site footer (approved Nov 2026, "Option B"): logo, social icons, then the page
 * directory, then the fine print. Swapped in at render time so the captured Webflow
 * pages in content/pages.json stay untouched; the original tilt <script> inside the
 * footer embed is kept byte for byte and drives the [data-f-tilt*] wrappers below.
 */

const NT = ' target="_blank" rel="noopener"'
const LOGO = 'https://cdn.prod.website-files.com/69ecc5fb6fc18880aa9fc6c6/69fe6c7428307ab091c9a49f_Coastline%20Films%20copy.png'

const GROUPS: [string, [string, string][]][] = [
  ['Studio', [['Work', '/work'], ['About', '/about'], ['Journal', '/journal'], ['Contact', '/contact']]],
  ['Services', [['Video Production', '/video-production'], ['Monthly Content Retainer', '/monthly-content-retainer'], ['Cost Calculator', '/video-production-cost-calculator']]],
  ['Locations', [['Squamish &amp; the Sea to Sky', '/squamish-videographer'], ['Muskoka &amp; Toronto', '/muskoka-toronto-videographer']]],
  ['Clients', [['Reviews', 'https://share.google/Eaw3GzggvqPVFXB1r'], ['Client Portal', 'https://portal.coastlinefilms.ca/login'], ['Book a discovery call', '/contact']]],
]

const STYLE = `<style>
  .footer-006 { padding: 96px 48px 48px; background: transparent; color: #E4DDCB; width: 100%; font-family: 'Neue Montreal', sans-serif; box-sizing: border-box; }
  .footer-006 * { box-sizing: border-box; }
  .footer-006-inner { max-width: 1312px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
  .footer-006-logo-link { display: flex; align-items: center; justify-content: center; text-decoration: none; }
  .footer-006-logo { height: 64px; width: auto; display: block; }

  /* socials */
  .footer-006-socials { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px 48px; margin-top: 40px; }
  .f-social-tilt, .f-froth-tilt { display: inline-flex; transform-style: preserve-3d; will-change: transform; padding: 20px; margin: -20px; }
  .footer-006-social { width: 36px; height: 36px; color: rgba(228,221,203,0.9); transition: color 0.3s ease; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }
  .footer-006-social svg { width: 36px; height: 36px; display: block; }
  .footer-006-social.ig:hover    { color: #E1306C; }
  .footer-006-social.vimeo:hover { color: #1AB7EA; }
  .footer-006-social.spot:hover  { color: #1DB954; }
  .footer-006-social.fb:hover    { color: #1877F2; }
  .footer-006-social.li:hover    { color: #0A66C2; }

  /* Frothing: grey and still like the other icons; colour and float ease in on hover */
  @property --froth-amp { syntax: '<number>'; inherits: true; initial-value: 0; }
  .footer-006-froth { --froth-amp: 0; transition: color 0.3s ease, --froth-amp 0.8s ease; }
  .footer-006-froth:hover { --froth-amp: 1; }
  .footer-006-froth .cf-bub { fill: none; stroke: currentColor; stroke-width: 2.4; transform-box: fill-box; transform-origin: center; transition: stroke 0.3s ease; animation: cf-bob 1.8s ease-in-out infinite; }
  .footer-006-froth .cf-dot { fill: currentColor; transition: fill 0.3s ease; }
  .footer-006-froth .cf-b1 { animation-delay: -0.2s; }
  .footer-006-froth .cf-b2 { animation-delay: -0.7s; }
  .footer-006-froth .cf-b3 { animation-delay: -1.1s; }
  .footer-006-froth .cf-b4 { animation-delay: -0.45s; }
  .footer-006-froth .cf-b5 { animation-delay: -1.4s; }
  .footer-006-froth:hover .cf-b1, .footer-006-froth:hover .cf-b4 { stroke: #0FB5A6; }
  .footer-006-froth:hover .cf-b2, .footer-006-froth:hover .cf-b5 { stroke: #1F7AE0; }
  .footer-006-froth:hover .cf-b3 { stroke: #F6921E; }
  .footer-006-froth:hover .cf-dot { fill: #2F6FB0; }
  @keyframes cf-bob {
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(calc(-4px * var(--froth-amp))) scale(calc(1 + 0.06 * var(--froth-amp))); }
  }

  /* page directory */
  .footer-006-cols { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px; width: 100%; margin-top: 96px; text-align: center; }
  .footer-006-col-h { margin: 0 0 20px; font-family: 'Neue Montreal', sans-serif; font-size: 11px; font-weight: 500; line-height: 1.4; letter-spacing: 0.14em; text-transform: uppercase; color: #7A736A; }
  .footer-006-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .f-tilt { display: inline-block; transform-style: preserve-3d; will-change: transform; padding: 18px 14px; margin: -18px -14px; }
  .footer-006-col a { font-family: 'Neue Montreal', sans-serif; font-size: 18px; font-weight: 500; line-height: 1.35; letter-spacing: -0.01em; color: rgba(228,221,203,0.55); text-decoration: none; transition: color 0.4s ease; }
  .footer-006-col a:hover { color: #E4DDCB; }

  /* fine print */
  .footer-006-bottom { width: 100%; margin-top: 96px; display: flex; justify-content: space-between; align-items: center; gap: 16px 32px; }
  .footer-006-copy { margin: 0; font-family: 'Space Mono', 'Neue Montreal', sans-serif; font-size: 10px; line-height: 1.8; letter-spacing: 0.10em; text-transform: uppercase; color: rgba(228,221,203,0.25); }
  .footer-006-copy a { color: rgba(228,221,203,0.45); text-decoration: none; transition: color 0.25s ease; }
  .footer-006-copy a:hover { color: #E4DDCB; }
  .footer-006-legal a + a { margin-left: 24px; }

  @media (max-width: 991px) {
    .footer-006 { padding: 72px 32px 40px; }
    .footer-006-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 48px 24px; margin-top: 72px; }
    .footer-006-bottom { margin-top: 72px; }
  }
  @media (max-width: 600px) {
    .footer-006 { padding: 56px 24px 32px; }
    .footer-006-logo { height: 52px; }
    .footer-006-socials { gap: 16px 32px; margin-top: 32px; }
    .footer-006-cols { margin-top: 56px; }
    .footer-006-col a { font-size: 16px; }
    .footer-006-bottom { flex-direction: column; text-align: center; margin-top: 56px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .footer-006-froth .cf-bub { animation: none; }
  }
</style>`

const ICON = (cls: string, href: string, label: string, svg: string) =>
  `<div class="f-social-tilt" data-f-tilt-icon><a href="${href}" class="footer-006-social ${cls}" aria-label="${label}"${NT}>${svg}</a></div>`

const SOCIALS = [
  ICON('ig', 'https://www.instagram.com/coastlinefilms', 'Instagram', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" ry="5"></rect><circle cx="12" cy="12" r="4"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>'),
  ICON('vimeo', 'https://vimeo.com/coastlinefilmsca', 'Vimeo', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 7c-.1 2-1.5 4.7-4.2 8.2-2.8 3.7-5.2 5.5-7.1 5.5-1.2 0-2.2-1.1-3-3.3-.6-2-1.1-4-1.7-6-.6-2.2-1.2-3.3-1.9-3.3-.2 0-.7.3-1.6.9L1.4 7.7c1-.8 1.9-1.7 2.8-2.6 1.3-1.1 2.2-1.7 2.9-1.7 1.6-.1 2.5 1 2.9 3.3.4 2.5.7 4 .9 4.6.5 2.2 1 3.3 1.6 3.3.4 0 1.1-.7 2-2.1.9-1.4 1.4-2.5 1.5-3.2.1-1.3-.4-2-1.5-2-.5 0-1 .1-1.5.3 1-3.3 3-4.9 5.9-4.8 2.1.1 3.1 1.5 3.1 4.2z"/></svg>'),
  ICON('spot', 'https://open.spotify.com/user/21pwagjllaopjreittv2q7mxy?si=6129e4e525c24eab', 'Spotify', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.6 14.4c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 4-.9 7.5-.5 10.3 1.2.3.2.4.6.2.9zm1.2-2.7c-.2.4-.7.5-1.1.3-2.8-1.7-7.1-2.2-10.4-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.8-1.1 8.5-.6 11.7 1.4.4.2.5.7.3 1zm.1-2.8C14.5 8.9 9 8.7 5.8 9.7c-.5.2-1.1-.1-1.2-.6-.2-.5.1-1.1.6-1.2 3.7-1.1 9.7-.9 13.5 1.4.5.3.6.9.4 1.4-.3.4-1 .6-1.4.2z"/></svg>'),
  ICON('fb', 'https://www.facebook.com/CoastlineFilms.ca', 'Facebook', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12z"/></svg>'),
  ICON('li', 'https://www.linkedin.com/company/coastline-films', 'LinkedIn', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>'),
  `<div class="f-froth-tilt" data-f-tilt-froth><a href="https://frothing.ca" class="footer-006-social footer-006-froth" aria-label="Frothing - Surf Break Finder"${NT}><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="cf-bub cf-b1" cx="15" cy="29" r="8.5"/><circle class="cf-bub cf-b2" cx="27" cy="32" r="6"/><circle class="cf-bub cf-b3" cx="31" cy="19" r="7.5"/><circle class="cf-bub cf-b4" cx="20" cy="15" r="4.5"/><circle class="cf-bub cf-b5" cx="11" cy="17" r="3.4"/><circle class="cf-dot" cx="12" cy="26" r="1.8"/><circle class="cf-dot" cx="29" cy="16" r="1.6"/></svg></a></div>`,
].join('\n      ')

const COLS = GROUPS.map(([title, links]) =>
  `<nav class="footer-006-col" aria-label="${title}"><h2 class="footer-006-col-h">${title}</h2><ul>${links
    .map(([t, h]) => `<li><div class="f-tilt" data-f-tilt><a href="${h}"${NT}>${t}</a></div></li>`)
    .join('')}</ul></nav>`,
).join('\n      ')

const MARKUP = `<footer class="footer-006">
  <div class="footer-006-inner">
    <a href="https://www.coastlinefilms.ca/" class="footer-006-logo-link" aria-label="Coastline Films home"><img class="footer-006-logo" src="${LOGO}" alt="Coastline Films"></a>
    <div class="footer-006-socials">
      ${SOCIALS}
    </div>
    <div class="footer-006-cols">
      ${COLS}
    </div>
    <div class="footer-006-bottom">
      <p class="footer-006-copy">© 2026 Coastline Films Corp. • Powered by the Great Outdoors • All rights reserved</p>
      <p class="footer-006-copy footer-006-legal"><a href="/privacy"${NT}>Privacy</a><a href="/terms"${NT}>Terms</a><a href="/sms-opt-in"${NT}>SMS Opt-in</a></p>
    </div>
  </div>
</footer>`

const EMBED_START = '<footer class="footer"><div class="code-embed-7 w-embed w-script"><style>'

/** Replace the footer's styles and markup, keeping the embed's tilt script. No-op on pages without the footer. */
export function applyFooter(html: string): string {
  const a = html.indexOf(EMBED_START)
  if (a === -1) return html
  const styleStart = a + EMBED_START.length - '<style>'.length
  const inner = html.indexOf('<footer class="footer-006">', styleStart)
  if (inner === -1) return html
  const innerEnd = html.indexOf('</footer>', inner)
  const script = html.indexOf('<script>', innerEnd)
  if (innerEnd === -1 || script === -1) return html
  return html.slice(0, styleStart) + STYLE + '\n\n' + MARKUP + '\n' + html.slice(innerEnd + '</footer>'.length)
}
