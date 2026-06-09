-- PRODUCTION-GRADE SUPABASE POSTGRESQL SCHEMA (SQL DDL)
-- Paste this script directly into the Supabase SQL Editor to initialize the database architecture.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL CONSTRAINT chk_streak_non_negative CHECK (current_streak >= 0),
    xp INTEGER DEFAULT 0 NOT NULL CONSTRAINT chk_xp_non_negative CHECK (xp >= 0),
    badges JSONB DEFAULT '[]'::jsonb NOT NULL
);

-- Indexing for user email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Table: carbon_logs
CREATE TABLE IF NOT EXISTS carbon_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CONSTRAINT chk_carbon_category CHECK (category IN ('Transport', 'Energy', 'Food')),
    metrics_json JSONB NOT NULL,
    calculated_co2_kg NUMERIC(10,2) NOT NULL CONSTRAINT chk_positive_co2 CHECK (calculated_co2_kg >= 0),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexing for relational lookups and filters by category/time
CREATE INDEX IF NOT EXISTS idx_carbon_logs_user_id ON carbon_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_logs_logged_at ON carbon_logs(logged_at);

-- 3. Table: ai_cached_insights
CREATE TABLE IF NOT EXISTS ai_cached_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_summary TEXT NOT NULL,
    recommendations JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexing for relational lookups
CREATE INDEX IF NOT EXISTS idx_ai_cached_insights_user_id ON ai_cached_insights(user_id);
