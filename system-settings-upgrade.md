# Enterprise System Settings & Configuration Center Plan

## Goal
Transform the System Settings page into an enterprise-grade, fully functional System Settings & Configuration Center with 24+ interconnected modules, real persistence (Supabase + Firestore dual sync), audit logging, testing diagnostics, and responsive Master-Detail layout.

## Tasks
- [x] Task 1: Create src/services/settingsService.ts for unified Supabase + Firestore dual-sync, audit logging, and diagnostics
- [x] Task 2: Create src/pages/admin/settings/types.ts defining all schemas and settings keys
- [x] Task 3: Build Core Brand & Identity modules (BrandingSection.tsx, GeneralSection.tsx, CompanySection.tsx, ContactsSection.tsx) with live previews
- [x] Task 4: Build Commerce & Billing modules (PaymentSection.tsx, LocalizationTaxSection.tsx) with masked credentials and test diagnostics
- [x] Task 5: Build Communications modules (SmtpSection.tsx, EmailTemplatesSection.tsx, NotificationsSection.tsx) with test email sender and template variable insertion
- [x] Task 6: Build Platform, Security & Integrations (PlatformSection.tsx, RolesPermissionsSection.tsx, SecuritySection.tsx, ApiIntegrationsSection.tsx) with Security Score & Maintenance warnings
- [x] Task 7: Build Infrastructure modules (StorageCdnSection.tsx, DatabaseBackupSection.tsx, SystemHealthSection.tsx) with diagnostic health pings and backup generation
- [x] Task 8: Build Governance & Tooling (SeoSection.tsx, AuditLogsSection.tsx, ImportExportSection.tsx, VersionHistorySection.tsx) with SERP preview and JSON backup
- [x] Task 9: Redesign AdminSystemSettings.tsx into master hub with global search filter, responsive sidebar/dropdown navigation, sticky save bar, and confirmation dialogs
- [x] Task 10: Run full build and verify integration with existing useSystemSettings.ts and public quotation/price hiding flags

## Done When
- [x] All 32 requirement points are addressed and functional.
- [x] Zero breakages to existing feature toggles (hide_prices, loyalty_program_enabled, etc.).
- [x] Dual-sync works seamlessly across Supabase and Firestore.
- [x] Responsive design with dark enterprise visual aesthetics matching the screenshot.
