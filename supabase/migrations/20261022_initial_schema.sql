-- ==============================================================================
-- INKLOOM AI — SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- Multi-Tenant Brand Governance, Rule Verification, and Approvals
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(255),
    channels TEXT[] DEFAULT '{}',
    plan VARCHAR(50) DEFAULT 'enterprise',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('administrator', 'manager', 'reviewer', 'creator')),
    title VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Brand Guidelines
CREATE TABLE IF NOT EXISTS brand_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('tone', 'terminology', 'claim', 'disclaimer', 'accessibility', 'outdated_fact')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('prohibited_phrase', 'preferred_phrase', 'mandatory_disclaimer', 'unsupported_claim', 'voice_tone', 'outdated_fact')),
    pattern TEXT NOT NULL,
    replacement TEXT,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
    is_active BOOLEAN DEFAULT TRUE,
    examples TEXT[] DEFAULT '{}',
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Approved Facts & Organisational Baselines
CREATE TABLE IF NOT EXISTS approved_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    claim_key TEXT NOT NULL,
    verified_statement TEXT NOT NULL,
    source_doc TEXT NOT NULL,
    verified_by VARCHAR(255) NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Content Documents
CREATE TABLE IF NOT EXISTS content_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    channel VARCHAR(100) NOT NULL,
    original_text TEXT NOT NULL,
    current_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'changes_requested', 'resubmitted', 'approved', 'rejected')),
    created_by UUID REFERENCES profiles(id),
    assigned_reviewer_id UUID REFERENCES profiles(id),
    revisions_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Content Revisions
CREATE TABLE IF NOT EXISTS content_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES content_documents(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    text TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Reviews & Audit Reports
CREATE TABLE IF NOT EXISTS review_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES content_documents(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    summary TEXT NOT NULL,
    consistency_score INT NOT NULL CHECK (consistency_score BETWEEN 0 AND 100),
    engine_mode VARCHAR(50) NOT NULL CHECK (engine_mode IN ('hybrid', 'deterministic_only')),
    execution_duration_ms INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Review Issues
CREATE TABLE IF NOT EXISTS review_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES review_reports(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    evidence TEXT NOT NULL,
    start_index INT,
    end_index INT,
    explanation TEXT NOT NULL,
    guideline_reference VARCHAR(255) NOT NULL,
    suggestion TEXT NOT NULL,
    confidence NUMERIC(3, 2),
    requires_human_review BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'dismissed', 'flagged')),
    dismissal_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Approvals
CREATE TABLE IF NOT EXISTS approval_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES content_documents(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id),
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('approved', 'changes_requested', 'rejected')),
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id),
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Data Isolation
-- ==============================================================================

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Org Isolation Policy Helper:
-- Users can only read/write data belonging to an organization where they are a member.
CREATE POLICY "Tenant isolation for brand_guidelines"
    ON brand_guidelines FOR ALL
    USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for content_documents"
    ON content_documents FOR ALL
    USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for audit_logs"
    ON audit_logs FOR SELECT
    USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
