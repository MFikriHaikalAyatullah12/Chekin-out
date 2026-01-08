# Chekin-out API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/login
Login user and get JWT token

**Request:**
```json
{
  "email": "user@school.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@school.com",
    "role": "STUDENT",
    "class_id": 1,
    "class": {
      "id": 1,
      "name": "Kelas 10A"
    }
  }
}
```

### GET /auth/me
Get current user info (requires authentication)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@school.com",
    "role": "STUDENT",
    "class_id": 1,
    "class": {
      "id": 1,
      "name": "Kelas 10A"
    }
  }
}
```

---

## Admin Endpoints

### GET /admin/classes
Get all classes (Admin only)

**Response:**
```json
{
  "success": true,
  "classes": [
    {
      "id": 1,
      "name": "Kelas 10A",
      "wali_kelas_id": 2,
      "wali_kelas_name": "Bapak Guru A",
      "student_count": 25
    }
  ]
}
```

### POST /admin/classes
Create new class (Admin only)

**Request:**
```json
{
  "name": "Kelas 10C",
  "wali_kelas_id": 3
}
```

**Response:**
```json
{
  "success": true,
  "class": {
    "id": 4,
    "name": "Kelas 10C",
    "wali_kelas_id": 3
  }
}
```

### PUT /admin/classes/:id
Update class (Admin only)

**Request:**
```json
{
  "name": "Kelas 10A Updated",
  "wali_kelas_id": 2
}
```

### DELETE /admin/classes/:id
Delete class (Admin only)

### GET /admin/settings
Get school settings (Admin only)

**Response:**
```json
{
  "success": true,
  "settings": {
    "id": 1,
    "school_latitude": -6.2088,
    "school_longitude": 106.8456,
    "valid_radius": 100,
    "checkin_start_time": "07:00:00",
    "checkin_end_time": "08:00:00",
    "checkout_start_time": "14:00:00",
    "checkout_end_time": "15:00:00"
  }
}
```

### PUT /admin/settings
Update school settings (Admin only)

**Request:**
```json
{
  "school_latitude": -6.2088,
  "school_longitude": 106.8456,
  "valid_radius": 150,
  "checkin_start_time": "07:00:00",
  "checkin_end_time": "08:00:00",
  "checkout_start_time": "14:00:00",
  "checkout_end_time": "15:00:00"
}
```

---

## Student Endpoints

### POST /student/checkin
Check-in attendance (Student only)

**Privacy Note:** GPS coordinates sent but NOT stored in database!

**Request:**
```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "accuracy": 20
}
```

**Response:**
```json
{
  "success": true,
  "attendance": {
    "id": 1,
    "user_id": 5,
    "date": "2024-01-15",
    "check_in_time": "2024-01-15T07:30:00Z",
    "check_in_status": "VALID",
    "final_status": "HADIR_PARSIAL"
  },
  "validation": {
    "status": "VALID",
    "message": "Lokasi terverifikasi. Jarak dari sekolah: 45m",
    "distance": 45
  }
}
```

### POST /student/checkout
Check-out attendance (Student only)

**Request:**
```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "accuracy": 25
}
```

**Response:**
```json
{
  "success": true,
  "attendance": {
    "id": 1,
    "check_out_time": "2024-01-15T14:30:00Z",
    "check_out_status": "VALID",
    "final_status": "HADIR_PENUH"
  },
  "validation": {
    "status": "VALID",
    "message": "Lokasi terverifikasi. Jarak dari sekolah: 52m",
    "distance": 52
  }
}
```

### GET /student/status
Get today's attendance status (Student only)

**Response:**
```json
{
  "success": true,
  "attendance": {
    "id": 1,
    "user_id": 5,
    "date": "2024-01-15",
    "check_in_time": "2024-01-15T07:30:00Z",
    "check_in_status": "VALID",
    "check_out_time": "2024-01-15T14:30:00Z",
    "check_out_status": "VALID",
    "final_status": "HADIR_PENUH",
    "teacher_validated": true,
    "teacher_note": "Good attendance"
  }
}
```

---

## Teacher Endpoints

### GET /teacher/attendance
Get class attendance (Teacher only)

**Query Parameters:**
- `date` (optional): Date in format YYYY-MM-DD. Default: today

**Example:** `/teacher/attendance?date=2024-01-15`

**Response:**
```json
{
  "success": true,
  "date": "2024-01-15",
  "students": [
    {
      "id": 5,
      "name": "Andi Pratama",
      "email": "andi@school.com",
      "attendance_id": 1,
      "date": "2024-01-15",
      "check_in_time": "2024-01-15T07:30:00Z",
      "check_in_status": "VALID",
      "check_out_time": "2024-01-15T14:30:00Z",
      "check_out_status": "VALID",
      "final_status": "HADIR_PENUH",
      "teacher_validated": false,
      "teacher_note": null
    },
    {
      "id": 6,
      "name": "Budi Santoso",
      "email": "budi@school.com",
      "attendance_id": null,
      "check_in_time": null,
      "check_in_status": null,
      "check_out_time": null,
      "check_out_status": null,
      "final_status": null,
      "teacher_validated": false,
      "teacher_note": null
    }
  ]
}
```

### POST /teacher/validate
Validate student attendance (Teacher only)

**Request:**
```json
{
  "attendance_id": 1,
  "final_status": "HADIR_PENUH",
  "teacher_note": "Confirmed present"
}
```

**Response:**
```json
{
  "success": true,
  "attendance": {
    "id": 1,
    "final_status": "HADIR_PENUH",
    "teacher_validated": true,
    "teacher_note": "Confirmed present",
    "validated_by": 2,
    "validated_at": "2024-01-15T15:00:00Z"
  }
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Validation Status Enum

```typescript
type ValidationStatus = 'VALID' | 'KURANG_AKURAT' | 'TIDAK_VALID';
```

## Attendance Status Enum

```typescript
type AttendanceStatus = 'HADIR_PENUH' | 'HADIR_PARSIAL' | 'PERLU_VERIFIKASI';
```

## User Role Enum

```typescript
type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';
```
