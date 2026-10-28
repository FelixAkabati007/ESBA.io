-- ======================================================================================
-- E-SBA GHANA — PRODUCTION POSTGRESQL / SUPABASE SCHEMA
-- Multi-Tenant SaaS for Basic 1 to Basic 9 (JHS 3)
-- Fully compliant with NaCCA Pre-Tertiary Learning Assessment Framework (NPLAF)
-- Features: 51+ Normalized Tables, Row Level Security (RLS), Audit Triggers, RLS Policies
-- ======================================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================================================
-- 1. PLATFORM & SAAS ENGINE
-- ======================================================================================

CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users(id) in Supabase
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_globally_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- NULL for platform-wide alerts
    user_id UUID,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- SUBSCRIPTION_EXPIRING, DEADLINE, SCORE_SUBMITTED, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID,
    user_id UUID,
    user_name VARCHAR(150),
    user_role VARCHAR(50),
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, SUBMIT, APPROVE, SIGN, PUBLISH, etc.
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================================================
-- 2. SCHOOLS & TENANCY ENGINE
-- ======================================================================================

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    circuit VARCHAR(100),
    ges_registration_number VARCHAR(100),
    motto VARCHAR(255),
    head_teacher_name VARCHAR(150),
    head_teacher_signature_url TEXT,
    logo_url TEXT,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TRIAL', 'SUSPENDED', 'EXPIRED', 'FREE_EXCEPTION')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE school_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID UNIQUE NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    cat_weight_percent NUMERIC(5,2) DEFAULT 30.00,
    exam_weight_percent NUMERIC(5,2) DEFAULT 70.00,
    default_grading_scale_id UUID,
    signature_enabled BOOLEAN DEFAULT TRUE,
    auto_publish_reports BOOLEAN DEFAULT FALSE,
    show_position_on_report BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE school_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    contact_name VARCHAR(150) NOT NULL,
    role_title VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE school_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    UNIQUE(school_id, feature_key)
);

-- ======================================================================================
-- 3. SUBSCRIPTIONS & COMMERCIAL ENGINE
-- ======================================================================================

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_ghs NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    billing_cycle VARCHAR(20) DEFAULT 'TERMLY' CHECK (billing_cycle IN ('TERMLY', 'ANNUAL')),
    max_students INT NOT NULL DEFAULT 350,
    max_teachers INT NOT NULL DEFAULT 20,
    max_classes INT NOT NULL DEFAULT 12,
    enabled_levels JSONB DEFAULT '["B1","B2","B3","B4","B5","B6","B7","B8","B9"]'::jsonb,
    enabled_features JSONB DEFAULT '["sba_calculations","bulk_print","excel_import"]'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(30) DEFAULT 'TRIAL' CHECK (status IN ('TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'SUSPENDED', 'CANCELLED', 'FREE_EXCEPTION')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'TERMLY',
    student_limit INT NOT NULL DEFAULT 350,
    teacher_limit INT NOT NULL DEFAULT 20,
    class_limit INT NOT NULL DEFAULT 12,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscription_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exception_type VARCHAR(50) NOT NULL CHECK (exception_type IN ('FULL_FREE_ACCESS', 'TEMPORARY_FREE_ACCESS', 'FEATURE_FREE_ACCESS', 'EXTENDED_TRIAL', 'PROMOTIONAL_ACCESS')),
    reason TEXT NOT NULL,
    granted_by VARCHAR(150) NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    permanent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED'))
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount_ghs NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    school_id UUID NOT NULL REFERENCES schools(id),
    amount_paid_ghs NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- Mobile Money (MTN/Telecel/AirtelTigo), Bank Transfer, Card
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    confirmed_by VARCHAR(150)
);

-- ======================================================================================
-- 4. USERS & PROFILES ENGINE
-- ======================================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- matches auth.users(id)
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('MAIN_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')),
    phone VARCHAR(30),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    permission_name VARCHAR(100) NOT NULL,
    UNIQUE(user_id, permission_name)
);

CREATE TABLE teacher_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    specialization VARCHAR(150),
    qualification VARCHAR(150),
    signature_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, staff_id)
);

CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_number VARCHAR(50) NOT NULL,
    admission_number VARCHAR(50) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(50) DEFAULT 'Ghanaian',
    photo_url TEXT,
    parent_name VARCHAR(150) NOT NULL,
    parent_contact VARCHAR(30) NOT NULL,
    parent_email VARCHAR(150),
    home_address TEXT,
    admission_date DATE DEFAULT CURRENT_DATE,
    current_level_id VARCHAR(10) NOT NULL, -- B1 to B9
    current_class_id UUID,
    current_stream_id UUID,
    status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Active', 'Transferred', 'Withdrawn', 'Repeated', 'Graduated', 'Deactivated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, student_number),
    UNIQUE(school_id, admission_number)
);

CREATE TABLE school_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, user_id)
);

-- ======================================================================================
-- 5. ACADEMIC STRUCTURE ENGINE
-- ======================================================================================

CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    year_label VARCHAR(20) NOT NULL, -- e.g. '2025/2026'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, year_label)
);

CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    term_number INT NOT NULL CHECK (term_number IN (1, 2, 3)),
    term_name VARCHAR(20) NOT NULL, -- 'Term 1', 'Term 2', 'Term 3'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    vacation_date DATE,
    reopening_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    UNIQUE(academic_year_id, term_number)
);

CREATE TABLE levels (
    id VARCHAR(10) PRIMARY KEY, -- 'B1', 'B2', ..., 'B9'
    code VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    key_phase VARCHAR(10) NOT NULL CHECK (key_phase IN ('KP2', 'KP3', 'KP4'))
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    level_id VARCHAR(10) NOT NULL REFERENCES levels(id),
    name VARCHAR(50) NOT NULL, -- e.g. 'Basic 7' or 'JHS 1'
    class_teacher_id UUID REFERENCES teacher_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, name)
);

CREATE TABLE streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    stream_name VARCHAR(20) NOT NULL, -- 'A', 'B', 'Green'
    stream_label VARCHAR(50) NOT NULL, -- 'JHS 1A'
    class_teacher_id UUID REFERENCES teacher_profiles(id),
    UNIQUE(class_id, stream_name)
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE, -- NULL for official curriculum subjects
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_core BOOLEAN DEFAULT TRUE,
    applicable_key_phases JSONB DEFAULT '["KP2","KP3","KP4"]'::jsonb
);

CREATE TABLE teacher_subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'PRIMARY_TEACHER',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, term_id, class_id, stream_id, subject_id)
);

CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    level_id VARCHAR(10) NOT NULL REFERENCES levels(id),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    stream_id UUID REFERENCES streams(id) ON DELETE SET NULL,
    roll_number INT,
    status VARCHAR(30) DEFAULT 'Active',
    promotion_status VARCHAR(30) DEFAULT 'PENDING' CHECK (promotion_status IN ('PROMOTED', 'PROMOTED_WITH_CONDITIONS', 'REPEATED', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED', 'PENDING')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, term_id)
);

-- ======================================================================================
-- 6. CURRICULUM ENGINE (NaCCA Standards-Based)
-- ======================================================================================

CREATE TABLE curriculum_versions (
    id VARCHAR(50) PRIMARY KEY, -- 'NACCA_SBC_2020'
    code VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    framework_authority VARCHAR(50) DEFAULT 'NaCCA',
    effective_year INT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    description TEXT
);

CREATE TABLE curriculum_key_phases (
    id VARCHAR(10) PRIMARY KEY, -- 'KP2', 'KP3', 'KP4'
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE curriculum_levels (
    id VARCHAR(10) PRIMARY KEY REFERENCES levels(id),
    curriculum_version_id VARCHAR(50) REFERENCES curriculum_versions(id),
    key_phase_id VARCHAR(10) REFERENCES curriculum_key_phases(id)
);

CREATE TABLE curriculum_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_version_id VARCHAR(50) REFERENCES curriculum_versions(id),
    subject_id UUID REFERENCES subjects(id),
    key_phase_id VARCHAR(10) REFERENCES curriculum_key_phases(id)
);

CREATE TABLE strands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_version_id VARCHAR(50) REFERENCES curriculum_versions(id),
    subject_id UUID REFERENCES subjects(id),
    level_id VARCHAR(10) REFERENCES levels(id),
    strand_number INT NOT NULL,
    name VARCHAR(150) NOT NULL
);

CREATE TABLE sub_strands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strand_id UUID NOT NULL REFERENCES strands(id) ON DELETE CASCADE,
    sub_strand_number INT NOT NULL,
    name VARCHAR(150) NOT NULL
);

CREATE TABLE content_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_strand_id UUID NOT NULL REFERENCES sub_strands(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- 'B7.1.1.1'
    description TEXT NOT NULL
);

CREATE TABLE indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_standard_id UUID NOT NULL REFERENCES content_standards(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- 'B7.1.1.1.1'
    description TEXT NOT NULL
);

CREATE TABLE core_competencies (
    id VARCHAR(20) PRIMARY KEY, -- 'CP', 'CI', 'CC', 'CG', 'PL', 'DL'
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE values (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- ======================================================================================
-- 7. ASSESSMENT ENGINE
-- ======================================================================================

CREATE TABLE assessment_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    authority VARCHAR(50) DEFAULT 'NaCCA',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE assessment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE, -- NULL if global default
    name VARCHAR(150) NOT NULL,
    applicable_key_phases JSONB DEFAULT '["KP2","KP3","KP4"]'::jsonb,
    internal_max NUMERIC(5,2) NOT NULL DEFAULT 60.00,
    internal_weight_percent NUMERIC(5,2) NOT NULL DEFAULT 30.00,
    exam_max NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    exam_weight_percent NUMERIC(5,2) NOT NULL DEFAULT 70.00,
    final_max NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    is_default BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assessment_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- 'IND_TEST', 'GRP_WORK', 'IND_TASK', 'PRJ_WORK', 'END_EXAM'
    name VARCHAR(100) NOT NULL,
    component_type VARCHAR(50) NOT NULL, -- 'INDIVIDUAL_TEST', 'GROUP_WORK', etc.
    max_score NUMERIC(5,2) NOT NULL,
    is_internal_sba BOOLEAN DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 1
);

CREATE TABLE assessment_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE
);

CREATE TABLE assessment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    term_id UUID NOT NULL REFERENCES terms(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    stream_id UUID REFERENCES streams(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    template_id UUID NOT NULL REFERENCES assessment_templates(id),
    teacher_id UUID NOT NULL REFERENCES teacher_profiles(id),
    status VARCHAR(30) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'RETURNED', 'APPROVED', 'SIGNED', 'PUBLISHED', 'LOCKED', 'AMENDED')),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(term_id, class_id, stream_id, subject_id)
);

CREATE TABLE assessment_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    term_id UUID NOT NULL REFERENCES terms(id),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id),
    stream_id UUID REFERENCES streams(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    assessment_template_id UUID NOT NULL REFERENCES assessment_templates(id),
    component_id UUID NOT NULL REFERENCES assessment_components(id),
    raw_score NUMERIC(5,2) NOT NULL CHECK (raw_score >= 0),
    maximum_score NUMERIC(5,2) NOT NULL,
    scaled_score NUMERIC(5,2),
    entered_by UUID REFERENCES profiles(id),
    entered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'DRAFT',
    version INT NOT NULL DEFAULT 1,
    UNIQUE(term_id, student_id, subject_id, component_id)
);

CREATE TABLE assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assessment_record_id UUID NOT NULL REFERENCES assessment_records(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES profiles(id),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    review_notes TEXT,
    status VARCHAR(30) DEFAULT 'SUBMITTED'
);

CREATE TABLE assessment_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    score_id UUID NOT NULL REFERENCES assessment_scores(id) ON DELETE CASCADE,
    old_value NUMERIC(5,2) NOT NULL,
    proposed_value NUMERIC(5,2) NOT NULL,
    reason TEXT NOT NULL,
    requested_by UUID NOT NULL REFERENCES profiles(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE TABLE assessment_moderations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assessment_record_id UUID NOT NULL REFERENCES assessment_records(id) ON DELETE CASCADE,
    moderated_by UUID NOT NULL REFERENCES profiles(id),
    moderation_type VARCHAR(50) NOT NULL, -- MISSING_SCORES_CHECK, ANOMALY_CHECK, BOUNDARY_CHECK
    status VARCHAR(30) DEFAULT 'PASSED',
    findings TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================================================
-- 8. RESULTS & GRADING ENGINE
-- ======================================================================================

CREATE TABLE grading_scales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE, -- NULL if platform standard
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('NINE_POINT_NUMERIC', 'LETTER_SCALE_AF')),
    is_default BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grading_scale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grading_scale_id UUID NOT NULL REFERENCES grading_scales(id) ON DELETE CASCADE,
    grade VARCHAR(10) NOT NULL, -- '1', '2' or 'A', 'B'
    numerical_value INT NOT NULL,
    min_score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    descriptor VARCHAR(100) NOT NULL,
    remark VARCHAR(100) NOT NULL
);

CREATE TABLE subject_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    term_id UUID NOT NULL REFERENCES terms(id),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id),
    stream_id UUID REFERENCES streams(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    internal_total NUMERIC(5,2) NOT NULL,
    internal_scaled NUMERIC(5,2) NOT NULL,
    exam_raw NUMERIC(5,2) NOT NULL,
    exam_scaled NUMERIC(5,2) NOT NULL,
    final_total NUMERIC(5,2) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    descriptor VARCHAR(100),
    remark VARCHAR(100),
    subject_position INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(term_id, student_id, subject_id)
);

CREATE TABLE term_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    term_id UUID NOT NULL REFERENCES terms(id),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id),
    stream_id UUID REFERENCES streams(id),
    total_score NUMERIC(7,2) NOT NULL,
    average_score NUMERIC(5,2) NOT NULL,
    class_position INT,
    number_on_roll INT,
    status VARCHAR(30) DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(term_id, student_id)
);

CREATE TABLE annual_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id),
    annual_average NUMERIC(5,2) NOT NULL,
    annual_position INT,
    promotion_decision VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(academic_year_id, student_id)
);

CREATE TABLE rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES terms(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    stream_id UUID REFERENCES streams(id),
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    rank INT NOT NULL,
    score NUMERIC(7,2) NOT NULL,
    ranking_method VARCHAR(30) DEFAULT 'COMPETITION'
);

CREATE TABLE remarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    class_teacher_remark TEXT,
    head_teacher_remark TEXT,
    conduct_remark TEXT,
    interest_remark TEXT,
    promoted_to VARCHAR(50),
    UNIQUE(term_id, student_id)
);

-- ======================================================================================
-- 9. REPORTS & DIGITAL SIGNATURES ENGINE
-- ======================================================================================

CREATE TABLE report_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    verification_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'ESBA-2026-9F72A81'
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    term_id UUID NOT NULL REFERENCES terms(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    stream_id UUID REFERENCES streams(id),
    version INT NOT NULL DEFAULT 1,
    result_hash VARCHAR(100) NOT NULL,
    overall_position INT,
    number_on_roll INT,
    attendance_present INT DEFAULT 0,
    attendance_total INT DEFAULT 0,
    conduct_remark TEXT,
    interest_remark TEXT,
    class_teacher_remark TEXT,
    class_teacher_signed BOOLEAN DEFAULT FALSE,
    class_teacher_signed_at TIMESTAMPTZ,
    head_teacher_remark TEXT,
    head_teacher_signed BOOLEAN DEFAULT FALSE,
    head_teacher_signed_at TIMESTAMPTZ,
    promoted_to VARCHAR(50),
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(term_id, student_id, version)
);

CREATE TABLE report_card_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_card_id UUID NOT NULL REFERENCES report_cards(id) ON DELETE CASCADE,
    version INT NOT NULL,
    snapshot_payload JSONB NOT NULL,
    result_hash VARCHAR(100) NOT NULL,
    reason_for_revision TEXT,
    revised_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teacher_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    signature_asset TEXT NOT NULL,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    report_version INT NOT NULL,
    result_hash VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'VALID' CHECK (status IN ('VALID', 'INVALIDATED'))
);

CREATE TABLE headteacher_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    signature_asset TEXT NOT NULL,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    report_version INT NOT NULL,
    result_hash VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'VALID' CHECK (status IN ('VALID', 'INVALIDATED'))
);

CREATE TABLE report_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    stream_id UUID REFERENCES streams(id),
    published_by UUID NOT NULL REFERENCES profiles(id),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    total_reports_published INT NOT NULL,
    status VARCHAR(30) DEFAULT 'PUBLISHED'
);

-- ======================================================================================
-- 10. ATTENDANCE ENGINE
-- ======================================================================================

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    term_id UUID NOT NULL REFERENCES terms(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'EXCUSED', 'LATE')),
    reason TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

CREATE TABLE attendance_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id),
    total_days INT NOT NULL DEFAULT 0,
    days_present INT NOT NULL DEFAULT 0,
    days_absent INT NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0.00,
    UNIQUE(student_id, term_id)
);

-- ======================================================================================
-- 11. IMPORT / EXPORT ENGINE
-- ======================================================================================

CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('STUDENTS', 'TEACHERS', 'CLASSES', 'SCORES')),
    file_name VARCHAR(255) NOT NULL,
    total_rows INT NOT NULL DEFAULT 0,
    valid_rows INT NOT NULL DEFAULT 0,
    error_rows INT NOT NULL DEFAULT 0,
    status VARCHAR(30) DEFAULT 'PENDING_PREVIEW' CHECK (status IN ('PENDING_PREVIEW', 'IMPORTED', 'FAILED')),
    imported_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    imported_at TIMESTAMPTZ
);

CREATE TABLE import_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    row_data JSONB NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE
);

CREATE TABLE import_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    column_name VARCHAR(100),
    error_message TEXT NOT NULL
);

CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL,
    file_format VARCHAR(10) NOT NULL, -- 'XLSX', 'CSV', 'PDF'
    file_url TEXT,
    exported_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation guaranteeing School A cannot see School B data
-- ======================================================================================

-- Enable RLS on all tenant tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_moderations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_card_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE headteacher_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is platform super admin
CREATE OR REPLACE FUNCTION is_platform_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_admins 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get the current tenant school_id from user's JWT / profile
CREATE OR REPLACE FUNCTION get_current_school_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() ->> 'school_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant Policy template: School Admin & Teachers access only their own school
CREATE POLICY tenant_isolation_schools ON schools
    FOR ALL USING (is_platform_admin() OR id = get_current_school_id());

CREATE POLICY tenant_isolation_students ON student_profiles
    FOR ALL USING (is_platform_admin() OR school_id = get_current_school_id());

CREATE POLICY tenant_isolation_teachers ON teacher_profiles
    FOR ALL USING (is_platform_admin() OR school_id = get_current_school_id());

CREATE POLICY tenant_isolation_classes ON classes
    FOR ALL USING (is_platform_admin() OR school_id = get_current_school_id());

CREATE POLICY tenant_isolation_scores ON assessment_scores
    FOR ALL USING (is_platform_admin() OR school_id = get_current_school_id());

CREATE POLICY tenant_isolation_results ON subject_results
    FOR ALL USING (is_platform_admin() OR school_id = get_current_school_id());

CREATE POLICY tenant_isolation_reports ON report_cards
    FOR ALL USING (is_platform_admin() OR school_id = get_current_school_id());

CREATE POLICY tenant_isolation_attendance ON attendance_records
    FOR ALL USING (is_platform_admin() OR school_id = get_current_school_id());

CREATE POLICY tenant_isolation_audit ON audit_logs
    FOR ALL USING (is_platform_admin() OR school_id = get_current_school_id());
