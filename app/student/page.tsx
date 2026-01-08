'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [showClassList, setShowClassList] = useState(false);
  const [joiningClass, setJoiningClass] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'STUDENT') {
      router.push('/login');
      return;
    }

    setUser(userData);
    
    // If user doesn't have a class, show class selection
    if (!userData.class) {
      fetchAvailableClasses();
      setShowClassList(true);
      setLoading(false);
    } else {
      fetchAttendanceStatus();
    }
  }, [router]);

  const fetchAttendanceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAttendance(data.attendance);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/available-classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAvailableClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleJoinClass = async (classId: number, className: string) => {
    if (!confirm(`Apakah Anda yakin ingin bergabung dengan kelas ${className}? Anda hanya dapat bergabung dengan satu kelas.`)) {
      return;
    }

    setJoiningClass(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/join-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ class_id: classId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal bergabung ke kelas');
      }

      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setMessage({ type: 'success', text: data.message });
      setShowClassList(false);
      
      // Fetch attendance status after joining class
      fetchAttendanceStatus();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setJoiningClass(false);
    }
  };

  const getLocation = (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser Anda'));
        return;
      }

      console.log('Requesting high accuracy location...');
      
      let watchId: number;
      let bestAccuracy = Infinity;
      let bestPosition: GeolocationPosition | null = null;
      let attempts = 0;
      const maxAttempts = 10; // Try to get better accuracy for up to 10 readings
      const acceptableAccuracy = 100; // Accept if accuracy is better than 100 meters

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          attempts++;
          console.log(`Location attempt ${attempts}: accuracy = ${position.coords.accuracy}m`);
          
          // Keep track of the best (most accurate) position
          if (position.coords.accuracy < bestAccuracy) {
            bestAccuracy = position.coords.accuracy;
            bestPosition = position;
          }

          // If we got good accuracy or reached max attempts, resolve
          if (position.coords.accuracy <= acceptableAccuracy || attempts >= maxAttempts) {
            navigator.geolocation.clearWatch(watchId);
            
            if (bestPosition) {
              console.log('Best location found:', {
                lat: bestPosition.coords.latitude,
                lng: bestPosition.coords.longitude,
                accuracy: bestPosition.coords.accuracy
              });
              
              resolve({
                latitude: bestPosition.coords.latitude,
                longitude: bestPosition.coords.longitude,
                accuracy: bestPosition.coords.accuracy,
              });
            } else {
              reject(new Error('Tidak dapat mendapatkan lokasi yang akurat'));
            }
          }
        },
        (error) => {
          if (watchId) {
            navigator.geolocation.clearWatch(watchId);
          }
          
          console.error('Geolocation error:', error);
          let errorMessage = 'Gagal mendapatkan lokasi. ';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Izin lokasi ditolak. Silakan berikan izin di pengaturan browser.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Informasi lokasi tidak tersedia. Pastikan GPS aktif dan Anda di luar ruangan.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Waktu permintaan lokasi habis. Silakan coba lagi di area dengan sinyal GPS lebih baik.';
              break;
            default:
              errorMessage += 'Terjadi kesalahan tidak dikenal.';
          }
          
          reject(new Error(errorMessage));
        },
        { 
          enableHighAccuracy: true, 
          timeout: 45000, // 45 seconds total timeout
          maximumAge: 0 
        }
      );

      // Fallback: if nothing happens after 45 seconds, use best position we got
      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        if (bestPosition) {
          console.log('Timeout reached, using best position with accuracy:', bestPosition.coords.accuracy);
          resolve({
            latitude: bestPosition.coords.latitude,
            longitude: bestPosition.coords.longitude,
            accuracy: bestPosition.coords.accuracy,
          });
        } else {
          reject(new Error('Timeout: Tidak dapat mendapatkan lokasi. Pastikan GPS aktif dan Anda berada di area terbuka.'));
        }
      }, 45000);
    });
  };

  const handleCheckin = async () => {
    setActionLoading(true);
    setMessage({ type: 'success', text: '📍 Mencari sinyal GPS terbaik... Mohon tunggu 10-30 detik untuk akurasi optimal.' });

    try {
      const location = await getLocation();
      
      // Show accuracy in message
      const accuracyText = location.accuracy < 50 
        ? '✓ Akurasi sangat baik' 
        : location.accuracy < 100 
        ? '✓ Akurasi baik'
        : location.accuracy < 500
        ? '⚠️ Akurasi cukup'
        : '⚠️ Akurasi rendah';
      
      setMessage({ 
        type: 'success', 
        text: `${accuracyText} (${Math.round(location.accuracy)}m). Memproses check-in...` 
      });
      
      const token = localStorage.getItem('token');

      const response = await fetch('/api/student/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(location),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-in gagal');
      }

      setMessage({ type: 'success', text: data.validation.message });
      setAttendance(data.attendance);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async () => {
    setActionLoading(true);
    setMessage({ type: 'success', text: '📍 Mencari sinyal GPS terbaik... Mohon tunggu 10-30 detik untuk akurasi optimal.' });

    try {
      const location = await getLocation();
      
      // Show accuracy in message
      const accuracyText = location.accuracy < 50 
        ? '✓ Akurasi sangat baik' 
        : location.accuracy < 100 
        ? '✓ Akurasi baik'
        : location.accuracy < 500
        ? '⚠️ Akurasi cukup'
        : '⚠️ Akurasi rendah';
      
      setMessage({ 
        type: 'success', 
        text: `${accuracyText} (${Math.round(location.accuracy)}m). Memproses check-out...` 
      });
      
      const token = localStorage.getItem('token');

      const response = await fetch('/api/student/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(location),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-out gagal');
      }

      setMessage({ type: 'success', text: data.validation.message });
      setAttendance(data.attendance);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show class selection if user doesn't have a class
  if (showClassList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Pilih Kelas Anda</h1>
                <p className="text-gray-600">{user?.name}</p>
                <p className="text-sm text-yellow-600 mt-2">⚠️ Anda belum terdaftar di kelas manapun. Silakan pilih kelas untuk bergabung.</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg p-4 mb-6 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Available Classes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Daftar Kelas Tersedia</h2>
            
            {availableClasses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Tidak ada kelas yang tersedia saat ini.</p>
            ) : (
              <div className="space-y-4">
                {availableClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{classItem.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Tingkat:</span> Kelas {classItem.grade_level}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Wali Kelas:</span> {classItem.teacher_names}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          👥 {classItem.student_count} siswa terdaftar
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinClass(classItem.id, classItem.name)}
                        disabled={joiningClass}
                        className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {joiningClass ? 'Bergabung...' : 'Gabung Kelas'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Catatan:</strong> Anda hanya dapat bergabung dengan satu kelas. Pilih dengan hati-hati sesuai dengan kelas Anda yang sebenarnya.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HADIR_PENUH':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">🟢 Hadir Penuh</span>;
      case 'HADIR_PARSIAL':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">🟡 Hadir Parsial</span>;
      case 'PERLU_VERIFIKASI':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">🔴 Perlu Verifikasi</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Siswa</h1>
              <p className="text-gray-600">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.class?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`rounded-lg p-4 mb-6 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status Kehadiran Hari Ini</h2>
          
          {attendance ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                {getStatusBadge(attendance.final_status)}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">
                    {attendance.check_in_time
                      ? new Date(attendance.check_in_time).toLocaleTimeString('id-ID')
                      : 'Belum check-in'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">
                    {attendance.check_out_time
                      ? new Date(attendance.check_out_time).toLocaleTimeString('id-ID')
                      : 'Belum check-out'}
                  </span>
                </div>
              </div>

              {attendance.teacher_validated && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                  <p className="text-sm text-blue-800">
                    ✓ Sudah divalidasi oleh guru
                  </p>
                  {attendance.teacher_note && (
                    <p className="text-sm text-gray-600 mt-1">
                      Catatan: {attendance.teacher_note}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Belum ada data kehadiran hari ini</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCheckin}
            disabled={actionLoading || attendance?.check_in_time}
            className="bg-green-600 text-white py-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {attendance?.check_in_time ? '✓ Sudah Check-in' : '📍 Check-in Kehadiran'}
          </button>

          <button
            onClick={handleCheckout}
            disabled={actionLoading || !attendance?.check_in_time || attendance?.check_out_time}
            className="bg-blue-600 text-white py-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {attendance?.check_out_time ? '✓ Sudah Check-out' : '📍 Check-out Kehadiran'}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">🔒 Privasi Anda Terlindungi</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Lokasi hanya diambil saat Anda menekan tombol check-in/check-out</li>
            <li>• Tidak ada pelacakan berkelanjutan</li>
            <li>• Koordinat GPS tidak disimpan, hanya status validasi</li>
            <li>• Guru dapat memvalidasi kehadiran secara manual</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
