import pool from '../lib/db.js';

async function checkSettings() {
  try {
    console.log('🔍 Memeriksa pengaturan sekolah...\n');
    
    const result = await pool.query('SELECT * FROM school_settings LIMIT 1');
    
    if (result.rows.length === 0) {
      console.log('❌ Belum ada pengaturan sekolah di database!');
      return;
    }
    
    const settings = result.rows[0];
    
    console.log('✅ Pengaturan Sekolah:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Lokasi Sekolah: ${settings.school_latitude}, ${settings.school_longitude}`);
    console.log(`📏 Radius Valid: ${settings.valid_radius} meter`);
    console.log(`\n⏰ Waktu Check-in: ${settings.checkin_start_time} - ${settings.checkin_end_time}`);
    console.log(`⏰ Waktu Check-out: ${settings.checkout_start_time} - ${settings.checkout_end_time}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Check current WITA time
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const witaTime = new Date(utcTime + (8 * 3600000));
    
    console.log(`🕐 Waktu Sekarang (WITA): ${witaTime.toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}`);
    
    const currentHours = witaTime.getHours();
    const currentMinutes = witaTime.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}:00`;
    
    console.log(`\n📊 Status Saat Ini:`);
    
    // Check if in checkin window
    const isCheckinTime = currentTimeStr >= settings.checkin_start_time && currentTimeStr <= settings.checkin_end_time;
    console.log(`${isCheckinTime ? '✅' : '❌'} Check-in: ${isCheckinTime ? 'AKTIF' : 'TUTUP'}`);
    
    // Check if in checkout window
    const isCheckoutTime = currentTimeStr >= settings.checkout_start_time && currentTimeStr <= settings.checkout_end_time;
    console.log(`${isCheckoutTime ? '✅' : '❌'} Check-out: ${isCheckoutTime ? 'AKTIF' : 'TUTUP'}`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSettings();
