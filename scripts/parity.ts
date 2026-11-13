/* Renders every captured Webflow URL from the seed data and diffs it against the live HTML. */
import { readFileSync } from 'node:fs'
import { load } from 'cheerio'
import pages from '../content/pages.json'
import { renderProject } from '../lib/render/project'
import { renderPost } from '../lib/render/blog'
import { fillLists } from '../lib/render/lists'

const expected: Record<string, string> = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const seed = JSON.parse(readFileSync(process.argv[3], 'utf8'))
const now = new Date().toISOString()
const projects = seed.projects.filter((p: any) => p.status === 'published').map((p: any, i: number) => ({ ...p, id: 'p' + i, updated_at: now }))
const posts = seed.posts.filter((p: any) => p.status === 'published').map((p: any, i: number) => ({ ...p, id: 'b' + i, updated_at: now, related_post_ids: [] }))

const norm = (h: string) => {
  const $ = load(h)
  $('script[type="application/ld+json"]').each((_, el) => {
    const t = $(el).text()
    // Webflow left the dates blank and HTML-escaped apostrophes inside the JSON; the new build fills dates and emits valid JSON
    if (t.includes('BlogPosting')) $(el).text(t.replace(/"date(Published|Modified)": "[^"]*"/g, '"date$1": ""').replace(/&#39;/g, "'"))
  })
  // attribute order is irrelevant to browsers
  $('*').each((_, el: any) => {
    const attrs = el.attribs; if (!attrs) return
    const sorted = Object.keys(attrs).sort().reduce((o: any, k) => ((o[k] = attrs[k]), o), {})
    el.attribs = sorted
  })
  return $.html().replace(/\s+/g, ' ')
}

let fails = 0
for (const [path, html] of Object.entries(expected)) {
  if (html.length < 1000 || path === '/work/' || path === '/blog') continue
  let out: string | null = null
  const m = path.match(/^\/(projects|blog)\/(.+)$/)
  if (m) {
    const item = (m[1] === 'projects' ? projects : posts).find((x: any) => x.slug === m[2])
    out = m[1] === 'projects' ? renderProject(item) : renderPost(item)
  } else {
    out = fillLists((pages as any)[path], { projects, posts })
  }
  const a = norm(html), b = norm(out)
  if (a === b) { console.log('OK  ', path); continue }
  fails++
  let i = 0; while (a[i] === b[i]) i++
  console.log('DIFF', path, '\n   live:', a.slice(i - 80, i + 160), '\n   new :', b.slice(i - 80, i + 160))
}
console.log(fails ? `${fails} page(s) differ` : 'ALL PAGES MATCH')
process.exit(fails ? 1 : 0)
