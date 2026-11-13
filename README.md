# coastlinefilms.ca

The Coastline Films website on Next.js + Vercel, migrated from Webflow with every URL, title, meta tag, canonical, JSON-LD block and sitemap entry kept identical.

## How it works

- **Public pages** are the exact HTML Webflow published, served by `app/[[...path]]/route.ts`.
  - Static pages live in `content/pages.json` (captured from the live site).
  - Collection lists on `/`, `/work` and `/journal` are filled from Supabase using item templates in `content/templates.json`.
  - `/projects/:slug` and `/blog/:slug` are rendered from the Webflow template pages (`lib/render/project.ts`, `lib/render/blog.ts`).
- **CMS** data lives in Supabase (`site_projects`, `site_blog_posts`) in the Coastline portal project. Public reads only see published rows (RLS).
- **Admin** at `/admin`: sign in with a portal account whose studio role is Super Admin or Admin. Edit, preview, publish, unpublish. Changes go live within about a minute (edge cache `s-maxage=60`).
- **Media**: Webflow's CSS/JS are self-hosted in `public/wf`. Images, fonts and videos are copied to Vercel Blob; `content/asset-map.json` rewrites old Webflow CDN URLs at render time. New uploads from the admin go straight to Blob.
- **SEO**: `/sitemap.xml` and `/robots.txt` match Webflow's output. `/blog` 301s to `/journal`; trailing slashes redirect to the slashless URL.

## Checks

`npm run parity -- <live-capture.json> <seed.json>` renders every page from the seed data and diffs it against the captured Webflow HTML.

## Env

See `.env.example`.
