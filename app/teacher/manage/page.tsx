'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherManagePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [newClass, setNewClass] = useState({ name: '', grade_level: '10' });

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
    fetchClasses();
  }, [router]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teacher/join-class', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAvailableClasses(data.available_classes);
      }
    } catch (error) {
      console.error('Error fetching available classes:', error);
    }
  };

  const handleJoinClass = async (classId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teacher/join-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ class_id: classId }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setShowJoinClass(false);
        fetchClasses();
      } else {
        alert(data.error || 'Gagal bergabung dengan kelas');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClass),
      });
      const data = await response.json();
      if (data.success) {
        alert('Kelas berhasil ditambahkan!');
        setShowAddClass(false);
        setNewClass({ name: '', grade_level: '10' });
        fetchClasses();
      } else {
        alert(data.error || 'Gagal menambahkan kelas');
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-900">Loading...</p>
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
              <h1 className="text-2xl font-bold text-gray-800">Kelola Kelas & Siswa</h1>
              <p className="text-gray-600">{user?.name}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/teacher"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Kembali
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Classes Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Kelas Saya</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    fetchAvailableClasses();
                    setShowJoinClass(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  Gabung Kelas
                </button>
                <button
                  onClick={() => setShowAddClass(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  + Buat Kelas
                </button>
              </div>
            </div>

            {classes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada kelas. Tambahkan kelas baru.</p>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => router.push(`/teacher/manage/${cls.id}`)}
                    className="p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400 hover:shadow-lg border-gray-300 hover:bg-blue-25"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{cls.name}</h3>
                        <p className="text-sm text-gray-500">Tingkat: Kelas {cls.grade_level}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-blue-600">{cls.student_count}</p>
                        <p className="text-xs text-gray-500">siswa</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        👆 Klik untuk mengelola kelas ini →
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Class Modal */}
        {showAddClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Buat Kelas Baru</h3>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kelas</label>
                  <input
                    type="text"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="Contoh: Kelas 10A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kelas</label>
                  <select
                    value={newClass.grade_level}
                    onChange={(e) => setNewClass({ ...newClass, grade_level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    required
                  >
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddClass(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Buat
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Class Modal */}
        {showJoinClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Gabung Kelas Yang Ada</h3>
              {availableClasses.length === 0 ? (
                <p className="text-gray-600 text-center py-4">Tidak ada kelas yang tersedia untuk digabung.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableClasses.map((cls) => (
                    <div key={cls.id} className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800">{cls.name}</h4>
                          <p className="text-sm text-gray-500">
                            Tingkat: Kelas {cls.grade_level} • {cls.student_count} siswa
                          </p>
                        </div>
                        <button
                          onClick={() => handleJoinClass(cls.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          Gabung
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinClass(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
