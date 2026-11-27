# Rename a class without revalidating unchanged timetable conflicts

Existing database classes overlap. Updating a class name previously rechecked the same timetable, then deleted/reinserted all schedule rows. Thus a name-only change could fail with a teacher conflict unrelated to the submitted change.

- ScheduleService compares teacher, start/effective end date and sorted weekday/time/room tuples with the loaded current class. Unchanged timetable/capacity bypasses pre-existing scheduling/capacity conflicts; changing capacity still validates room and active student limits.
- ClassesController only checks student schedule conflicts when the timetable changes. Existing schedule rows/IDs remain intact for name-only updates. Create and genuine timetable changes retain teacher/room conflict checks, unaffected by Force.
- No migration or modification of existing class schedules. Previously uncommitted demo-account handoff preserved.

Validation: VerifyAdmin 36 checks passed, including changed teacher/room/time/date and reordered schedule comparisons. Live API on two isolated QA classes with deliberately overlapping timetables: rename accepted with identical schedule IDs/values, equivalent order accepted, conflicting time rejected (also with Force), new conflicting class rejected, excessive room capacity rejected, valid time change persisted. QA classes/course removed in finally. Backend built successfully.
