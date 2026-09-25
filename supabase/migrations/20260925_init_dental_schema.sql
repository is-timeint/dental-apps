-- ==============================================================================
-- DENTAL-APPS PMS / EDR - INITIAL DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Standard: Permenkes 24/2022, UU PDP 27/2022, Multi-Tenant clinic_id Isolation
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clinics (Tenant Master)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_entity_name VARCHAR(255),
    license_number VARCHAR(100),
    satusehat_org_id VARCHAR(100),
    bpjs_fktp_code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Branches
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users / Clinic Staff Profiles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'ROLE_SUPERADMIN', 'ROLE_CLINIC_OWNER', 'ROLE_CLINIC_MANAGER',
        'ROLE_DENTIST_SPECIALIST', 'ROLE_DENTIST_GP', 'ROLE_DENTAL_NURSE',
        'ROLE_FRONT_DESK', 'ROLE_PHARMACIST', 'ROLE_FINANCE_CASHIER'
    )),
    sip_number VARCHAR(100),
    str_number VARCHAR(100),
    satusehat_ihs_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Dental Chairs (Live Floor)
CREATE TABLE IF NOT EXISTS dental_chairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    chair_number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN (
        'AVAILABLE', 'IN_TREATMENT', 'DISINFECTION', 'MAINTENANCE'
    )),
    current_dentist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_patient_id UUID,
    started_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Patients
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    medical_record_number VARCHAR(50) NOT NULL,
    nik VARCHAR(16),
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE')),
    phone_number VARCHAR(30) NOT NULL,
    whatsapp_number VARCHAR(30),
    email VARCHAR(255),
    blood_type VARCHAR(5),
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    systemic_diseases TEXT[] DEFAULT ARRAY[]::TEXT[],
    satusehat_patient_ihs VARCHAR(100),
    bpjs_card_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Encounters (Kunjungan Klinis Gigi)
CREATE TABLE IF NOT EXISTS encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES users(id),
    chair_id UUID REFERENCES dental_chairs(id) ON DELETE SET NULL,
    encounter_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (status IN (
        'ARRIVED', 'TRIAGED', 'IN_CHAIR', 'COMPLETED', 'CANCELLED'
    )),
    chief_complaint TEXT,
    systolic_bp INT,
    diastolic_bp INT,
    heart_rate INT,
    oxygen_saturation INT,
    temperature_celsius NUMERIC(4,1),
    satusehat_encounter_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Odontogram Surfaces (Rekam Medis Gigi 5-Permukaan FDI)
CREATE TABLE IF NOT EXISTS odontogram_surfaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    fdi_number INT NOT NULL,
    surface_o VARCHAR(50) DEFAULT 'HEALTHY',
    surface_m VARCHAR(50) DEFAULT 'HEALTHY',
    surface_d VARCHAR(50) DEFAULT 'HEALTHY',
    surface_b VARCHAR(50) DEFAULT 'HEALTHY',
    surface_l VARCHAR(50) DEFAULT 'HEALTHY',
    general_condition VARCHAR(50) DEFAULT 'HEALTHY',
    icd10_diagnosis VARCHAR(50),
    clinical_notes TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Periodontal Probing Examinations (6-Point Probing)
CREATE TABLE IF NOT EXISTS periodontal_examinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    fdi_number INT NOT NULL,
    pd_disto_buccal INT DEFAULT 2,
    pd_mid_buccal INT DEFAULT 2,
    pd_mesio_buccal INT DEFAULT 2,
    pd_disto_lingual INT DEFAULT 2,
    pd_mid_lingual INT DEFAULT 2,
    pd_mesio_lingual INT DEFAULT 2,
    bleeding_on_probing BOOLEAN DEFAULT FALSE,
    furcation_involvement INT DEFAULT 0,
    mobility_grade INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Dental Lab Orders (SPK Lab & Interlock)
CREATE TABLE IF NOT EXISTS dental_lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES users(id),
    fdi_teeth INT[] NOT NULL,
    prosthetic_type VARCHAR(100) NOT NULL,
    shade_guide VARCHAR(50),
    lab_vendor_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'IMPRESSION_TAKEN' CHECK (status IN (
        'IMPRESSION_TAKEN', 'SENT_TO_VENDOR', 'IN_FABRICATION',
        'RECEIVED_QC_PASSED', 'SEATED_COMPLETED', 'REJECTED_REMAKE'
    )),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Invoices & Billing
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(15,2) DEFAULT 0,
    insurance_covered_amount NUMERIC(15,2) DEFAULT 0,
    patient_paid_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'UNPAID' CHECK (payment_status IN (
        'UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Immutable Audit Logs (UU PDP & Permenkes 24/2022)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_chairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontogram_surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodontal_examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Multi-Tenant Isolation: Users can only query their own clinic's data
CREATE POLICY clinic_isolation_patients ON patients
    FOR ALL
    USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

CREATE POLICY clinic_isolation_encounters ON encounters
    FOR ALL
    USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

CREATE POLICY clinic_isolation_odontogram ON odontogram_surfaces
    FOR ALL
    USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

CREATE POLICY clinic_isolation_chairs ON dental_chairs
    FOR ALL
    USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);
