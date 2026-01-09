// Test script untuk verifikasi fungsi waktu WITA
// Run: node scripts/test-wita.js

const getWITATime = () => {
  const now = new Date();
  // Convert to WITA (UTC+8)
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const witaTime = new Date(utcTime + (8 * 3600000));
  return witaTime;
};

const getWITADateString = () => {
  const witaTime = getWITATime();
  return witaTime.toISOString().split('T')[0];
};

console.log('=== Test Fungsi Waktu WITA ===\n');

const now = new Date();
const witaTime = getWITATime();
const witaDate = getWITADateString();

console.log('Waktu Server (Local):', now.toString());
console.log('UTC:', now.toISOString());
console.log('\nWaktu WITA (UTC+8):', witaTime.toISOString());
console.log('WITA Date String:', witaDate);
console.log('\nWaktu WITA (Readable):', witaTime.toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }));

// Test untuk validasi jam
const testCheckinWindow = (currentTime, startTime, endTime) => {
  const witaTime = getWITATime();
  const current = witaTime.getHours() * 60 + witaTime.getMinutes();
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  
  return current >= start && current <= end;
};

console.log('\n=== Test Validasi Jam ===\n');
console.log('Contoh jam check-in: 06:30 - 08:00');
const isWithinCheckin = testCheckinWindow(witaTime, '06:30', '08:00');
console.log('Apakah sekarang dalam window check-in?', isWithinCheckin ? 'YA ✅' : 'TIDAK ❌');

console.log('\nContoh jam check-out: 14:00 - 16:00');
const isWithinCheckout = testCheckinWindow(witaTime, '14:00', '16:00');
console.log('Apakah sekarang dalam window check-out?', isWithinCheckout ? 'YA ✅' : 'TIDAK ❌');

console.log('\n=== Selesai ===');
