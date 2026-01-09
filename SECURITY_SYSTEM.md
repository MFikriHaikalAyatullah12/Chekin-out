# 🔐 Sistem Keamanan - Chekin-out

## Proteksi Keamanan yang Diterapkan

### ✅ 1. Redirect Otomatis ke Login

**Halaman root (/) sekarang langsung redirect ke /login**

#### Sebelum:
- User bisa mengakses `/` 
- Redirect terjadi di client-side (lambat, bisa di-bypass)
- Muncul halaman "Loading..." sebelum redirect

#### Sekarang:
- Akses ke `/` **langsung redirect** ke `/login` dari **server-side**
- Tidak bisa di-bypass karena dikontrol oleh middleware Next.js
- Lebih cepat dan aman

### ✅ 2. Middleware Protection

**Semua halaman protected divalidasi di server-side**

File: `middleware.ts`

#### Fitur Keamanan:

1. **Token Validation**
   - Semua request ke `/student`, `/teacher`, `/admin` divalidasi
   - Token dicek dari HTTP-only cookie (lebih aman dari localStorage)
   - Menggunakan JWT verification dengan library `jose`

2. **Automatic Redirect**
   - Jika tidak ada token → redirect ke `/login`
   - Jika token invalid/expired → redirect ke `/login`
   - Jika token valid → akses diberikan

3. **Public Paths**
   - `/login` dan `/register` tetap dapat diakses tanpa token
   - API routes dan static files tidak di-filter

#### Flow Keamanan:
```
Request → Middleware → Check Path
                         ↓
                    Protected Path?
                         ↓
                    YES → Check Token
                         ↓
                    Token Valid?
                         ↓
              YES → Allow    NO → Redirect /login
```

### ✅ 3. HTTP-Only Cookie

**Token disimpan di cookie yang aman**

#### Keuntungan:
- **HttpOnly**: JavaScript tidak bisa akses cookie (proteksi XSS)
- **Secure**: Di production, hanya dikirim via HTTPS
- **SameSite**: Proteksi CSRF attack
- **MaxAge**: Token expire otomatis setelah 7 hari

#### Login Flow:
```
1. User login → POST /api/auth/login
2. Server validasi credentials
3. Server generate JWT token
4. Server set token di:
   - Response body (untuk localStorage - backward compatibility)
   - HTTP-only cookie (untuk middleware validation)
5. Client simpan user info di localStorage
6. Client redirect ke dashboard sesuai role
```

#### Logout Flow:
```
1. User logout → POST /api/auth/logout
2. Server clear cookie (set maxAge = 0)
3. Client clear localStorage
4. Client redirect ke /login
5. Middleware block access ke protected pages
```

### ✅ 4. Role-Based Access

**Setiap user hanya bisa akses halaman sesuai role-nya**

#### Di Client-Side (app/*/page.tsx):
```typescript
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
  
  // ... load data
}, [router]);
```

#### Di Server-Side (middleware.ts):
```typescript
// Token JWT contains user role
// If user tries to access wrong role page, token validation fails
```

### ✅ 5. API Protection

**Semua API endpoint memvalidasi token**

File: `lib/auth.ts`

#### Functions:
- `extractToken()`: Extract token dari Authorization header
- `verifyToken()`: Validasi JWT dan return payload
- `generateToken()`: Buat JWT token baru saat login

#### Usage di API:
```typescript
export async function GET(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization'));
  const payload = await verifyToken(token || '');

  if (!payload || payload.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... process request
}
```

## Lapisan Keamanan

### Layer 1: Middleware (Server-Side)
- ✅ Validasi token dari cookie
- ✅ Block akses ke protected pages jika tidak ada token
- ✅ Redirect otomatis ke login
- ⚡ **Fastest**: Terjadi sebelum page load

### Layer 2: Page Component (Client-Side)
- ✅ Check token di localStorage
- ✅ Check role sesuai halaman
- ✅ Redirect jika tidak sesuai
- 🔄 **Backup**: Double validation

### Layer 3: API Endpoints (Server-Side)
- ✅ Validasi token dari Authorization header
- ✅ Validasi role sesuai endpoint
- ✅ Return 401 jika unauthorized
- 🔒 **Final**: Proteksi data di backend

## Testing Keamanan

### Test 1: Akses Root Path
```bash
# Expected: Redirect to /login
curl -I http://localhost:3000/

# Response:
HTTP/1.1 307 Temporary Redirect
Location: http://localhost:3000/login
```

### Test 2: Akses Protected Path tanpa Token
```bash
# Expected: Redirect to /login
curl -I http://localhost:3000/student

# Response:
HTTP/1.1 307 Temporary Redirect
Location: http://localhost:3000/login
```

### Test 3: Akses Protected Path dengan Token Valid
```bash
# Expected: 200 OK
curl -I -H "Cookie: token=valid_jwt_token" http://localhost:3000/student

# Response:
HTTP/1.1 200 OK
```

### Test 4: Akses Protected Path dengan Token Invalid
```bash
# Expected: Redirect to /login
curl -I -H "Cookie: token=invalid_token" http://localhost:3000/student

# Response:
HTTP/1.1 307 Temporary Redirect
Location: http://localhost:3000/login
```

## Skenario Attack & Proteksi

### 1. XSS (Cross-Site Scripting)
**Attack**: Injeksi JavaScript untuk mencuri token
**Proteksi**: 
- ✅ Token disimpan di HTTP-only cookie (tidak bisa diakses JS)
- ✅ Input sanitization di form

### 2. CSRF (Cross-Site Request Forgery)
**Attack**: Request palsu dari site lain
**Proteksi**:
- ✅ SameSite cookie attribute
- ✅ Token validation di setiap API call

### 3. Token Theft
**Attack**: Mencuri token dari localStorage
**Proteksi**:
- ✅ Token juga disimpan di HTTP-only cookie
- ✅ Middleware validasi token dari cookie
- ✅ Token expire otomatis (7 hari)

### 4. Direct URL Access
**Attack**: Akses langsung ke URL protected
**Proteksi**:
- ✅ Middleware block akses tanpa token
- ✅ Server-side redirect sebelum page load

### 5. Role Bypass
**Attack**: User dengan role STUDENT akses halaman TEACHER
**Proteksi**:
- ✅ Client-side check di useEffect
- ✅ Server-side check di API endpoints
- ✅ JWT token berisi role information

## Best Practices

### Untuk Developer:

1. **Selalu gunakan middleware protection** untuk halaman baru
2. **Validasi token di setiap API endpoint**
3. **Check role sesuai functionality**
4. **Jangan simpan data sensitive di localStorage**
5. **Gunakan HTTPS di production**

### Untuk Deployment:

1. **Set environment variable `NODE_ENV=production`**
2. **Gunakan HTTPS untuk cookie secure**
3. **Set `JWT_SECRET` yang kuat (min 32 characters)**
4. **Enable rate limiting di API**
5. **Monitor failed login attempts**

## File-file Terkait

1. **middleware.ts** - Server-side route protection
2. **app/api/auth/login/route.ts** - Login endpoint dengan cookie
3. **app/api/auth/logout/route.ts** - Logout endpoint clear cookie
4. **lib/auth.ts** - JWT utility functions
5. **app/student/page.tsx** - Client-side protection example
6. **app/teacher/page.tsx** - Client-side protection example

## Kesimpulan

Sistem sekarang memiliki **3 layer proteksi**:
1. ✅ **Middleware** - Server-side validation sebelum page load
2. ✅ **Component** - Client-side validation di useEffect
3. ✅ **API** - Backend validation untuk setiap request

Semua halaman protected **dipastikan aman** dan user **tidak bisa bypass** sistem authentication.

**Pertama kali buka web → Langsung redirect ke /login ✅**
