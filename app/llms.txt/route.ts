import { SITE } from '@/lib/render/util'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

// /llms.txt (Nov 2026 AI visibility audit): a plain-language summary of the business for
// AI assistants and crawlers. Facts only, matching the site. Update it when prices,
// services, service areas or contact details change. No street address on purpose.
const BODY = `# Coastline Films

> Premium video and photo production company (Coastline Films Corp.), founded in 2020 and based in Squamish, British Columbia, serving BC and Ontario. Brand films, commercials, campaigns, documentary and monthly content retainers. Website: coastlinefilms.ca. Not affiliated with other companies using the Coastline Films name outside Canada.

## Services
- Monthly Content Retainer: one planned shoot a month, with cinematic reels and photos ready to post. From $1,800/month CAD. ${SITE}/monthly-content-retainer
- One-off productions: brand films, commercials, campaigns and documentary, planned, shot and finished start to finish, with cut-downs for social. Custom quote. ${SITE}/video-production

## Specialties
Brand films, commercial and campaign work, tourism and hospitality, real estate and custom home builders, outdoor and lifestyle brands, documentary and long-form.

## Where we work
British Columbia: Squamish, Whistler, Vancouver, North Vancouver, West Vancouver, Sunshine Coast, Vancouver Island (Victoria, Tofino, Ucluelet, Nanaimo).
Ontario: Muskoka and Toronto.
We travel for work across Canada.

## Selected clients
Toyota Canada, National Geographic x Maple Leaf Adventures, Rentals.ca, Tourism New Brunswick, Black Rock Resort (Ucluelet), Muskoka Sauna Co., Bredin Brothers, HLD Muskoka, Pride Marine Group, Muskoka Forever, Outbound Station, Happy Dad.

## Team
Jacob DeGrace (founder, director, cinematographer, editor), Pierre-Luc Arseneau (director of photography), Brodie DeGrace (photographer, underwater cinematography).

## Contact
Email: jacob@coastlinefilms.ca
Free 15-minute discovery call: ${SITE}/contact

## Key pages
- Home: ${SITE}/
- Work: ${SITE}/work
- About: ${SITE}/about
- Monthly content retainer: ${SITE}/monthly-content-retainer
- Video production: ${SITE}/video-production
- Squamish and Sea to Sky video production: ${SITE}/squamish-videographer
- Muskoka and Toronto video production: ${SITE}/muskoka-toronto-videographer
- Video production cost calculator: ${SITE}/video-production-cost-calculator
- Video production cost in Vancouver (2026): ${SITE}/blog/video-production-cost-vancouver
- Video production cost in Ontario (2026): ${SITE}/blog/video-production-cost-ontario
- Videography for custom home builders: ${SITE}/blog/videography-custom-home-builders
`

export async function GET() {
  return new Response(BODY, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=86400' },
  })
}
