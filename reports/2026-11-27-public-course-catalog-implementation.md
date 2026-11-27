# Public course catalog from Admin database

User requested public homepage courses match the backend/Admin and related flows remain consistent without data loss.

- Homepage (six courses plus View All), full catalog, arbitrary database-slug details, course cards, header/footer links, consultation choices and survey results now use the public Courses API. Static course content is retained in its original file but has no runtime imports.
- Shared external store deduplicates catalog requests and handles loading, errors, empty results, retry, remount/focus, local and cross-tab invalidation. Mutation while loading schedules a refresh after the current request.
- Successful Admin course/class/teacher/enrollment mutations and Student enrollment mutations invalidate the catalog. No login/authorization behavior changed.
- Name/description/bands/session counts/image/tuition/discounted price come from BE; no fabricated categories, syllabus or weekly duration. Unknown/hidden slugs have no static fallback. Existing database slugs remain unchanged.
- Public API disables caching and only links eligible public teacher profiles. No schema migration or permanent data write.
- Long submenu is scrollable with an unbroken hover bridge. Consultation retry explicitly uses type=button.

Validation: FE lint/typecheck/build pass with existing Fast Refresh and bundle warnings; backend builds with zero compiler warnings/errors. Final live API smoke returned 14 courses and no-store/no-cache.

46 API/Chrome headless checks passed: Admin/public field equality for all 14 courses; every actual slug; browser catalog/header/footer/consultation count; new Admin course and new slug; server discounted price; hidden course removal; unknown slug; no runtime exceptions; API empty/error/retry; request deduplication; hover gap and bounded scrolling. QA record was removed in finally and the complete Admin response before/after matched exactly. Existing classes/enrollments/payments were untouched.

See docs/api/PUBLIC-COURSES.md. No commits or pushes performed.
