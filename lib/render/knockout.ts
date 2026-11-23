import { parse, type Font } from 'opentype.js'

/**
 * Home hero "IGNORE." cutout (Nov 2026). The word used to be live <text> inside an SVG mask, and Safari
 * dropped a letter (the R) when drawing it from the web font. The letters are now drawn as vector
 * outlines from the same Neue Montreal Bold file, at the exact positions the browser used for the text,
 * so every browser shows the same shape and no font has to load for it.
 */
const BOLD = 'https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eeb79f82558bae2b9d0_NeueMontreal-Bold.otf'
const SIZE = 300
const BASELINE = 245
// x of each letter in the 1340 x 280 viewBox (measured from the live text, textLength 1236, centred on 670)
const LETTERS: [string, number][] = [
  ['I', 52], ['G', 141.84], ['N', 367.58], ['O', 586.72], ['R', 815.75], ['E', 1021.7], ['.', 1220.74],
]

let cached: Promise<string | null> | null = null

async function outlines(): Promise<string | null> {
  const res = await fetch(BOLD, { cache: 'force-cache' })
  if (!res.ok) return null
  const font: Font = parse(await res.arrayBuffer())
  const d = LETTERS.map(([ch, x]) => font.getPath(ch, x, BASELINE, SIZE).toPathData(2)).join('')
  return d || null
}

/** Swap the mask's <text>IGNORE.</text> for its outline path. Falls back to the text if anything fails. */
export async function knockoutOutlines(html: string): Promise<string> {
  const m = html.match(/<text x="670" y="245"[^>]*>IGNORE\.<\/text>/)
  if (!m) return html
  if (!cached) cached = outlines().catch(() => null)
  const d = await cached
  if (!d) {
    cached = null
    return html
  }
  return html.replace(m[0], `<path fill="#000" d="${d}"/>`)
}
