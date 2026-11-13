import json,re,sys
from bs4 import BeautifulSoup
cap=json.load(open('/home/claude/capture/cap.json'))
cms=json.load(open('/home/claude/inventory/cms.json'))
OUT='/home/claude/coastline-site/content/'
# ---- static pages
skip_prefix=('/projects/','/blog/','ASSET:')
pages={}
for p,h in cap.items():
    if p.startswith(skip_prefix) or p in ('/work/','/blog','/projects','/this-page-does-not-exist-xyz'): continue
    pages[p]=h
pages['__404']=cap['/this-page-does-not-exist-xyz']
json.dump(pages,open(OUT+'pages.json','w'))
json.dump({'project':cap['/projects/msco'],'blog':cap['/blog/video-production-cost-ontario']},open(OUT+'templates.json','w'))
# expected captures for parity tests (not shipped)
json.dump({k:v for k,v in cap.items() if not k.startswith('ASSET:')},open('/home/claude/capture/expected.json','w'))
# ---- assets (css/js)
assets={k[6:]:v for k,v in cap.items() if k.startswith('ASSET:')}
json.dump(assets,open('/home/claude/capture/assets.json','w'))
print('pages',len(pages),'assets',len(assets))

# ---- seed data
TYPE={o['id']:o['name'] for f in cms['projects_schema']['fields'] if f['slug']=='project-type' for o in f['validations']['options']}
CAT={o['id']:o['name'] for f in cms['blog_schema']['fields'] if f['slug']=='category' for o in f['validations']['options']}
def img(v, srcset=None):
    if not v: return None
    d={'url':v['url'],'alt':v.get('alt')}
    if srcset: d['srcset']=srcset
    return d
projects=[]
for it in cms['projects_items']['items']:
    f=it['fieldData']
    projects.append(dict(webflow_id=it['id'],slug=f['slug'],name=f['name'],client=f.get('client'),
      project_type=TYPE.get(f.get('project-type')),brief=f.get('brief'),outcome=f.get('outcome'),
      featured=bool(f.get('featured')),sort_order=f.get('sort-order'),header=img(f.get('header')),logo=img(f.get('logo')),
      thumbnail=img(f.get('thumbnail')),hover_video_url=f.get('hover-video-url'),hero_video=f.get('hero-video-2'),
      video_2=f.get('video-2'),video_3=f.get('video-3'),
      gallery=[img(f.get('gallery-%d'%i)) for i in range(1,7)],
      director=f.get('director'),dop=f.get('dop'),producer=f.get('producer'),edit=f.get('edit'),colour=f.get('colour'),sound=f.get('sound'),
      seo_title=f.get('seo-title'),meta_description=f.get('meta-description'),
      status='draft' if it['isDraft'] else 'published',published_at=it['lastPublished'],created_at=it['createdOn']))
# srcset lookup from captures
srcsets={}
for p,h in cap.items():
    if p.startswith('ASSET:'): continue
    for m in re.finditer(r'<img[^>]*>',h):
        t=m.group(0); s=re.search(r'\ssrc="([^"]+)"',t); ss=re.search(r'srcset="([^"]+)"',t)
        if s and ss: srcsets[s.group(1)]=ss.group(1)
def raw_rts(h):
    out=[]; tag='<div class="post-rich-text w-richtext">'
    i=h.find(tag)
    while i!=-1:
        j=i+len(tag); depth=1; k=j
        while depth:
            o=h.find('<div',k); c=h.find('</div>',k)
            if o!=-1 and o<c: depth+=1; k=o+4
            else: depth-=1; k=c+6
        out.append(h[j:k-6]); i=h.find(tag,k)
    return out
posts=[]
for it in cms['blog_items']['items']:
    f=it['fieldData']; slug=f['slug']
    parts=[f.get('post-body-part-1'),f.get('post-body-part-2'),f.get('post-body-part-3')]
    key='/blog/'+slug
    if key in cap and not it['isDraft']:
        parts=raw_rts(cap[key])
        assert len(parts)==3, (slug,len(parts))
    def im(v):
        if not v: return None
        return img(v, srcsets.get(v['url']))
    posts.append(dict(webflow_id=it['id'],slug=slug,name=f['name'],excerpt=f.get('excerpt'),seo_title=f.get('seo-title'),
      meta_description=f.get('meta-description'),target_keyword=f.get('target-keyword'),category=CAT.get(f.get('category')),
      author=f.get('author'),reading_time_minutes=f.get('reading-time-minutes'),publish_date=f.get('publish-date'),
      hero_image=im(f.get('hero-image')),og_image=im(f.get('og-image')),og_image_caption=f.get('og-image-caption'),vimeo_id=f.get('vimeo-id'),
      body_part_1=parts[0],body_part_2=parts[1],body_part_3=parts[2],
      section_image_1=im(f.get('section-image-1')),section_image_1_caption=f.get('section-image-1-caption'),
      section_image_2=im(f.get('section-image-2')),section_image_2_caption=f.get('section-image-2-caption'),
      legacy_body=f.get('post-body'),review_notes=f.get('review-notes'),
      related_project_webflow_id=f.get('related-project'),related_post_webflow_ids=f.get('related-posts') or [],
      journal_featured=(slug=='music-that-inspires-us'),
      status='draft' if it['isDraft'] else 'published',published_at=it['lastPublished'],created_at=it['createdOn']))
json.dump({'projects':projects,'posts':posts},open('/home/claude/capture/seed.json','w'),indent=1)
print(len(projects),len(posts))
