'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [validatingId, setValidatingId] = useState<number | null>(null);

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
    fetchAttendance(date);
  }, [router, date]);

  const fetchAttendance = async (selectedDate: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher/attendance?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (attendanceId: number, finalStatus: string, note: string = '') => {
    setValidatingId(attendanceId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teacher/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attendance_id: attendanceId, final_status: finalStatus, teacher_note: note }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Validasi gagal');
      }

      // Refresh data
      fetchAttendance(date);
      alert('Validasi berhasil!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setValidatingId(null);
    }
  };

  const handleQuickValidate = (student: any, status: string) => {
    if (!student.attendance_id) {
      alert('Siswa belum melakukan check-in');
      return;
    }

    const note = prompt(`Masukkan catatan untuk ${student.name} (opsional):`);
    handleValidate(student.attendance_id, status, note || '');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HADIR_PENUH':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">🟢 Hadir Penuh</span>;
      case 'HADIR_PARSIAL':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">🟡 Hadir Parsial</span>;
      case 'PERLU_VERIFIKASI':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">🔴 Perlu Verifikasi</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">- Belum Absen</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Guru</h1>
              <p className="text-gray-600">{user?.name}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/teacher/manage"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Kelola Kelas & Siswa
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Tanggal:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {student.check_in_time ? (
                        <div>
                          <div>{new Date(student.check_in_time).toLocaleTimeString('id-ID')}</div>
                          <div className="text-xs text-gray-500">{student.check_in_status}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {student.check_out_time ? (
                        <div>
                          <div>{new Date(student.check_out_time).toLocaleTimeString('id-ID')}</div>
                          <div className="text-xs text-gray-500">{student.check_out_status}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(student.final_status)}</td>
                    <td className="px-6 py-4">
                      {student.teacher_validated ? (
                        <span className="text-xs text-green-600">✓ Sudah</span>
                      ) : (
                        <span className="text-xs text-gray-400">Belum</span>
                      )}
                      {student.teacher_note && (
                        <div className="text-xs text-gray-500 mt-1">
                          {student.teacher_note}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.attendance_id && !student.teacher_validated && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleQuickValidate(student, 'HADIR_PENUH')}
                            disabled={validatingId === student.attendance_id}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleQuickValidate(student, 'HADIR_PARSIAL')}
                            disabled={validatingId === student.attendance_id}
                            className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 disabled:opacity-50"
                          >
                            ~
                          </button>
                          <button
                            onClick={() => handleQuickValidate(student, 'PERLU_VERIFIKASI')}
                            disabled={validatingId === student.attendance_id}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data siswa
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-800 mb-3">Keterangan Aksi Validasi:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-600 text-white rounded">✓</span>
              <span>Validasi Hadir Penuh</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-600 text-white rounded">~</span>
              <span>Validasi Hadir Parsial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-600 text-white rounded">✗</span>
              <span>Tandai Perlu Verifikasi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
