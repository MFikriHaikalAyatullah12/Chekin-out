# Chekin-out - Student Attendance System

Privacy-first, geolocation-based student attendance system yang etis dan sesuai dengan hukum perlindungan data.

## 🔒 Privacy First Principles

**SISTEM INI TIDAK:**
- ❌ Melakukan tracking berkelanjutan
- ❌ Menyimpan koordinat GPS mentah
- ❌ Memantau lokasi siswa secara real-time
- ❌ Menggunakan background location tracking
- ❌ Memberi vonis otomatis "bolos"

**SISTEM INI HANYA:**
- ✅ Mengambil lokasi saat user menekan tombol (user-initiated)
- ✅ Menyimpan status validasi saja, bukan koordinat GPS
- ✅ Memberi guru otoritas final untuk validasi
- ✅ Transparan tentang penggunaan data lokasi

## 🎯 Features

### Admin
- Kelola data kelas
- Atur wali kelas untuk setiap kelas
- Konfigurasi koordinat sekolah (latitude & longitude)
- Atur radius valid kehadiran (default 100m)
- Atur jam check-in dan check-out

### Guru/Wali Kelas
- Lihat daftar kehadiran siswa per hari
- Status kehadiran dengan indikator warna
- Validasi manual kehadiran siswa
- Tambahkan catatan untuk setiap siswa

### Siswa
- Check-in saat datang ke sekolah
- Check-out saat pulang
- Lihat status kehadiran real-time
- Privacy notice yang jelas

## 🔐 Status Validasi Lokasi

| Status | Kondisi |
|--------|---------|
| **VALID** | Jarak ≤ radius sekolah DAN akurasi ≤ 100m |
| **KURANG_AKURAT** | Akurasi buruk atau sedikit di luar radius |
| **TIDAK_VALID** | Terlalu jauh atau izin lokasi ditolak |

## 📊 Status Kehadiran

| Status | Kondisi |
|--------|---------|
| 🟢 **HADIR_PENUH** | Check-in VALID + Check-out VALID |
| 🟡 **HADIR_PARSIAL** | Check-in VALID + belum/tidak check-out |
| 🔴 **PERLU_VERIFIKASI** | Tidak check-in atau status tidak valid |

**⚠️ PENTING:** Semua status dapat dikonfirmasi atau diperbaiki oleh guru. Guru adalah otoritas akhir, bukan sistem otomatis.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes (REST API)
- **Database:** PostgreSQL (Neon)
- **Authentication:** JWT with jose
- **Location:** HTML5 Geolocation API (browser-based)

## 📦 Installation

1. Clone repository
```bash
git clone <repository-url>
cd chekin-out
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
Create `.env.local` file:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run database migration
```bash
npm run db:migrate
```

5. Start development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 👥 Demo Accounts

**Admin:**
- Email: `admin@school.com`
- Password: `password123`

**Guru:**
- Email: `guru1@school.com`
- Password: `password123`

**Siswa:**
- Email: `andi@school.com`
- Password: `password123`

## 🗂️ Project Structure

```
chekin-out/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── admin/         # Admin endpoints
│   │   ├── student/       # Student endpoints
│   │   └── teacher/       # Teacher endpoints
│   ├── admin/             # Admin dashboard
│   ├── teacher/           # Teacher dashboard
│   ├── student/           # Student dashboard
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/
│   ├── db.ts              # Database connection
│   ├── types.ts           # TypeScript types
│   ├── auth.ts            # Authentication utilities
│   └── location.ts        # Location validation logic
├── database/
│   ├── schema.sql         # Database schema
│   └── seed.sql           # Sample data
├── scripts/
│   └── migrate.js         # Migration script
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 📋 Database Schema

### Tables
- **users** - User accounts (admin, teacher, student)
- **classes** - Class information
- **school_settings** - School configuration
- **attendance** - Attendance records (NO GPS COORDINATES!)

### Key Privacy Feature
```sql
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    
    -- Only timestamps and validation status stored
    -- NO GPS coordinates!
    check_in_time TIMESTAMP,
    check_in_status validation_status,
    
    check_out_time TIMESTAMP,
    check_out_status validation_status,
    
    final_status attendance_status,
    
    -- Teacher validation
    teacher_validated BOOLEAN,
    teacher_note TEXT,
    ...
);
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/admin/classes` - Get all classes
- `POST /api/admin/classes` - Create class
- `PUT /api/admin/classes/[id]` - Update class
- `DELETE /api/admin/classes/[id]` - Delete class
- `GET /api/admin/settings` - Get school settings
- `PUT /api/admin/settings` - Update school settings

### Student
- `POST /api/student/checkin` - Check-in attendance
- `POST /api/student/checkout` - Check-out attendance
- `GET /api/student/status` - Get today's status

### Teacher
- `GET /api/teacher/attendance` - Get class attendance
- `POST /api/teacher/validate` - Validate student attendance

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
```env
DATABASE_URL=your_production_postgresql_url
JWT_SECRET=strong-random-secret-key
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔐 Security Considerations

1. **JWT Secret:** Generate strong random secret for production
2. **Database:** Use SSL connection (already configured for Neon)
3. **HTTPS:** Always use HTTPS in production
4. **Password Hashing:** Using bcrypt with 10 rounds
5. **Input Validation:** Validate all user inputs on server side

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Privacy principles are maintained
- No GPS coordinate storage
- User-initiated location checks only
- Teacher validation remains possible

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for ethical student attendance tracking**
