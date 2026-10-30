import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup as renderMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
let count=0;
function check(value,name){assert.ok(value,name);count++;console.log('PASS '+name);}
function render(Component,props={},children){return renderMarkup(React.createElement(MemoryRouter,null,React.createElement(Component,props,children)));}
async function load(file){return vite.ssrLoadModule('/src/pages/admin/Components/Ui/'+file);}
try{
 const {default:Button,IconButton}=await load('Button.tsx');
 let html=render(Button,{variant:'primary'},'Lưu');check(html.includes('admin-button--primary')&&html.includes('type="button"'),'primary button has safe non-submit default');
 html=render(Button,{to:'/admin/courses',disabled:true},'Khóa học');check(html.includes('disabled')&&!html.includes('href='),'disabled links cannot navigate');
 html=render(Button,{loading:true},'Đang lưu');check(html.includes('aria-busy="true"')&&html.includes('disabled'),'loading prevents repeat submission');
 html=render(IconButton,{icon:'trash',label:'Xóa khóa'});check(html.includes('aria-label="Xóa khóa"')&&html.includes('title="Xóa khóa"'),'icon action has accessible name and tooltip');
 const {InputField,SelectField,TextareaField}=await load('FormField.tsx');
 html=render(InputField,{label:'Mật khẩu',type:'password',error:'Không khớp',help:'Ít nhất 8 ký tự'});check(html.includes('type="password"')&&html.includes('aria-label="Hiện mật khẩu"'),'password starts hidden and has toggle');check(html.includes('aria-invalid="true"')&&html.includes('aria-describedby=')&&html.includes('Không khớp'),'field error and help are accessible');
 html=render(SelectField,{label:'Trạng thái',loading:true,options:[{value:'Teaching',label:'Đang dạy'}]});check(html.includes('disabled')&&html.includes('aria-busy="true"'),'select loading disables control');
 check(render(TextareaField,{label:'Ghi chú',error:'Quá dài'}).includes('aria-invalid="true"'),'textarea shares validation semantics');
 const {default:Notice}=await load('Notice.tsx');check(render(Notice,{tone:'error'},'Lỗi').includes('role="alert"'),'errors announced as alerts');check(render(Notice,{tone:'info'},'Demo').includes('role="status"'),'info is not an error');
 const {default:EmptyState}=await load('EmptyState.tsx');check(render(EmptyState,{title:'Chưa có khóa'}).includes('Chưa có khóa'),'empty state explains missing data');
 const {default:Skeleton}=await load('TableSkeleton.tsx');html=renderMarkup(React.createElement('table',null,React.createElement('tbody',null,React.createElement(Skeleton,{columns:3,rows:2}))));check((html.match(/<tr/g)??[]).length===2&&(html.match(/<td/g)??[]).length===6&&(html.match(/role="status"/g)??[]).length===1,'skeleton has valid rows and one announcement');
 const {default:Badge}=await load('Badge.tsx');check(render(Badge,{status:'Teaching'}).includes('Đang dạy'),'badge has text independent of color');
 const {default:Pagination}=await load('Pagination.tsx');html=render(Pagination,{page:1,total:0,onChange:()=>{}});check(html.includes('Trang 1/1')&&(html.match(/ disabled/g)??[]).length===2,'empty pagination disables both directions');html=render(Pagination,{page:2,total:30,loading:true,onChange:()=>{}});check(html.includes('Trang 2/3')&&(html.match(/ disabled/g)??[]).length===2,'pagination locks during loading');
 const {default:Confirm}=await load('ConfirmDialog.tsx');html=render(Confirm,{open:false,onClose:()=>{},onConfirm:()=>{}},'Xóa khóa?');check(html.includes('<dialog')&&html.includes('aria-labelledby=')&&html.includes('autofocus'),'confirm uses labeled dialog and safe initial focus');
 const {default:ToastProvider}=await load('ToastProvider.tsx');check(render(ToastProvider,{},'Nội dung').includes('Thông báo thao tác'),'toast region belongs to provider');
 const {adminSidebarMenuGroups:groups}=await vite.ssrLoadModule('/src/data/AdminData/sidebarMenuItems.ts');const routes=groups.flatMap(group=>group.items.map(item=>item.path));check(groups.length===5&&routes.length===11&&new Set(routes).size===11,'five menu groups preserve eleven unique routes');
 const store=new Map([['ecw_auth_user',JSON.stringify({user:{user_id:3,full_name:'Quản trị demo',email:'admin@demo.com',role:'admin',phone:'',created_at:''},token:null})]]);globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
 const {AuthProvider}=await vite.ssrLoadModule('/src/context/AuthContext.tsx');const {default:Layout}=await vite.ssrLoadModule('/src/pages/admin/Layout/AdminLayout.tsx');html=renderMarkup(React.createElement(MemoryRouter,{initialEntries:['/admin/courses']},React.createElement(AuthProvider,null,React.createElement(Layout))));check(html.includes('Quản trị demo')&&html.includes('admin@demo.com')&&html.includes('Đăng xuất'),'header preserves account identity and logout');check(html.includes('aria-label="Mở menu quản trị"')&&html.includes('aria-expanded="false"')&&html.includes('admin-nav-drawer'),'mobile drawer control is named');check(html.includes('aria-current="page"')&&html.includes('admin-skip-link'),'active navigation and skip link are exposed');
 const tokens=fs.readFileSync('src/pages/admin/Components/Ui/AdminTokens.css','utf8');
 function color(name){return tokens.match(new RegExp(`--admin-${name}: (#[a-f0-9]{6});`))[1];}
 function luminance(hex){const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
 for(const [ink,bg]of[['muted','surface'],['muted','canvas'],['surface','primary'],['danger','danger-soft'],['success','success-soft'],['warning','warning-soft'],['disabled-text','disabled-bg']]){const a=luminance(color(ink)),b=luminance(color(bg)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);check(ratio>=4.5,`${ink}/${bg} contrast ${ratio.toFixed(2)}:1`);}
 console.log(`TOTAL ${count} checks passed. No browser screenshot, dialog interaction or database test is claimed.`);
}finally{await vite.close();}
