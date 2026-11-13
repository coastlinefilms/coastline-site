import json,re,html
cap=json.load(open('/home/claude/capture/cap.json'))
seed=json.load(open('/home/claude/capture/seed.json'))
P={p['slug']:p for p in seed['projects']}; B={p['slug']:p for p in seed['posts']}

def items_region(h, start_marker):
    """return (start,end) of the inner HTML of the w-dyn-items div after start_marker"""
    i=h.find(start_marker); assert i>=0, start_marker
    j=h.find('w-dyn-items',i); j=h.find('>',j)+1
    k=j; depth=1
    while depth:
        o=h.find('<div',k); c=h.find('</div>',k)
        if o!=-1 and o<c: depth+=1; k=o+4
        else: depth-=1; k=c+6
    return j,k-6

def split_items(inner):
    out=[]; k=0
    while k<len(inner):
        assert inner.startswith('<div',k), inner[k:k+50]
        s=k; depth=0
        while True:
            o=inner.find('<div',k); c=inner.find('</div>',k)
            if o!=-1 and o<c: depth+=1; k=o+4
            else:
                depth-=1; k=c+6
                if depth==0: break
        out.append(inner[s:k])
    return out

def et(s): return html.escape(s or '',quote=True).replace('&quot;','"')
def ea(s): return html.escape(s or '',quote=True)
def ee(s): return html.escape(s or '',quote=False)

LISTS={
 'home': ('/', 'class="collection-list-wrapper', 'proj'),
 'work': ('/work', 'class="sectionportfolio', 'proj'),
 'journalFeatured': ('/journal', 'class="journal-featured-section', 'post'),
 'journalGrid': ('/journal', 'class="journal-grid"', 'post'),
}
pages={}; tmpl={}
for name,(page,marker,kind) in LISTS.items():
    h=pages.get(page) or cap[page]
    a,b=items_region(h,marker)
    items=split_items(h[a:b])
    first=items[0]
    if kind=='proj':
        sl=re.search(r'var slug = "([^"]+)"',first).group(1); d=P[sl]
        t=first
        reps=[(d['thumbnail']['url'],'{{thumb_url}}'),('alt="'+ea(d['thumbnail']['alt'])+'"','alt="{{thumb_alt}}"'),
              (d['hover_video_url'],'{{hover_url}}'),('var slug = "'+sl+'"','var slug = {{slug_js}}'),
              ('<span class="work-client">'+ee(d['client'])+'</span>','<span class="work-client">{{client}}</span>'),
              ('<span class="work-project">'+ee(d['name'])+'</span>','<span class="work-project">{{name}}</span>')]
    else:
        sl=re.search(r'data-post-slug="([^"]+)"',first).group(1); d=B[sl]
        t=first
        hero=d['hero_image']
        reps=[('data-post-slug="'+sl+'"','data-post-slug="{{slug}}"'),('href="/blog/'+sl+'"','href="/blog/{{slug}}"'),
              ('srcset="'+ea(hero['srcset'])+'"','srcset="{{img_srcset}}"'),('src="'+ea(hero['url'])+'"','src="{{img_url}}"'),
              ('alt="'+ea(d['name'])+'"','alt="{{name_attr}}"'),
              ('<div>'+et(d['category'])+'</div>','<div>{{category}}</div>'),
              ('>'+et(d['name'])+'</h','>{{name}}</h'),('>'+et(d['excerpt'])+'</p>','>{{excerpt}}</p>')]
    for old,new in reps:
        if name=='journalFeatured' and old.startswith('href='): continue
        assert old in t, (name,old[:80])
        t=t.replace(old,new)
    tmpl[name]=t
    pages[page]=h[:a]+'<!--CMS:'+name+'-->'+h[b:]
    tmpl[name+'_expected']=[re.search(r'var slug = "([^"]+)"|data-post-slug="([^"]+)"',it).group(1) or re.search(r'data-post-slug="([^"]+)"',it).group(1) for it in items]
    tmpl[name+'_raw']=items
json.dump(tmpl,open('/home/claude/capture/list_templates_full.json','w'))
for k in tmpl:
    if not k.endswith(('_raw','_expected')): print('==',k); print(tmpl[k][-900:] if 'journal' not in k else tmpl[k])
    elif k.endswith('_expected'): print(k,tmpl[k])
# write back
pj=json.load(open('/home/claude/coastline-site/content/pages.json'))
for page,h in pages.items(): pj[page]=h
json.dump(pj,open('/home/claude/coastline-site/content/pages.json','w'))
tj=json.load(open('/home/claude/coastline-site/content/templates.json'))
for k,v in tmpl.items():
    if not k.endswith(('_raw','_expected')): tj[k]=v
json.dump(tj,open('/home/claude/coastline-site/content/templates.json','w'))
