export type SettingsSectionId =
  | "features"
  | "branding"
  | "general"
  | "company"
  | "contacts"
  | "payment"
  | "smtp"
  | "templates"
  | "notifications"
  | "platform"
  | "roles"
  | "security"
  | "api"
  | "storage"
  | "cdn"
  | "database"
  | "seo"
  | "localization"
  | "tax"
  | "maintenance"
  | "audit"
  | "version"
  | "backup_export";

export interface ContactProfile {
  id: string;
  name: string;
  department: "General" | "Sales" | "Accounting" | "Support" | "Technical" | "Management";
  email: string;
  phone: string;
  mobile: string;
  position: string;
  status: "active" | "inactive";
  receivesNotifications: boolean;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  enabled: boolean;
  mode: "sandbox" | "live";
  accountId: string;
  apiKey: string;
  secretKey: string;
  webhookUrl: string;
  webhookSecret: string;
  feePercentage: number;
  fixedFee: number;
  currency: string;
  instructions: string;
}

export type EmailTemplateCategory =
  | "Welcome Email"
  | "Email Verification"
  | "Password Reset"
  | "Change Password Confirmation"
  | "Account Created"
  | "Account Approved"
  | "Account Suspended"
  | "Login Notification"
  | "Security Alert"
  | "Quotation & Fleet Proposal"
  | "Test Ride & Showroom"
  | "Battery & Maintenance"
  | "Course Enrollment Confirmation"
  | "Course Completion"
  | "Payment Confirmation"
  | "Invoice / Receipt"
  | "General System Notification"
  | "Custom Templates";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: EmailTemplateCategory | string;
  senderName?: string;
  replyToEmail?: string;
  htmlBody: string;
  plainTextBody?: string;
  variables: string[];
  status: "draft" | "active" | "inactive";
  enabled: boolean;
  isSystemDefault?: boolean;
  createdAt?: string;
  lastModified?: string;
}

export interface EmailLogEntry {
  id: string;
  recipient: string;
  subject: string;
  templateId: string;
  templateName: string;
  category: string;
  sentAt: string;
  status: "delivered" | "sent" | "failed" | "pending";
  errorDetails?: string;
  smtpHost: string;
  senderEmail: string;
  retryCount: number;
}


export interface NotificationRule {
  id: string;
  event: string;
  label: string;
  category: "Billing" | "Leads" | "Security" | "Fleet";
  email: boolean;
  inApp: boolean;
  sms: boolean;
  push: boolean;
  targetRole: "Admin" | "Manager" | "Customer" | "All";
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  keyMasked: string;
  fullKey?: string;
  createdDate: string;
  lastUsed: string;
  expiresAt: string;
  scopes: string[];
  status: "active" | "revoked";
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  device: string;
  browser: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
}

export interface SystemSettingsState {
  // 1. Features
  loyalty_program_enabled: boolean;
  chat_enabled: boolean;
  reviews_enabled: boolean;
  referral_enabled: boolean;
  hide_prices: boolean;

  // 2. Branding & Logo
  logo_main: string;
  logo_light: string;
  logo_dark: string;
  logo_mobile: string;
  logo_favicon: string;
  logo_login: string;
  logo_email: string;
  logo_invoice: string;
  logo_admin: string;

  // 3. General Settings
  site_title: string;
  site_description: string;
  company_name: string;
  company_reg_name: string;
  website_url: string;
  default_language: string;
  default_currency: string;
  default_country: string;
  timezone: string;
  date_format: string;
  time_format: string;
  first_day_week: string;
  measurement_unit: string;
  number_format: string;
  system_status: string;

  // 4. Company Profile
  company_legal_name: string;
  company_trading_name: string;
  company_reg_number: string;
  company_tax_id: string;
  company_address: string;
  company_city: string;
  company_province: string;
  company_country: string;
  company_zip: string;
  company_phone: string;
  company_mobile: string;
  company_email: string;
  company_website: string;
  company_facebook: string;
  company_instagram: string;
  company_twitter: string;
  company_description: string;
  company_terms: string;
  company_privacy: string;
  company_business_hours: string;

  // 5. Contacts
  contact_profiles: ContactProfile[];

  // 6. Payment Settings
  payment_gateways: PaymentGatewayConfig[];

  // 7. Email / SMTP
  smtp_provider: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_encrypt: string;
  smtp_from_email: string;
  smtp_from_name: string;
  smtp_reply_to: string;
  smtp_cc: string;
  smtp_bcc: string;

  // 8. Email Templates
  email_templates: EmailTemplate[];

  // 9. Notifications
  notification_rules: NotificationRule[];

  // 10. Platform Settings
  maintenance_mode: boolean;
  maintenance_message: string;
  allow_new_registrations: boolean;
  allow_guest_access: boolean;
  session_timeout_minutes: string;
  max_login_attempts: string;
  password_expiration_days: string;
  default_user_role: string;
  pagination_size: string;
  file_upload_limit_mb: string;
  max_request_size_mb: string;

  // 11. Roles & Permissions
  role_permissions: Record<string, Record<string, boolean>>;

  // 12. Security
  security_two_factor: boolean;
  security_brute_force: boolean;
  security_ip_whitelist: string;
  security_ip_blacklist: string;
  security_min_password_length: string;
  security_require_special_chars: boolean;
  security_require_numbers: boolean;
  security_require_uppercase: boolean;
  security_lockout_duration_mins: string;
  security_active_sessions_count: number;

  // 13. API & Integrations
  api_keys: ApiKeyItem[];
  webhook_endpoint: string;
  webhook_secret_key: string;
  google_maps_api_key: string;
  google_analytics_id: string;

  // 14. Storage & Media
  storage_provider: string;
  storage_bucket: string;
  storage_region: string;
  storage_max_file_size_mb: string;
  storage_allowed_types: string;
  storage_auto_webp: boolean;
  storage_image_compression_quality: string;
  storage_quota_gb: number;
  storage_used_gb: number;

  // 15. CDN Configuration
  cdn_provider: string;
  cdn_url: string;
  cdn_pull_zone: string;
  cdn_api_key: string;
  cdn_cache_duration_hours: string;
  cdn_status: string;

  // 16. Database & Backup
  database_type: string;
  database_host: string;
  database_size_mb: number;
  database_last_backup: string;
  database_auto_backup: boolean;
  database_backup_frequency: string;
  database_retention_days: string;

  // 17. SEO & Metadata
  seo_site_title: string;
  seo_meta_description: string;
  seo_keywords: string;
  seo_canonical_url: string;
  seo_og_title: string;
  seo_og_description: string;
  seo_og_image: string;
  seo_twitter_card: string;
  seo_robots_txt: string;
  seo_google_site_verification: string;

  // 18. Localization & Currency
  loc_language: string;
  loc_currency: string;
  loc_currency_symbol: string;
  loc_decimal_places: string;
  loc_thousands_sep: string;

  // 19. Tax & Financial
  tax_default_rate: string;
  tax_vat_number: string;
  tax_inclusive: boolean;
  tax_withholding_rate: string;
  tax_invoice_prefix: string;
  tax_receipt_prefix: string;
  tax_quote_prefix: string;
  tax_payment_terms_days: string;

  // 20. Versioning
  config_version: string;
  last_saved_at?: string;
  last_saved_by?: string;
}
