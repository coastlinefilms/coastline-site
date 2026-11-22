/**
 * Site-wide readability and touch fixes from the Nov 2026 audit, applied to every public page.
 * Kept in one place because the underlying styles live in many exported page blocks.
 *  - Small labels go from 11px to 12px, and the faintest ones get enough contrast to read on dark.
 *  - Touch targets reach 44px on phones (nav button, share buttons) and the carousel dots get a
 *    bigger invisible hit area without changing how they look.
 */
const CSS = `<style id="cf-audit-fixes">
.why-stat-label,.cf-test-role,.cap-caption-label,.lp-price__label,.lp-proj__meta,.ab-person__role,.lp-logos span,[class^="lp-"] small,.lp-stat small{font-size:12px!important;letter-spacing:.06em}
.why-stat-label,.cf-test-role,.lp-price__label,.ab-person__role,[class^="lp-"] small,.lp-stat small{color:rgba(228,221,203,.72)!important}
.lp-proj__meta,.lp-logos span{color:#A29B90!important}
.cf-land-ack__text{font-size:12px!important;color:#9A948A!important}
.footer-006-copy a{color:rgba(228,221,203,.62)!important}
.cf-flow__dot{position:relative}
.cf-flow__dot::after{content:"";position:absolute;left:-6px;right:-6px;top:-18px;bottom:-18px}
@media (max-width:767px){
  .cf-nav__cta{min-height:44px}
  .cf-share-btn{width:44px!important;height:44px!important}
}
</style>`

export function auditFixes(html: string): string {
  const i = html.indexOf('</head>')
  return i === -1 ? html : html.slice(0, i) + CSS + html.slice(i)
}
