# Controllers/Public/: `api/public/*` (CHƯA CÓ CODE)

Người giữ: **Hoàng**. Hợp đồng: `docs/api/PUBLIC_API.md`. Việc: `plans/40`.

| File dự kiến | Route |
|---|---|
| `PublicCoursesController.cs` | `api/public/courses` |
| `PublicTeachersController.cs` | `api/public/teachers` |
| `PublicPostsController.cs` | `api/public/posts` |
| `PublicSettingsController.cs` | `api/public/settings` |

Khuôn:
```csharp
[ApiController]
[Route("api/public/courses")]
[AllowAnonymous]
public class PublicCoursesController : ControllerBase { ... }
```
Luật: chỉ đọc (GET), không trả email/SĐT GV, chỉ bài `Published`, chỉ GV `Teaching`. Luôn `Select` sang object công khai, không trả entity.
