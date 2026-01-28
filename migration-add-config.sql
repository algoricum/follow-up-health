-- Migration: Add config column to email_templates table
-- Run this in Supabase SQL Editor if the config column doesn't exist yet

ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS config JSONB;
