# Course rules review

Reviewer: review_course_rules

**PASS.** Migration uses name + ID guards; FE clears both band field errors; API documentation covers strict range rules and Admin-only tuition mutations. No blocking concerns remain.

Validation: FE lint/typecheck/build pass (existing Fast Refresh and bundle-size warnings); BE build passes; VerifyAdmin 23 checks pass; no pending model changes. Live API: equal/reversed/fractional/out-of-range bands and invalid tuition/discount rejected; guest 401, teacher/student 403; Admin tuition update persisted; QA records cleaned. SQL constraint verified trusted and equal-band update rejected in rolled-back transaction.
