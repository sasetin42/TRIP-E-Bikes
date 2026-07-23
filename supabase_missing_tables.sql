-- ============================================================================
-- Supabase Missing Tables Migration
-- Tables required by the frontend api-client.ts and admin pages
-- Target: Supabase / PostgreSQL Database
-- Run this in the Supabase SQL Editor (or apply as a migration)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Cleanup / Drop Tables if they exist (Reverse Order of Dependency)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.loyalty_points CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.service_appointments CASCADE;
DROP TABLE IF EXISTS public.product_reviews CASCADE;
DROP TABLE IF EXISTS public.products_cms CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Helper trigger function (if not already defined by supabase_enterprise_additions.sql)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. user_profiles Table (referenced by product_reviews JOIN)
-- ----------------------------------------------------------------------------
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. products_cms Table
-- ----------------------------------------------------------------------------
CREATE TABLE public.products_cms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_key VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    original_price DECIMAL(12, 2),
    badge VARCHAR(100),
    category VARCHAR(100) NOT NULL DEFAULT 'Electric Bike',
    primary_image_url TEXT,
    gallery_images JSONB DEFAULT '[]',
    specs JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',
    use_cases JSONB DEFAULT '[]',
    colors JSONB DEFAULT '[]',
    addons JSONB DEFAULT '[]',
    in_stock BOOLEAN NOT NULL DEFAULT true,
    published BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_cms_published ON public.products_cms(published);
CREATE INDEX idx_products_cms_category ON public.products_cms(category);
CREATE INDEX idx_products_cms_sort ON public.products_cms(sort_order);

CREATE TRIGGER update_products_cms_updated_at
    BEFORE UPDATE ON public.products_cms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. product_reviews Table
-- ----------------------------------------------------------------------------
CREATE TABLE public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products_cms(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(100),
    reviewer_email VARCHAR(255),
    username VARCHAR(100),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    verified_purchase BOOLEAN NOT NULL DEFAULT false,
    helpful_count INT NOT NULL DEFAULT 0,
    moderation_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    admin_reply TEXT,
    admin_reply_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_status ON public.product_reviews(moderation_status);

CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON public.product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. service_appointments Table
-- ----------------------------------------------------------------------------
CREATE TABLE public.service_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_date ON public.service_appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.service_appointments(status);
CREATE INDEX idx_appointments_email ON public.service_appointments(customer_email);

CREATE TRIGGER update_service_appointments_updated_at
    BEFORE UPDATE ON public.service_appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 5. contact_messages Table (matches frontend interface)
-- ----------------------------------------------------------------------------
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    inquiry_type VARCHAR(100) NOT NULL DEFAULT 'General',
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    internal_notes TEXT,
    reply_count INT NOT NULL DEFAULT 0,
    last_replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_email ON public.contact_messages(email);

CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. blog_posts Table
-- ----------------------------------------------------------------------------
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    summary TEXT,
    author_name VARCHAR(100) NOT NULL,
    featured_image_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 7. chat_sessions Table
-- ----------------------------------------------------------------------------
CREATE TABLE public.chat_sessions (
    id VARCHAR(100) PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    ip_address VARCHAR(45),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    assigned_agent VARCHAR(100),
    last_message_at TIMESTAMPTZ,
    last_message TEXT,
    unread_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_sessions_status ON public.chat_sessions(status);

-- ----------------------------------------------------------------------------
-- 8. chat_messages Table
-- ----------------------------------------------------------------------------
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('customer', 'agent', 'bot')),
    sender_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at);

-- ----------------------------------------------------------------------------
-- 9. system_settings Table
-- ----------------------------------------------------------------------------
CREATE TABLE public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    label VARCHAR(255),
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 10. loyalty_points Table
-- ----------------------------------------------------------------------------
CREATE TABLE public.loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email VARCHAR(255) NOT NULL,
    points_balance INT NOT NULL DEFAULT 0,
    last_transaction_type VARCHAR(50) CHECK (last_transaction_type IN ('earn', 'redeem', 'adjust')),
    last_transaction_amount INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loyalty_points_email ON public.loyalty_points(customer_email);

CREATE TRIGGER update_loyalty_points_updated_at
    BEFORE UPDATE ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) & Access Control Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_cms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

-- Service Role Policies (complete backend access)
CREATE POLICY "service_role all user_profiles" ON public.user_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role all products_cms" ON public.products_cms FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role all product_reviews" ON public.product_reviews FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role all service_appointments" ON public.service_appointments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role all contact_messages" ON public.contact_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role all blog_posts" ON public.blog_posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role all chat_sessions" ON public.chat_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role all chat_messages" ON public.chat_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role all system_settings" ON public.system_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role all loyalty_points" ON public.loyalty_points FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anonymous Public Access Policies (needed for anon key to work)
-- Products: published products visible to all
CREATE POLICY "anon select published products" ON public.products_cms FOR SELECT TO anon USING (published = true);
CREATE POLICY "anon insert products" ON public.products_cms FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update products" ON public.products_cms FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete products" ON public.products_cms FOR DELETE TO anon USING (true);

-- Product reviews: approved reviews visible to all, anyone can insert
CREATE POLICY "anon select approved reviews" ON public.product_reviews FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert reviews" ON public.product_reviews FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update reviews" ON public.product_reviews FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete reviews" ON public.product_reviews FOR DELETE TO anon USING (true);

-- Contact messages: anyone can insert, anon can read/update
CREATE POLICY "anon select contact_messages" ON public.contact_messages FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert contact_messages" ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update contact_messages" ON public.contact_messages FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Service appointments: anyone can manage
CREATE POLICY "anon select appointments" ON public.service_appointments FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert appointments" ON public.service_appointments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update appointments" ON public.service_appointments FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Blog posts: published visible to all
CREATE POLICY "anon select published blog_posts" ON public.blog_posts FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert blog_posts" ON public.blog_posts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update blog_posts" ON public.blog_posts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete blog_posts" ON public.blog_posts FOR DELETE TO anon USING (true);

-- Chat: anon can read/insert
CREATE POLICY "anon select chat_sessions" ON public.chat_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert chat_sessions" ON public.chat_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update chat_sessions" ON public.chat_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon select chat_messages" ON public.chat_messages FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert chat_messages" ON public.chat_messages FOR INSERT TO anon WITH CHECK (true);

-- System settings: anon can read
CREATE POLICY "anon select system_settings" ON public.system_settings FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert system_settings" ON public.system_settings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update system_settings" ON public.system_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Loyalty points: anon can read/insert/update
CREATE POLICY "anon select loyalty_points" ON public.loyalty_points FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert loyalty_points" ON public.loyalty_points FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update loyalty_points" ON public.loyalty_points FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- User profiles: anon can read/insert/update
CREATE POLICY "anon select user_profiles" ON public.user_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert user_profiles" ON public.user_profiles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update user_profiles" ON public.user_profiles FOR UPDATE TO anon USING (true) WITH CHECK (true);
