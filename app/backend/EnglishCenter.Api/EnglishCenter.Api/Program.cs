using System.Text;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using EnglishCenter.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims; 
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<EnrollmentService>();
builder.Services.AddScoped<ScheduleService>();

// Lưu file upload (ảnh đại diện...)
builder.Services.AddScoped<FileStorageService>();

// Dọn file bài tập/bài nộp quá 7 ngày (module Student)
builder.Services.AddHostedService<AssignmentFileCleanupService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
        opt.Events = new JwtBearerEvents
        {
            OnTokenValidated = async ctx =>
            {
                var db = ctx.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var idStr = ctx.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var verStr = ctx.Principal?.FindFirst("tokenVersion")?.Value;

                if (!int.TryParse(idStr, out var id) || !int.TryParse(verStr, out var ver))
                {
                    ctx.Fail("Token không hợp lệ");
                    return;
                }

                var u = await db.Users.AsNoTracking()
                    .Where(x => x.Id == id)
                    .Select(x => new { x.TokenVersion, x.IsLocked })
                    .FirstOrDefaultAsync();

                if (u == null || u.IsLocked || u.TokenVersion != ver)
                    ctx.Fail("Token đã bị thu hồi");
            }
        };
    });

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();
// Tự dựng database ở máy dev (tạo DB, áp migration còn thiếu, seed + dữ liệu demo).
// Mặc định bật ở Development, tắt ở môi trường khác. Xem Data/DatabaseBootstrapper.cs
await DatabaseBootstrapper.RunAsync(app);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Dev chạy profile http + Vite proxy; redirect sang https làm hỏng proxy nên chỉ bật ngoài Development
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

// Phục vụ file upload (tài liệu, ảnh đề, audio) tại /uploads/...
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
