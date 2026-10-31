import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// Local-only preview. Never imported by the production application.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/admin-mock-preview.mjs <admin-mock.json>');
const db = JSON.parse(readFileSync(resolve(source), 'utf8').replace(/^\uFEFF/, ''));
for (const key of ['courses','teachers','students','classes','rooms','schedules','enrollments','payments','posts']) {
  if (!Array.isArray(db[key])) throw new Error(`Missing array: ${key}`);
}
const token = 'local-admin-mock-preview';
const today = () => new Date().toLocaleDateString('en-CA');
const find = (key,id) => db[key].find(x => x.id === Number(id));
const status = c => c.startDate > today() ? 'Upcoming' : c.endDate < today() ? 'Completed' : 'Ongoing';
const enrolled = id => db.enrollments.filter(e => e.classId === id && e.status === 'Active');
const courseView = c => ({...c, finalPrice:c.tuition*(1-c.discountPercent/100),
  activeStudents:db.classes.filter(x=>x.courseId===c.id && status(x)!=='Completed').reduce((n,x)=>n+enrolled(x.id).length,0),
  maxStudents:db.classes.filter(x=>x.courseId===c.id && status(x)!=='Completed').reduce((n,x)=>n+x.maxStudents,0)});
const classView = c => ({...c, courseName:find('courses',c.courseId)?.name, teacherName:find('teachers',c.teacherId)?.fullName,
  status:status(c), meetingUrl:c.onlineLink ?? null, enrolledCount:enrolled(c.id).length, enrolled:enrolled(c.id).length, capacity:c.maxStudents,
  schedules:db.schedules.filter(s=>s.classId===c.id).map(s=>({...s,roomName:find('rooms',s.roomId)?.name})),
  students:db.enrollments.filter(e=>e.classId===c.id).map(e=>({...find('students',e.studentId),enrollmentId:e.id,status:e.status}))});
const enrollmentView = e => ({...e, className:find('classes',e.classId)?.name,courseName:find('courses',find('classes',e.classId)?.courseId)?.name,
  classStatus:status(find('classes',e.classId)),paymentId:db.payments.find(p=>p.enrollmentId===e.id)?.id ?? null});
const studentView = s => ({...s,isLocked:s.isAccountLocked,currentClass:db.enrollments.filter(e=>e.studentId===s.id&&e.status==='Active').map(e=>find('classes',e.classId)?.name).join(', '),
  enrollments:db.enrollments.filter(e=>e.studentId===s.id).map(enrollmentView)});
const teacherView = t => ({...t,degree:t.degrees,isLocked:t.isAccountLocked,classCount:db.classes.filter(c=>c.teacherId===t.id).length,
  classes:db.classes.filter(c=>c.teacherId===t.id).map(classView)});
const paymentView = p => {const e=find('enrollments',p.enrollmentId);const s=find('students',e.studentId);const c=find('classes',e.classId);
  return {...p,studentName:s.fullName,studentCode:s.code,className:c.name,courseName:find('courses',c.courseId)?.name,
    tuitionFee:e.tuitionFee,discountPercent:e.discountPercent,discountAmount:e.discountAmount,amount:e.finalTuitionFee};};
const views = {courses:courseView,classes:classView,teachers:teacherView,students:studentView,payments:paymentView,rooms:x=>x,posts:x=>x};
const fold = x => String(x??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/g,'d').toLowerCase();
const virtual = '\0admin-preview-data';
const demo = {
  adminPayments:db.payments.map(p=>{const e=find('enrollments',p.enrollmentId);return {...paymentView(p),payment_id:p.id,user_id:e.studentId,course_id:find('classes',e.classId).courseId,status:'paid',paid_date:p.paidDate,due_date:p.paidDate};}),
  courses:db.courses.map(c=>({...c,course_id:c.id,course_name:c.name,slug:`course-${c.id}`,level:`Band ${c.bandFrom} - ${c.bandTo}`,price:c.tuition,description:c.name,short_description:c.name})),
  teachers:db.teachers.map(t=>({...t,teacher_id:t.id,full_name:t.fullName})),
  adminMockUsers:db.students.map(s=>({...s,role:'student',full_name:s.fullName,user_id:s.id})),
  blogPosts:db.posts.map(p=>({...p,post_id:p.id})),
};
const postSeeds=db.posts.map(p=>({...p, content:[p.content.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()],thumbnailUrl:`/uploads/mock/post-${p.id}.svg`}));
const session={user:{user_id:db.adminUser.id,email:db.adminUser.email,role:'admin',full_name:db.adminUser.fullName,phone:'',created_at:''},token};
const plugin={name:'local-admin-mock',enforce:'pre',
  resolveId(id){if(id==='virtual:admin-preview-data')return virtual;},
  load(id){if(id===virtual)return Object.entries(demo).map(([k,v])=>`export const ${k}=${JSON.stringify(v)};`).join('\n')+'\nexport const formatPrice = value => Number(value).toLocaleString("vi-VN") + " VNĐ";';},
  transform(code,id){if(/\/pages\/admin\/(?:Dashboard\/(?:Dashboard|Components\/StatsOverview)|Reports\/Reports)\.tsx$/.test(id.replaceAll('\\','/')))
    return code.replace(/from ["'][^"']*data\/(?:courses|teachers|blogPosts|AdminData\/(?:mockUsers|payments))["']/g,'from "virtual:admin-preview-data"');},
  transformIndexHtml(html){return {html,tags:[{tag:'script',injectTo:'head-prepend',children:
    `localStorage.setItem('ecw_auth_user',${JSON.stringify(JSON.stringify(session))}); if(!localStorage.getItem('admin_mock_seed_v1')){localStorage.setItem('admin_blog_v2',${JSON.stringify(JSON.stringify(postSeeds))});localStorage.setItem('admin_mock_seed_v1','1');}`},
    {tag:'script',injectTo:'body',children:`document.addEventListener('DOMContentLoaded',()=>{const n=document.createElement('div');n.textContent='BẢN THỬ DỮ LIỆU GIẢ — API lưu tạm trong bộ nhớ, không kết nối DB';n.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#fff3cd;color:#664d03;text-align:center;padding:8px;font:12px sans-serif;pointer-events:none';document.body.append(n);});`}]};},
  configureServer(server){server.middlewares.use(async(req,res,next)=>{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname.startsWith('/uploads/mock/post-')){const p=find('posts',url.pathname.match(/post-(\d+)\.svg$/)?.[1]);const raw=p?.thumbnailUrl;
      if(raw?.startsWith('data:image/svg+xml;utf8,')){res.setHeader('Content-Type','image/svg+xml');res.end(decodeURIComponent(raw.split(';utf8,')[1]));return;}res.statusCode=404;res.end();return;}
    if(!url.pathname.startsWith('/api/'))return next();
    const send=(data,code=200)=>{res.statusCode=code;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));};
    try{
      let body={};if(['POST','PUT','PATCH'].includes(req.method)){let text='';for await(const chunk of req){text+=chunk;if(text.length>1000000)throw new Error('Request too large');}body=text?JSON.parse(text):{};}
      if(url.pathname==='/api/auth/login'){if(body.email!==db.adminUser.email||body.password!=='123456')return send({message:'Dùng admin@demo.com / 123456 cho bản thử.'},401);return send({token,userId:db.adminUser.id,email:db.adminUser.email,role:'admin'});}
      if(req.headers.authorization!==`Bearer ${token}`)return send({message:'Chỉ dùng token của bản thử.'},401);
      const [key,id,sub,child]=url.pathname.replace('/api/admin/','').split('/');
      if(key==='settings'&&id==='center'){if(req.method==='PUT')Object.assign(db.centerSetting,body);return send(db.centerSetting);}
      if(key==='settings'&&id==='change-password')return send({message:'Đã mô phỏng đổi mật khẩu; tài khoản thật không thay đổi.',token});
      if(key==='teachers'&&id==='specialties')return send([...new Set(db.teachers.map(t=>t.specialty))]);
      if(key==='classes'&&id==='available')return send(db.classes.filter(c=>status(c)!=='Completed'&&enrolled(c.id).length<c.maxStudents).map(c=>({...classView(c),finalTuition:courseView(find('courses',c.courseId)).finalPrice})));
      if(!views[key])return send({message:'API chưa được mô phỏng trong bản thử.'},404);
      if(id && sub==='enrollments'){
        if(req.method==='POST'){const c=find('classes',body.classId);if(!c)return send({message:'Không tìm thấy lớp.'},404);const course=find('courses',c.courseId);db.enrollments.push({id:Math.max(0,...db.enrollments.map(x=>x.id))+1,studentId:Number(id),classId:c.id,status:'Active',tuitionFee:course.tuition,discountPercent:course.discountPercent,discountAmount:course.tuition*course.discountPercent/100,finalTuitionFee:courseView(course).finalPrice});return send({},201);}
        if(req.method==='DELETE'){const e=find('enrollments',child);if(e&&e.studentId===Number(id))e.status='Dropped';return send({});}
        return send(db.enrollments.filter(e=>e.studentId===Number(id)).map(enrollmentView));
      }
      if(key==='students'&&id&&sub==='payments'){const items=db.payments.map(paymentView).filter(p=>find('enrollments',p.enrollmentId).studentId===Number(id));return send({items,totalPaid:items.reduce((n,p)=>n+p.amount,0)});}
      if(id&&['lock','unlock','reset-password'].includes(sub)){const row=find(key,id);if(!row)return send({message:'Không tìm thấy.'},404);if(sub!=='reset-password')row.isAccountLocked=sub==='lock';return send({message:'Đã cập nhật bản thử.'});}
      if(req.method==='GET'){
        if(id){const row=find(key,id);if(!row)return send({message:'Không tìm thấy.'},404);if(key==='payments')return send({payment:paymentView(row),center:db.centerSetting,createdByName:row.createdByName,createdByEmail:db.adminUser.email,note:row.note});return send(views[key](row));}
        let items=db[key].map(views[key]);const q=fold(url.searchParams.get('search')).trim();if(q)items=items.filter(x=>fold([x.name,x.fullName,x.code,x.phone,x.studentName,x.studentCode].join(' ')).includes(q));
        for(const field of ['status','specialty','courseId','teacherId']){const val=url.searchParams.get(field);if(val)items=items.filter(x=>String(x[field])===val);}
        if(['rooms','posts'].includes(key))return send(items);
        const page=Math.max(1,Number(url.searchParams.get('page'))||1),pageSize=Math.max(1,Math.min(100,Number(url.searchParams.get('pageSize'))|| (key==='courses'?16:10)));return send({items:items.slice((page-1)*pageSize,page*pageSize),total:items.length,totalItems:items.length,page,pageSize,totalPages:Math.ceil(items.length/pageSize)});
      }
      if(req.method==='DELETE'){const row=find(key,id);if(!row)return send({message:'Không tìm thấy.'},404);if(key==='courses'&&db.classes.some(c=>c.courseId===row.id))return send({message:'Khóa học đã có lớp, không thể xóa.'},409);db[key]=db[key].filter(x=>x.id!==row.id);return send({});}
      if(req.method==='POST'||req.method==='PUT'){
        if(id){const row=find(key,id);if(!row)return send({message:'Không tìm thấy.'},404);Object.assign(row,body);return send(views[key](row));}
        const row={...body,id:Math.max(0,...db[key].map(x=>x.id))+1,createdAt:today()};
        if(key==='students'){row.code=`HV${String(row.id).padStart(4,'0')}`;row.status??='Studying';}
        if(key==='classes'){row.onlineLink=body.meetingUrl;db.schedules.push(...(body.schedules??[]).map(s=>({...s,classId:row.id})));}
        if(key==='payments'&&db.payments.some(p=>p.enrollmentId===body.enrollmentId))return send({message:'Ghi danh đã thu học phí.'},409);
        db[key].push(row);return send(views[key](row),201);
      }
      send({message:'Thao tác chưa mô phỏng.'},405);
    }catch(error){send({message:`Bản thử: ${error.message}`},400);}
  });}
};
const server=await createServer({root,plugins:[plugin],server:{host:'127.0.0.1',port:5174,strictPort:true},define:{'import.meta.env.VITE_API_URL':JSON.stringify('')}});
await server.listen();
console.log('ADMIN MOCK PREVIEW http://localhost:5174/admin/courses');
console.log('Source:',resolve(source),'(read only); API changes reset on restart.');
server.printUrls();
