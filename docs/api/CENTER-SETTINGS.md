# Center settings: Admin → public website

- Existing DB table CenterSettings, singleton Id1. No migration needed.
- Existing Admin GET/PUT /api/admin/settings/center reads/saves name, address, phone. Admin role required; logo remains view-only.
- New anonymous GET /api/public/center reads the same DB row, returns name/logoUrl/address/phone, no-store caching;404 if not configured.
- Admin save publishes the saved response into the public center store and signals other tabs through a localStorage revision key (no contact data stored there). Public store fetches once across subscribers and refreshes on focus/storage changes. Failed fetch retains last successful data and exposes error/retry; no fake address/phone fallback.
- Name displayed at public Header, Hero brand label, Footer/copyright and Contact title. Address at Footer/Contact; phone at Footer/Contact/MiniCta. Email and marketing descriptions are independent website content and not editable in this form.
- Settings explains where changes appear. Save button stays disabled when nothing differs from saved values.
- Contact's standalone message form is still not connected; homepage consultation form remains the working request flow.

Validation2026-11-25: FE/BE build passed, lint only existing2FastRefresh warnings. Live Admin PUT followed by public GET reflected all3fields. Restored original center information in finally and verified equality; no QA values retained. No new schema/seed and no claim of browser visual QA.
