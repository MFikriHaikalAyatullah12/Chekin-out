'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function StudentValidationPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  const studentId = params.studentId as string;

  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'TEACHER') {
      router.push('/login');
      return;
    }

    setUser(userData);
    fetchStudentData();
    fetchAttendanceRecords();
  }, [router, studentId, selectedDate]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher/students?class_id=${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const studentData = data.students.find((s: any) => s.id.toString() === studentId);
        setStudent(studentData);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher/attendance?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        // Filter for this specific student
        const studentRecords = data.students.filter((s: any) => s.user_id.toString() === studentId);
        setAttendanceRecords(studentRecords);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleValidate = async (attendanceId: number, status: string, note: string = '') => {
    if (!confirm(`Validasi kehadiran sebagai "${status}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teacher/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attendance_id: attendanceId,
          final_status: status,
          teacher_note: note || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Validasi berhasil! Kembali ke halaman kelas...');
        // Redirect back to class page after validation
        router.push(`/teacher/manage/${classId}`);
      } else {
        alert(data.error || 'Gagal melakukan validasi');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-900 text-lg">Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-900 text-lg mb-4">Siswa tidak ditemukan</p>
          <Link
            href={`/teacher/manage/${classId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const todayRecord = attendanceRecords.find((r) => r.date === selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <Link
              href={`/teacher/manage/${classId}`}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              ← Kembali ke Kelas
            </Link>
            <div className="flex gap-2">
              <Link
                href="/teacher"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Student Info - Compact Style */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{student.name}</h2>
              <p className="text-sm text-gray-600">{student.email}</p>
              <p className="text-sm text-blue-600 font-medium">Kelas: {student.class_name}</p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Tanggal
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>

        {/* Attendance Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Status Kehadiran</h2>
          
          {!todayRecord ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Tidak ada data kehadiran untuk tanggal ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="text-lg font-bold text-gray-800">
                    {todayRecord.check_in_time 
                      ? new Date(todayRecord.check_in_time).toLocaleTimeString('id-ID')
                      : 'Belum check-in'}
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="text-lg font-bold text-gray-800">
                    {todayRecord.check_out_time 
                      ? new Date(todayRecord.check_out_time).toLocaleTimeString('id-ID')
                      : 'Belum check-out'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Status Saat Ini</p>
                <div className="flex items-center gap-2">
                  {todayRecord.final_status === 'HADIR_PENUH' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      🟢 Hadir Penuh
                    </span>
                  )}
                  {todayRecord.final_status === 'HADIR_PARSIAL' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      🟡 Hadir Parsial
                    </span>
                  )}
                  {todayRecord.final_status === 'PERLU_VERIFIKASI' && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      🔴 Perlu Verifikasi
                    </span>
                  )}
                  {todayRecord.teacher_validated && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      ✓ Sudah Divalidasi
                    </span>
                  )}
                </div>
                {todayRecord.teacher_note && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Catatan Guru:</strong> {todayRecord.teacher_note}
                  </p>
                )}
              </div>

              {/* Validation Actions */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Validasi Manual</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleValidate(todayRecord.id, 'HADIR_PENUH', 'Divalidasi guru sebagai hadir penuh')}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    ✓ Validasi Hadir Penuh
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Catatan (opsional):');
                      if (note !== null) {
                        handleValidate(todayRecord.id, 'HADIR_PARSIAL', note || 'Divalidasi guru sebagai hadir parsial');
                      }
                    }}
                    className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
                  >
                    ~ Validasi Hadir Parsial
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Alasan perlu verifikasi:');
                      if (note) {
                        handleValidate(todayRecord.id, 'PERLU_VERIFIKASI', note);
                      }
                    }}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    ✗ Perlu Verifikasi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Informasi:</strong> Validasi manual akan mengganti status kehadiran otomatis. 
            Gunakan ini jika ada ketidaksesuaian GPS atau situasi khusus.
          </p>
        </div>
      </div>
    </div>
  );
}
