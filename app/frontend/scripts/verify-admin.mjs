import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

// Contract/error checks and server rendering only. No API server or DB is started.
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
const originalFetch = globalThis.fetch;
let passed = 0;
function check(condition, label) { assert.ok(condition, label); passed++; console.log(`PASS ${label}`); }
try {
  const { request, ApiError, assetUrl } = await vite.ssrLoadModule("/src/services/apiClient.ts");
  let captured;
  globalThis.fetch = async (url, init) => { captured = {url,init}; return new Response(JSON.stringify({items:[],totalItems:0}), {status:200}); };
  const response = await request("/api/admin/teachers", "test-token");
  check(response.totalItems === 0, "read camelCase API response");
  check(captured.init.headers.Authorization === "Bearer test-token", "bearer token attached");
  check(captured.url === "/api/admin/teachers", "same-origin proxy path by default");
  await request("/api/admin/rooms", "test-token", {method:"POST",body:JSON.stringify({name:"Test",capacity:20})});
  check(captured.init.headers["Content-Type"] === "application/json", "JSON content type for mutation");
  check(JSON.parse(captured.init.body).capacity === 20, "numeric request fields preserved");
  globalThis.fetch = async () => new Response(null,{status:204});
  check(await request("/api/admin/rooms/1", "test-token", {method:"DELETE"}) === undefined, "204 handled without JSON parse");
  globalThis.fetch = async () => new Response(JSON.stringify({message:"Tên phòng đã tồn tại"}),{status:409});
  await assert.rejects(request("/api/admin/rooms"), e => e instanceof ApiError && e.status === 409 && e.message === "Tên phòng đã tồn tại"); passed++; console.log("PASS preserve business conflict message");
  globalThis.fetch = async () => new Response(JSON.stringify({errors:{FullName:["Tên là bắt buộc"]}}),{status:400});
  await assert.rejects(request("/api/admin/teachers"), e => e.fieldErrors.FullName[0] === "Tên là bắt buộc" && e.message.includes("bắt buộc")); passed++; console.log("PASS ProblemDetails normalized");
  globalThis.fetch = async () => new Response("{}",{status:401});
  await assert.rejects(request("/api/admin/teachers"), e => e.status === 401 && e.message.includes("đăng nhập")); passed++; console.log("PASS expired-session message");
  globalThis.fetch = async () => { throw new TypeError("network"); };
  await assert.rejects(request("/api/admin/teachers"), e => e.status === 0 && e.message.includes("máy chủ")); passed++; console.log("PASS network error message");
  const aborted = new DOMException("aborted","AbortError");
  globalThis.fetch = async () => { throw aborted; };
  await assert.rejects(request("/api/admin/teachers"), e => e === aborted); passed++; console.log("PASS abort preserved");
  check(assetUrl("javascript:alert(1)") === undefined, "unsafe logo URL rejected");
  check(assetUrl("/uploads/logo.png") === "/uploads/logo.png", "uploaded logo URL supported");
  const store = new Map();
  globalThis.localStorage = { getItem:key=>store.get(key)??null, setItem:(key,value)=>store.set(key,value), removeItem:key=>store.delete(key) };
  const { AuthProvider } = await vite.ssrLoadModule("/src/context/AuthContext.tsx");
  const cases = [
    ["Teachers/TeachersManagement.tsx","/admin/teachers","Thêm giáo viên"],
    ["Students/StudentsManagement.tsx","/admin/students","Thêm học viên"],
    ["Classes/ClassesManagement.tsx","/admin/classes","Tạo lớp"],
    ["TeacherRequests/TeacherRequests.tsx","/admin/teacher-requests","Loại đơn"],
    ["Settings/Settings.tsx","/admin/settings","Thông tin trung tâm"],
    ["Payments/PaymentsManagement.tsx","/admin/payments","Tạo phiếu thu"],
    ["Rooms/RoomsManagement.tsx","/admin/rooms","Thêm phòng học"],
    ["Courses/CoursesManagement.tsx","/admin/courses","Thêm khóa học"],
    ["Students/StudentsManagement.tsx","/admin/students?action=create","Mật khẩu tạm"],
    ["Classes/ClassesManagement.tsx","/admin/classes?action=create","Lịch học mỗi tuần"],
    ["Payments/PaymentsManagement.tsx","/admin/payments?action=create","Tìm học viên"],
  ];
  for (const [file,url,expected] of cases) {
    const {default:Page} = await vite.ssrLoadModule(`/src/pages/admin/${file}`);
    const html = renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[url]},React.createElement(AuthProvider,null,React.createElement(Page))));
    check(html.includes(expected), `render ${url}`);
  }
  const {default:ProtectedRoute} = await vite.ssrLoadModule("/src/components/ProtectedRoute.tsx");
  let html = renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(AuthProvider,null,React.createElement(ProtectedRoute,{role:"admin"},React.createElement("p",null,"protected-admin-content")))));
  check(!html.includes("protected-admin-content"), "guest cannot render protected admin content");
  store.set("ecw_auth_user",JSON.stringify({user_id:3,full_name:"Demo",email:"admin@demo.com",role:"admin",phone:"",created_at:""}));
  html = renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(AuthProvider,null,React.createElement(ProtectedRoute,{role:"admin"},React.createElement("p",null,"protected-admin-content")))));
  check(html.includes("protected-admin-content"), "legacy demo session remains readable");
  store.set("ecw_auth_user","invalid-json");
  html = renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(AuthProvider,null,React.createElement(ProtectedRoute,{role:"admin"},React.createElement("p",null,"protected-admin-content")))));
  check(!html.includes("protected-admin-content"), "malformed session does not crash or grant access");
  console.log(`TOTAL ${passed} checks passed; no real HTTP mutation or database connection.`);
} finally {
  globalThis.fetch = originalFetch;
  await vite.close();
}
