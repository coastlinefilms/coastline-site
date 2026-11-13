import assetMap from '@/content/asset-map.json'

// Old (Webflow CDN / legacy host) URL -> self-hosted URL.
// Starts with the Webflow CSS/JS bundles in /public/wf; the one-time media
// migration (/api/setup/migrate-assets) adds every image, font and video.
const MAP = new Map<string, string>(Object.entries(assetMap as Record<string, string>))

const EXTERNAL =
  /https:\/\/(?:cdn\.prod\.website-files\.com|app-assets\.website-files\.com|d3e54v103j8qbb\.cloudfront\.net|website-delta-orpin-66\.vercel\.app)\/[^\s"'()<>\\&]+/g

export function rewriteUrl(url: string): string {
  return MAP.get(url) ?? url
}

/** Swap every migrated asset URL in a document, then drop SRI hashes on self-hosted bundles. */
export function rewriteAssets(html: string): string {
  let out = html.replace(EXTERNAL, (m) => {
    // srcset entries / CSS can end with punctuation that is not part of the URL
    const trail = m.match(/[,;]+$/)?.[0] ?? ''
    const core = trail ? m.slice(0, -trail.length) : m
    return (MAP.get(core) ?? core) + trail
  })
  // Same-origin bundles don't need (and must not keep) the Webflow SRI hashes
  out = out.replace(/<(script|link)\b[^>]*>/g, (tag) =>
    /(?:src|href)="\/wf\//.test(tag)
      ? tag.replace(/\s+integrity="[^"]*"/, '').replace(/\s+crossorigin="[^"]*"/, '')
      : tag,
  )
  // The preconnect to Webflow's CDN is no longer needed once media is migrated
  return out
}
