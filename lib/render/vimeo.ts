/**
 * Poster frames for click-to-play Vimeo embeds, from Vimeo's public oEmbed endpoint.
 * Cached for a week in the data cache; a slow or failed lookup just falls back (never blocks a page long).
 */
export async function vimeoPosters(ids: (string | null | undefined)[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter((v): v is string => !!v && /^\d+$/.test(v)))]
  const out: Record<string, string> = {}
  await Promise.all(
    unique.map(async (id) => {
      try {
        const res = await fetch(
          `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}&width=1920`,
          { cache: 'force-cache', next: { revalidate: 604800 }, signal: AbortSignal.timeout(2500) },
        )
        if (!res.ok) return
        const j = (await res.json()) as { thumbnail_url?: string }
        if (j.thumbnail_url && /^https:\/\/i\.vimeocdn\.com\//.test(j.thumbnail_url)) out[id] = j.thumbnail_url
      } catch {
        // no poster: the embed shows the project's header image instead
      }
    }),
  )
  return out
}
