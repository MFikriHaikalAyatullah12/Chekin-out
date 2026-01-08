import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    const payload = await verifyToken(token || '');

    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [payload.userId, today]
    );

    return NextResponse.json({
      success: true,
      attendance: result.rows.length > 0 ? result.rows[0] : null,
    });
  } catch (error) {
    console.error('Get attendance status error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
