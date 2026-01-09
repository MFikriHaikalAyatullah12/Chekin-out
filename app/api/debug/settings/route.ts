import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getWITATime } from '@/lib/location';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get school settings
    const result = await pool.query('SELECT * FROM school_settings LIMIT 1');
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Belum ada pengaturan sekolah di database!' 
      }, { status: 404 });
    }
    
    const settings = result.rows[0];
    
    // Get current WITA time
    const witaTime = getWITATime();
    const currentHours = witaTime.getHours();
    const currentMinutes = witaTime.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}:00`;
    
    // Check if in windows
    const isCheckinTime = currentTimeStr >= settings.checkin_start_time && currentTimeStr <= settings.checkin_end_time;
    const isCheckoutTime = currentTimeStr >= settings.checkout_start_time && currentTimeStr <= settings.checkout_end_time;
    
    return NextResponse.json({
      success: true,
      settings: {
        location: {
          latitude: settings.school_latitude,
          longitude: settings.school_longitude,
          radius: settings.valid_radius
        },
        checkin: {
          start: settings.checkin_start_time,
          end: settings.checkin_end_time,
          active: isCheckinTime
        },
        checkout: {
          start: settings.checkout_start_time,
          end: settings.checkout_end_time,
          active: isCheckoutTime
        }
      },
      currentTime: {
        wita: witaTime.toISOString(),
        local: witaTime.toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }),
        timeString: currentTimeStr
      }
    });
  } catch (error) {
    console.error('Debug settings error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
