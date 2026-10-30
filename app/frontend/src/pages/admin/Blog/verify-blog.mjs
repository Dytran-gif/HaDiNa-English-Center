import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup as markup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
const store=new Map();let failWrite=false;let count=0;
globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>{if(failWrite)throw new Error('quota');store.set(key,value);},removeItem:key=>store.delete(key)};
function check(value,name){assert.ok(value,name);count++;console.log('PASS '+name);}
try{
 const repo=await vite.ssrLoadModule('/src/pages/admin/Blog/demoPosts.ts');
 check(repo.readDemoPosts().length===6,'existing seed retained');
 store.set('admin_blog',JSON.stringify([{post_id:21,title:'Legacy',content:['old'],category:'IELTS',published_at:'2026-10-01'}]));
 let page=await repo.listDemoPosts({search:'',status:'Published',page:1,pageSize:10});check(page.total===1&&page.items[0].id===21&&page.items[0].legacyCategory==='IELTS','legacy data migrated by read without rewriting original');
 const original=store.get('admin_blog');
 const draft=await repo.saveDemoPost(null,{title:'Draft item',content:[],status:'Draft'});check(draft.status==='Draft'&&draft.publishedAt===null,'draft has no publication date');
 check(store.get('admin_blog')===original,'old storage backup remains untouched');
 page=await repo.listDemoPosts({search:'DRAFT',status:'Draft',page:1,pageSize:10});check(page.total===1&&page.items[0].id===draft.id,'case-insensitive title search combines with status');
 const published=await repo.saveDemoPost(draft.id,{title:'Published item',content:['text'],status:'Published'});check(published.publishedAt===repo.localDate(),'publishing uses local date');
 await assert.rejects(repo.saveDemoPost(null,{title:'',content:[],status:'Draft'}));count++;console.log('PASS empty title rejected');
 await assert.rejects(repo.saveDemoPost(null,{title:'x'.repeat(251),content:[],status:'Draft'}));count++;console.log('PASS title maximum enforced');
 await assert.rejects(repo.saveDemoPost(null,{title:'No content',content:[],status:'Published'}));count++;console.log('PASS publication requires content');
 const before=store.get('admin_blog_v2');failWrite=true;await assert.rejects(repo.deleteDemoPost(21));check(store.get('admin_blog_v2')===before,'failed deletion preserves stored data');failWrite=false;
 await repo.deleteDemoPost(21);check(!repo.readDemoPosts().some(post=>post.id===21),'delete persists after reload');
 page=await repo.listDemoPosts({search:'',status:'',page:999,pageSize:10});check(page.page===1&&page.total===1,'last page clamps after deletion');
 check(repo.safeCover('javascript:alert(1)')===null&&repo.safeCover('data:image/svg+xml,bad')===null,'unsafe cover URLs rejected');
 const valid=store.get('admin_blog_v2');store.set('admin_blog_v2','broken json');assert.throws(()=>repo.readDemoPosts());check(store.get('admin_blog_v2')==='broken json','corrupt storage is not silently overwritten');store.set('admin_blog_v2',valid);
 const {default:Preview}=await vite.ssrLoadModule('/src/pages/admin/Blog/PostTextPreview.tsx');
 let html=markup(React.createElement(Preview,{post:{id:1,title:'<script>alert(1)</script>',content:['<img src=x onerror=alert(1)>','<script>alert(2)</script>'],status:'Draft',publishedAt:null,thumbnailUrl:null,legacyCategory:null}}));
 check(!html.includes('<script')&&!html.includes('<img')&&html.includes('&lt;script&gt;'),'preview escapes hostile HTML instead of executing it');
 const {default:ToastProvider}=await vite.ssrLoadModule('/src/pages/admin/Components/Ui/ToastProvider.tsx');
 const {default:Blog}=await vite.ssrLoadModule('/src/pages/admin/Blog/BlogManagement.tsx');
 html=markup(React.createElement(MemoryRouter,{initialEntries:['/admin/blog']},React.createElement(ToastProvider,null,React.createElement(Blog))));
 check(html.includes('admin-content-search')&&html.includes('aria-label=')&&html.includes('admin-skeleton-row'),'list renders search controls and skeleton structure');
 console.log('TOTAL '+count+' Blog checks passed; no browser/DB test claimed.');
}finally{await vite.close();}
