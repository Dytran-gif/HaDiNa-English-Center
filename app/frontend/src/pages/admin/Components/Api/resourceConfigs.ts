import type { ResourceConfig } from "./ResourcePage";
export const teachersConfig: ResourceConfig = {
  path:"teachers", title:"Giáo viên", singular:"giáo viên", paged:true, search:true, status:["Teaching","OnLeave"],
  columns:[{key:"fullName",label:"Họ tên"},{key:"phone",label:"SĐT"},{key:"specialty",label:"Chuyên môn"},{key:"status",label:"Trạng thái"},{key:"classCount",label:"Số lớp"},{key:"isLocked",label:"Tài khoản"}],
  fields:[{key:"fullName",label:"Họ tên",required:true,maxLength:150},{key:"phone",label:"Số điện thoại",type:"tel",required:true,maxLength:20},{key:"email",label:"Email",type:"email",required:true,createOnly:true,maxLength:255},{key:"specialty",label:"Chuyên môn",required:true,maxLength:100},{key:"degree",label:"Bằng cấp",maxLength:200},{key:"hireDate",label:"Ngày vào làm",type:"date"},{key:"status",label:"Trạng thái",options:["Teaching","OnLeave"]},{key:"tempPassword",label:"Mật khẩu tạm (ít nhất 8 ký tự)",type:"password",required:true,createOnly:true}]
};
export const studentsConfig: ResourceConfig = {
  path:"students",title:"Học viên",singular:"học viên",paged:true,search:true,status:["Studying","OnHold","Dropped"],
  columns:[{key:"code",label:"Mã HV"},{key:"fullName",label:"Họ tên"},{key:"phone",label:"SĐT"},{key:"currentClass",label:"Lớp hiện tại"},{key:"status",label:"Trạng thái"},{key:"isLocked",label:"Tài khoản"}],
  fields:[{key:"fullName",label:"Họ tên",required:true,maxLength:150},{key:"phone",label:"Số điện thoại",type:"tel",required:true,maxLength:20},{key:"email",label:"Email",type:"email",required:true,createOnly:true,maxLength:255},{key:"dateOfBirth",label:"Ngày sinh",type:"date"},{key:"address",label:"Địa chỉ",maxLength:300},{key:"parentName",label:"Họ tên phụ huynh",maxLength:150},{key:"parentPhone",label:"SĐT phụ huynh",type:"tel",maxLength:20},{key:"status",label:"Trạng thái",options:["Studying","OnHold","Dropped"]},{key:"tempPassword",label:"Mật khẩu tạm (ít nhất 8 ký tự)",type:"password",required:true,createOnly:true}]
};
export const coursesConfig: ResourceConfig = {
  path:"courses",title:"Khóa học",singular:"khóa học",paged:true,pageSize:16,search:true,
  columns:[{key:"name",label:"Tên khóa"},{key:"bandFrom",label:"Band từ"},{key:"bandTo",label:"Band đến"},{key:"totalSessions",label:"Số buổi"},{key:"activeStudents",label:"HV đang học"},{key:"tuition",label:"Học phí",currency:true},{key:"discountPercent",label:"Giảm (%)"},{key:"finalPrice",label:"Sau giảm",currency:true}],
  fields:[{key:"name",label:"Tên khóa",required:true,maxLength:150},{key:"bandFrom",label:"Band từ",type:"number",required:true,min:0,max:9,step:0.5},{key:"bandTo",label:"Band đến",type:"number",required:true,min:0,max:9,step:0.5},{key:"totalSessions",label:"Tổng số buổi",type:"number",required:true,min:1,max:1000},{key:"sessionsPerWeek",label:"Buổi mỗi tuần",type:"number",required:true,min:1,max:7},{key:"tuition",label:"Học phí gốc",type:"number",required:true,min:0,max:1000000000},{key:"discountPercent",label:"Giảm giá (%)",type:"number",required:true,min:0,max:50,step:0.01},{key:"description",label:"Mô tả",type:"textarea"}]
};
export const roomsConfig: ResourceConfig = {
  path:"rooms",title:"Phòng học",singular:"phòng học",paged:false,
  columns:[{key:"name",label:"Tên phòng"},{key:"capacity",label:"Sức chứa"}],
  fields:[{key:"name",label:"Tên phòng",required:true,maxLength:50},{key:"capacity",label:"Sức chứa",type:"number",required:true,min:1,max:1000}]
};
