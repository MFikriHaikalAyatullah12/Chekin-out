'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'classes' | 'settings'>('classes');
  const [classes, setClasses] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    setUser(userData);
    fetchClasses();
    fetchSettings();
  }, [router]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Update gagal');
      }

      alert('Pengaturan berhasil diupdate!');
    } catch (error: any) {
      alert(error.message);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
              <p className="text-gray-600">{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b">
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'classes'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Kelola Kelas
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pengaturan Sekolah
            </button>
          </div>
        </div>

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Daftar Kelas</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wali Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Siswa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cls.wali_kelas_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cls.student_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Pengaturan Sekolah</h2>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude Sekolah
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settings.school_latitude}
                    onChange={(e) =>
                      setSettings({ ...settings, school_latitude: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude Sekolah
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settings.school_longitude}
                    onChange={(e) =>
                      setSettings({ ...settings, school_longitude: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radius Valid (meter)
                  </label>
                  <input
                    type="number"
                    value={settings.valid_radius}
                    onChange={(e) =>
                      setSettings({ ...settings, valid_radius: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Jam Check-in</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Mulai
                    </label>
                    <input
                      type="time"
                      value={settings.checkin_start_time}
                      onChange={(e) =>
                        setSettings({ ...settings, checkin_start_time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      value={settings.checkin_end_time}
                      onChange={(e) =>
                        setSettings({ ...settings, checkin_end_time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Jam Check-out</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Mulai
                    </label>
                    <input
                      type="time"
                      value={settings.checkout_start_time}
                      onChange={(e) =>
                        setSettings({ ...settings, checkout_start_time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      value={settings.checkout_end_time}
                      onChange={(e) =>
                        setSettings({ ...settings, checkout_end_time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Simpan Pengaturan
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
