import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Submission, CalculatorInputs } from '@/types';
import { calculateResults, getGradeRange } from '@/lib/scoring';
import { getTopDriverCodes } from '@/lib/drivers';
import { sendEmail, buildEmailHtml } from '@/lib/mailgun';

// Check if user is authenticated via cookie
async function isAuthorized(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export async function GET(request: NextRequest) {
  // Check authorization
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filters
    const grade = searchParams.get('grade');
    const hasEmail = searchParams.get('hasEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build WHERE clauses
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (grade) {
      conditions.push(`grade LIKE $${paramIndex}`);
      params.push(`${grade}%`);
      paramIndex++;
    }
    if (hasEmail === 'true') {
      conditions.push('email IS NOT NULL');
    } else if (hasEmail === 'false') {
      conditions.push('email IS NULL');
    }
    if (startDate) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get submissions
    const submissions = await query<Submission>(
      `SELECT * FROM submissions ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM submissions ${whereClause}`,
      params
    );
    const total = parseInt(countResult?.count || '0');

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Submissions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// Get summary stats
export async function HEAD() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get total count
    const totalResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM submissions'
    );

    // Get count with emails
    const withEmailResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM submissions WHERE email IS NOT NULL'
    );

    return new NextResponse(null, {
      headers: {
        'X-Total-Submissions': totalResult?.count || '0',
        'X-With-Email': withEmailResult?.count || '0',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

// Create a new submission (admin only)
export async function POST(request: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      monthly_inquiries,
      response_time,
      follow_up_depth,
      patient_value,
      after_hours,
      email,
    } = body;

    // Validate required fields
    if (
      !monthly_inquiries ||
      !response_time ||
      !follow_up_depth ||
      !patient_value ||
      !after_hours
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate input types
    const validResponseTimes = ['under5', '5-30', '30-2h', 'sameday', 'nextday'];
    const validFollowUpDepths = ['4-6', '2-3', '1', 'notsure'];
    const validPatientValues = ['under250', '250-500', '500-1000', '1000+'];
    const validAfterHours = ['yes', 'sometimes', 'no'];

    if (
      !validResponseTimes.includes(response_time) ||
      !validFollowUpDepths.includes(follow_up_depth) ||
      !validPatientValues.includes(patient_value) ||
      !validAfterHours.includes(after_hours)
    ) {
      return NextResponse.json(
        { error: 'Invalid input values' },
        { status: 400 }
      );
    }

    // Recalculate results server-side to ensure integrity
    const parsedMonthlyInquiries = parseInt(monthly_inquiries);
    if (parsedMonthlyInquiries > 400) {
      return NextResponse.json(
        { error: 'Monthly patient inquiries must be 400 or less' },
        { status: 400 }
      );
    }

    const inputs: CalculatorInputs = {
      monthlyInquiries: parsedMonthlyInquiries,
      responseTime: response_time,
      followUpDepth: follow_up_depth,
      patientValue: patient_value,
      afterHours: after_hours,
    };

    const results = calculateResults(inputs);
    const drivers = getTopDriverCodes(inputs);

    // Insert submission
    const submission = await queryOne<Submission>(
      `INSERT INTO submissions (
        monthly_inquiries, response_time, follow_up_depth, patient_value,
        after_hours, grade, loss_rate, dropoff_pct, risk_low, risk_high,
        drivers, email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        inputs.monthlyInquiries,
        inputs.responseTime,
        inputs.followUpDepth,
        inputs.patientValue,
        inputs.afterHours,
        results.grade,
        results.lossRate,
        results.dropoffPercent,
        results.revenueAtRisk.low,
        results.revenueAtRisk.high,
        drivers,
        email || null,
      ]
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [ADMIN] Submission created successfully`);
    console.log(`[${timestamp}] [ADMIN] Submission ID: ${submission.id}`);
    console.log(`[${timestamp}] [ADMIN] Grade: ${results.grade}`);

    // Send email if provided
    if (email) {
      console.log(`[${timestamp}] [ADMIN] Email provided, preparing to send email`);
      console.log(`[${timestamp}] [ADMIN] Email: ${email}`);

      try {
        const gradeRange = getGradeRange(results.grade);
        console.log(`[${timestamp}] [ADMIN] Grade range: ${gradeRange}`);

        const template = await queryOne<{
          subject: string;
          body: string;
        }>(
          'SELECT subject, body FROM email_templates WHERE grade_range = $1',
          [gradeRange]
        );

        if (template) {
          console.log(`[${timestamp}] [ADMIN] Template found for grade range ${gradeRange}`);
        } else {
          console.log(`[${timestamp}] [ADMIN] No template found for grade range ${gradeRange}, using defaults`);
        }

        const subject = template?.subject ?? `Your Follow-Up Health Score: ${results.grade}`;
        const customContent = template?.body?.trim() ?? '';

        console.log(`[${timestamp}] [ADMIN] Email subject: ${subject}`);
        console.log(`[${timestamp}] [ADMIN] Custom content length: ${customContent.length} characters`);

        const emailHtml = buildEmailHtml({
          customContent,
          placeholders: {
            grade: results.grade,
            risk_low: results.revenueAtRisk.low.toLocaleString(),
            risk_high: results.revenueAtRisk.high.toLocaleString(),
            dropoff_percent: String(results.dropoffPercent),
          },
        });

        console.log(`[${timestamp}] [ADMIN] Email HTML generated (${emailHtml.length} characters)`);
        console.log(`[${timestamp}] [ADMIN] Calling sendEmail...`);

        const emailSent = await sendEmail({
          to: email,
          subject,
          html: emailHtml,
        });

        if (emailSent) {
          console.log(`[${timestamp}] [ADMIN] ✓ Email sent successfully for manually created submission`);
          console.log(`[${timestamp}] [ADMIN] Submission ID: ${submission.id}`);
        } else {
          console.error(`[${timestamp}] [ADMIN] ✗ Failed to send email for manually created submission`);
          console.error(`[${timestamp}] [ADMIN] Submission ID: ${submission.id}`);
        }
      } catch (emailError) {
        console.error(`[${timestamp}] [ADMIN] Error sending email for submission ${submission.id}:`, emailError);
        // Don't fail the submission creation if email fails
      }
    } else if (email) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [ADMIN] Email provided but submission not created, skipping email send`);
    } else {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [ADMIN] No email provided, skipping email send`);
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error('Submission create error:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

// Update an existing submission (admin only)
export async function PUT(request: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      monthly_inquiries,
      response_time,
      follow_up_depth,
      patient_value,
      after_hours,
      email,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !monthly_inquiries ||
      !response_time ||
      !follow_up_depth ||
      !patient_value ||
      !after_hours
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate input types
    const validResponseTimes = ['under5', '5-30', '30-2h', 'sameday', 'nextday'];
    const validFollowUpDepths = ['4-6', '2-3', '1', 'notsure'];
    const validPatientValues = ['under250', '250-500', '500-1000', '1000+'];
    const validAfterHours = ['yes', 'sometimes', 'no'];

    if (
      !validResponseTimes.includes(response_time) ||
      !validFollowUpDepths.includes(follow_up_depth) ||
      !validPatientValues.includes(patient_value) ||
      !validAfterHours.includes(after_hours)
    ) {
      return NextResponse.json(
        { error: 'Invalid input values' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existing = await queryOne<Submission>(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Recalculate results server-side
    const inputs: CalculatorInputs = {
      monthlyInquiries: parseInt(monthly_inquiries),
      responseTime: response_time,
      followUpDepth: follow_up_depth,
      patientValue: patient_value,
      afterHours: after_hours,
    };

    const results = calculateResults(inputs);
    const drivers = getTopDriverCodes(inputs);

    // Update submission
    const submission = await queryOne<Submission>(
      `UPDATE submissions SET
        monthly_inquiries = $1,
        response_time = $2,
        follow_up_depth = $3,
        patient_value = $4,
        after_hours = $5,
        grade = $6,
        loss_rate = $7,
        dropoff_pct = $8,
        risk_low = $9,
        risk_high = $10,
        drivers = $11,
        email = $12
      WHERE id = $13
      RETURNING *`,
      [
        inputs.monthlyInquiries,
        inputs.responseTime,
        inputs.followUpDepth,
        inputs.patientValue,
        inputs.afterHours,
        results.grade,
        results.lossRate,
        results.dropoffPercent,
        results.revenueAtRisk.low,
        results.revenueAtRisk.high,
        drivers,
        email || null,
        id,
      ]
    );

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Submission update error:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

// Delete a submission (admin only)
export async function DELETE(request: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existing = await queryOne<Submission>(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Delete submission
    await query('DELETE FROM submissions WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submission delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
