# Technical Architecture Documentation

## System Overview

Chekin-out is a full-stack web application built with Next.js that provides student attendance tracking using geolocation validation. The system is designed with privacy-first principles.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │  Admin     │  │  Teacher   │  │  Student Dashboard     │ │
│  │  Dashboard │  │  Dashboard │  │  (with Geolocation)    │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      Next.js API Layer                       │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Auth API    │  │ Admin    │  │ Student/Teacher API    │ │
│  │ /api/auth/* │  │ API      │  │ /api/student/*         │ │
│  │             │  │          │  │ /api/teacher/*         │ │
│  └─────────────┘  └──────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Auth Logic   │  │ Location     │  │ Attendance       │  │
│  │ (JWT)        │  │ Validation   │  │ Calculation      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│                    PostgreSQL (Neon)                         │
│  ┌─────┐  ┌─────────┐  ┌──────────┐  ┌────────────────┐   │
│  │Users│  │ Classes │  │ Settings │  │ Attendance     │   │
│  └─────┘  └─────────┘  └──────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React hooks (useState, useEffect)
- **Location API:** HTML5 Geolocation API

### Backend
- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Authentication:** JWT (jose library)
- **Password Hashing:** bcryptjs

### Database
- **DBMS:** PostgreSQL
- **Provider:** Neon (serverless PostgreSQL)
- **ORM:** None (raw SQL queries via pg)

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│   Users     │
├─────────────┤
│ id (PK)     │◄─────────┐
│ name        │          │
│ email       │          │
│ password    │          │
│ role        │          │
│ class_id(FK)│──┐       │
└─────────────┘  │       │
                 │       │
       ┌─────────┼───────┼─────────┐
       │         │       │         │
       ▼         │       │         │
┌─────────────┐  │       │  ┌─────────────┐
│   Classes   │  │       │  │ Attendance  │
├─────────────┤  │       │  ├─────────────┤
│ id (PK)     │◄─┘       │  │ id (PK)     │
│ name        │          │  │ user_id(FK) │
│ wali_kelas  │──────────┘  │ date        │
│ _id (FK)    │             │ check_in    │
└─────────────┘             │ check_out   │
                            │ status      │
       ┌────────────────────┤ validated_  │
       │                    │ by (FK)     │
       │                    └─────────────┘
       │                           │
       └───────────────────────────┘

┌─────────────────┐
│ School Settings │
├─────────────────┤
│ id (PK)         │
│ school_lat      │
│ school_lng      │
│ radius          │
│ time_windows    │
└─────────────────┘
```

### Key Tables

**users**
- Primary key: `id`
- Foreign key: `class_id` → `classes.id`
- Enum: `role` (ADMIN, TEACHER, STUDENT)

**classes**
- Primary key: `id`
- Foreign key: `wali_kelas_id` → `users.id`

**attendance**
- Primary key: `id`
- Foreign keys: `user_id` → `users.id`, `validated_by` → `users.id`
- Unique constraint: `(user_id, date)`
- **Privacy:** NO GPS coordinates stored!

**school_settings**
- Singleton table (only 1 row)
- Stores school location (not student locations)

## API Design

### Authentication Flow

```
1. User submits credentials
   ↓
2. Server validates against database
   ↓
3. Generate JWT token (valid 7 days)
   ↓
4. Return token + user info
   ↓
5. Client stores token in localStorage
   ↓
6. Subsequent requests include token in header
   ↓
7. Server validates token for protected routes
```

### Location Validation Flow

```
1. Student clicks check-in/check-out button
   ↓
2. Browser requests location permission
   ↓
3. Get current position (ONE TIME)
   ↓
4. Send {lat, lng, accuracy} to server
   ↓
5. Server calculates distance using Haversine
   ↓
6. Determine validation status
   ↓
7. Store ONLY status (discard coordinates)
   ↓
8. Return result to client
```

## Security Implementation

### Authentication
- **Method:** JWT with HS256 algorithm
- **Token Storage:** Client-side localStorage
- **Token Lifetime:** 7 days (configurable)
- **Password Hashing:** bcrypt with 10 rounds

### Authorization
- Role-based access control (RBAC)
- API route protection:
  ```typescript
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  ```

### Data Protection
- **In Transit:** HTTPS/TLS encryption
- **At Rest:** PostgreSQL with SSL
- **Passwords:** Never stored in plain text
- **Location Data:** Never persisted

### Privacy Safeguards

1. **Minimal Data Collection**
   - Only essential attendance data
   - No location history
   - No tracking data

2. **User Control**
   - Explicit permission required
   - Can revoke location access anytime
   - Transparent data usage

3. **Human Oversight**
   - Teacher validation required
   - Manual corrections possible
   - Notes for context

## Geolocation Logic

### Haversine Formula Implementation

```typescript
function calculateDistance(lat1, lon1, lat2, lon2): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
}
```

### Validation Rules

```typescript
if (accuracy > 100) {
  status = 'KURANG_AKURAT'; // Poor GPS signal
} else if (distance <= radius) {
  status = 'VALID'; // Within school bounds
} else if (distance <= radius + 50 && accuracy <= 50) {
  status = 'KURANG_AKURAT'; // Close but needs verification
} else {
  status = 'TIDAK_VALID'; // Too far from school
}
```

### Status Calculation

```typescript
function calculateFinalStatus(checkIn, checkOut) {
  if (checkIn === 'VALID' && checkOut === 'VALID') {
    return 'HADIR_PENUH';
  } else if (checkIn === 'VALID') {
    return 'HADIR_PARSIAL';
  } else {
    return 'PERLU_VERIFIKASI';
  }
}
```

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Connection pooling with pg
- Prepared statements for security

### Frontend Optimization
- Server-side rendering for initial load
- Client-side navigation with Next.js
- Lazy loading of components
- Optimized images with Next.js Image

### Caching Strategy
- JWT tokens cached in localStorage
- User info cached locally
- School settings cached (rarely change)

## Scalability

### Current Limitations
- Single database instance
- No Redis caching
- No CDN for static assets

### Future Improvements
- Database read replicas
- Redis for session management
- Edge caching with Vercel
- Background job processing

## Monitoring & Logging

### Recommended Tools
- **Application:** Vercel Analytics
- **Database:** Neon Dashboard
- **Errors:** Sentry
- **Logs:** Vercel Logs

### Key Metrics to Monitor
- API response times
- Database query performance
- Authentication failure rate
- Location validation success rate
- User engagement metrics

## Deployment Architecture

```
┌────────────────────────────────────────┐
│         Vercel Edge Network            │
│  (CDN, DDoS Protection, SSL/TLS)       │
└────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────┐
│         Next.js Application            │
│  (Serverless Functions on AWS Lambda)  │
└────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────┐
│      Neon PostgreSQL Database          │
│  (Serverless PostgreSQL on AWS)        │
└────────────────────────────────────────┘
```

## Error Handling

### Client-Side
- User-friendly error messages
- Network error retry logic
- Graceful degradation

### Server-Side
- Try-catch blocks for all operations
- Detailed error logging
- Generic error messages to client
- HTTP status codes:
  - 200: Success
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Server Error

## Testing Strategy

### Manual Testing
- Cross-browser compatibility
- Mobile responsiveness
- Location permission flows
- Role-based access control

### Automated Testing (Future)
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests with Playwright
- Database migration tests

## Compliance & Legal

### Data Protection
- GDPR compliant architecture
- Right to access data
- Right to deletion
- Data minimization principle

### Location Privacy
- Explicit consent required
- Purpose limitation
- No secondary use of location data
- Immediate disposal of coordinates

## Documentation

### For Developers
- `DEVELOPMENT.md` - Setup and workflow
- `API_DOCUMENTATION.md` - API reference
- This file - Technical architecture

### For Users
- `README.md` - Overview and features
- `PRIVACY_POLICY.md` - Privacy practices

### For Deployment
- `DEPLOYMENT.md` - Deployment guide
- `vercel.json` - Vercel configuration

---

**Last Updated:** January 2026
**Version:** 1.0.0
