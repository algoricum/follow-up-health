-- Migration: Update default email templates by grade range
-- Run this in Supabase SQL Editor to update existing templates.

UPDATE email_templates
SET subject = 'You''re replying. But are decisions actually moving?',
    body = $$<p>You did well on the follow-up assessment.</p>
<p>Which usually means your team is replying. Messages go out. Follow-ups happen. Nothing looks obviously broken.</p>
<p>And that''s exactly why most clinics miss what actually slows growth. Replying fast doesn''t mean decisions are moving. It just means activity is happening.</p>
<p>The real question almost no one tracks is this: How long does it take a serious inquiry to decide? Not reply. Decide. From the first response to a final yes or no.</p>
<p>When that window stretches, things get harder. More follow-ups. More effort. Same results. Nothing feels wrong - it just feels heavier than it should.</p>
<p>We put together a short walkthrough that explains why this happens, where momentum leaks after the first reply, and how some clinics lock that momentum into a system instead of managing it manually.</p>
<p>You can see it here:<br>Start by locking momentum into a system</p>
<p>Take a look when you have a minute.</p>
<p>Hilda</p>$$
WHERE grade_range = 'A';

UPDATE email_templates
SET subject = 'Follow-up exists. It''s just not predictable.',
    body = $$<p>Your follow-up assessment didn''t come back clean. That doesn''t mean nothing is happening.</p>
<p>In most clinics, it means follow-up exists - just not in a way that''s predictable. Some inquiries get attention. Some move forward. Others stall quietly.</p>
<p>Here''s the part most teams don''t realize: Every inquiry still moves through the same three phases - response, momentum, decision.</p>
<p>When replies are inconsistent, momentum never really forms. And when momentum doesn''t form, decisions slow down before they even start. That''s why follow-up can feel exhausting without being effective.</p>
<p>We put together a short walkthrough that explains what''s happening after the first reply, why momentum breaks down when attention shifts, and how some clinics lock that momentum into a system instead of managing it manually.</p>
<p>You can see it here:<br>Start by locking momentum into a system</p>
<p>Take a look when you have a minute.</p>
<p>Hilda</p>$$
WHERE grade_range = 'BC';

UPDATE email_templates
SET subject = 'When follow-up feels messy, this is usually why',
    body = $$<p>Your follow-up assessment didn''t come back strong. That doesn''t mean your team isn''t trying.</p>
<p>In most clinics at this stage, follow-up isn''t a process. It''s whatever happens in between everything else. Some inquiries get a reply. Some don''t. Some get one message. Very few get a second.</p>
<p>When that happens, things don''t just slow down. They quietly slip through the cracks.</p>
<p>We put together a short walkthrough that explains why this happens, what''s actually missing when follow-up feels chaotic, and how some clinics put a simple system in place so nothing gets lost - even on busy days.</p>
<p>You can see it here:<br>Start by putting follow-up on solid ground</p>
<p>Take a look when you have a minute.</p>
<p>Hilda</p>$$
WHERE grade_range = 'DF';
