-- Follow-Up Health Dashboard - Supabase Schema
-- Run this in Supabase SQL Editor to set up your tables

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  monthly_inquiries INT NOT NULL,
  response_time TEXT NOT NULL,
  follow_up_depth TEXT NOT NULL,
  patient_value TEXT NOT NULL,
  after_hours TEXT NOT NULL,
  grade TEXT NOT NULL,
  loss_rate DECIMAL NOT NULL,
  dropoff_pct INT NOT NULL,
  risk_low INT NOT NULL,
  risk_high INT NOT NULL,
  drivers TEXT[] NOT NULL,
  email TEXT
);

-- Create index for common queries
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_grade ON submissions(grade);
CREATE INDEX idx_submissions_email ON submissions(email) WHERE email IS NOT NULL;

-- Email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_range TEXT UNIQUE NOT NULL, -- 'A', 'BC', 'DF'
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  config JSONB, -- Optional JSON config for constants (e.g., CTA URL)
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (grade_range, subject, body) VALUES
  ('A', 'You''re replying. But are decisions actually moving?', $$<p>You did well on the follow-up assessment.</p>
<p>Which usually means your team is replying. Messages go out. Follow-ups happen. Nothing looks obviously broken.</p>
<p>And that''s exactly why most clinics miss what actually slows growth. Replying fast doesn''t mean decisions are moving. It just means activity is happening.</p>
<p>The real question almost no one tracks is this: How long does it take a serious inquiry to decide? Not reply. Decide. From the first response to a final yes or no.</p>
<p>When that window stretches, things get harder. More follow-ups. More effort. Same results. Nothing feels wrong - it just feels heavier than it should.</p>
<p>We put together a short walkthrough that explains why this happens, where momentum leaks after the first reply, and how some clinics lock that momentum into a system instead of managing it manually.</p>
<p>You can see it here:<br>Start by locking momentum into a system</p>
<p>Take a look when you have a minute.</p>
<p>Hilda</p>$$),
  ('BC', 'Follow-up exists. It''s just not predictable.', $$<p>Your follow-up assessment didn''t come back clean. That doesn''t mean nothing is happening.</p>
<p>In most clinics, it means follow-up exists - just not in a way that''s predictable. Some inquiries get attention. Some move forward. Others stall quietly.</p>
<p>Here''s the part most teams don''t realize: Every inquiry still moves through the same three phases - response, momentum, decision.</p>
<p>When replies are inconsistent, momentum never really forms. And when momentum doesn''t form, decisions slow down before they even start. That''s why follow-up can feel exhausting without being effective.</p>
<p>We put together a short walkthrough that explains what''s happening after the first reply, why momentum breaks down when attention shifts, and how some clinics lock that momentum into a system instead of managing it manually.</p>
<p>You can see it here:<br>Start by locking momentum into a system</p>
<p>Take a look when you have a minute.</p>
<p>Hilda</p>$$),
  ('DF', 'When follow-up feels messy, this is usually why', $$<p>Your follow-up assessment didn''t come back strong. That doesn''t mean your team isn''t trying.</p>
<p>In most clinics at this stage, follow-up isn''t a process. It''s whatever happens in between everything else. Some inquiries get a reply. Some don''t. Some get one message. Very few get a second.</p>
<p>When that happens, things don''t just slow down. They quietly slip through the cracks.</p>
<p>We put together a short walkthrough that explains why this happens, what''s actually missing when follow-up feels chaotic, and how some clinics put a simple system in place so nothing gets lost - even on busy days.</p>
<p>You can see it here:<br>Start by putting follow-up on solid ground</p>
<p>Take a look when you have a minute.</p>
<p>Hilda</p>$$);

-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (adjust as needed)
CREATE POLICY "Service role can insert submissions" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read submissions" ON submissions
  FOR SELECT USING (true);

CREATE POLICY "Service role can read templates" ON email_templates
  FOR SELECT USING (true);

CREATE POLICY "Service role can update templates" ON email_templates
  FOR UPDATE USING (true);

CREATE POLICY "Service role can insert templates" ON email_templates
  FOR INSERT WITH CHECK (true);
