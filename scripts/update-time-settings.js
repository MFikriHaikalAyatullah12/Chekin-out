import pool from '../lib/db.js';

async function updateTimeSettings() {
  try {
    console.log('🔧 Memperbarui pengaturan waktu check-in/out...\n');
    
    // Check current settings
    const currentResult = await pool.query('SELECT * FROM school_settings LIMIT 1');
    
    if (currentResult.rows.length === 0) {
      console.log('❌ Belum ada pengaturan sekolah di database!');
      console.log('💡 Silakan jalankan migration untuk membuat tabel school_settings');
      await pool.end();
      return;
    }
    
    const current = currentResult.rows[0];
    console.log('📊 Pengaturan Saat Ini:');
    console.log(`   Check-in: ${current.checkin_start_time} - ${current.checkin_end_time}`);
    console.log(`   Check-out: ${current.checkout_start_time} - ${current.checkout_end_time}\n`);
    
    // Update to correct times
    await pool.query(`
      UPDATE school_settings 
      SET 
        checkin_start_time = '07:00:00',
        checkin_end_time = '12:00:00',
        checkout_start_time = '14:00:00',
        checkout_end_time = '15:00:00'
      WHERE id = $1
    `, [current.id]);
    
    console.log('✅ Berhasil memperbarui pengaturan waktu!\n');
    
    // Verify update
    const verifyResult = await pool.query('SELECT * FROM school_settings WHERE id = $1', [current.id]);
    const updated = verifyResult.rows[0];
    
    console.log('📊 Pengaturan Baru:');
    console.log(`   Check-in: ${updated.checkin_start_time} - ${updated.checkin_end_time}`);
    console.log(`   Check-out: ${updated.checkout_start_time} - ${updated.checkout_end_time}\n`);
    
    // Check current WITA time
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const witaTime = new Date(utcTime + (8 * 3600000));
    
    const currentHours = witaTime.getHours();
    const currentMinutes = witaTime.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}:00`;
    
    console.log(`🕐 Waktu Sekarang (WITA): ${witaTime.toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}`);
    console.log(`   Time string: ${currentTimeStr}\n`);
    
    // Check if in windows
    const isCheckinTime = currentTimeStr >= updated.checkin_start_time && currentTimeStr <= updated.checkin_end_time;
    const isCheckoutTime = currentTimeStr >= updated.checkout_start_time && currentTimeStr <= updated.checkout_end_time;
    
    console.log('📊 Status Saat Ini:');
    console.log(`${isCheckinTime ? '✅' : '❌'} Check-in: ${isCheckinTime ? 'AKTIF' : 'TUTUP'}`);
    console.log(`${isCheckoutTime ? '✅' : '❌'} Check-out: ${isCheckoutTime ? 'AKTIF' : 'TUTUP'}\n`);
    
    await pool.end();
    console.log('✨ Selesai!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateTimeSettings();
