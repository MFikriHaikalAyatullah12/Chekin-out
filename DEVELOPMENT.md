# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (local or Neon)
- Git

### Initial Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd chekin-out
   npm install
   ```

2. **Configure environment**
   
   Copy `.env.local.example` to `.env.local` (or create new):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/chekin_db
   JWT_SECRET=your-development-secret-key
   JWT_EXPIRES_IN=7d
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run database migration**
   ```bash
   npm run db:migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
chekin-out/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── admin/        # Admin CRUD operations
│   │   ├── student/      # Student check-in/out
│   │   └── teacher/      # Teacher validation
│   ├── admin/            # Admin dashboard page
│   ├── teacher/          # Teacher dashboard page
│   ├── student/          # Student dashboard page
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home/redirect page
│   └── globals.css       # Global styles
├── lib/                   # Utilities
│   ├── db.ts             # Database connection
│   ├── auth.ts           # JWT authentication
│   ├── location.ts       # Location validation logic
│   └── types.ts          # TypeScript definitions
├── database/              # SQL files
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Sample data
├── scripts/               # Utility scripts
│   └── migrate.js        # Migration runner
└── public/                # Static assets
```

## Development Workflow

### Creating New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow existing code structure
   - Add TypeScript types
   - Maintain privacy principles

3. **Test locally**
   ```bash
   npm run dev
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description of feature"
   git push origin feature/your-feature-name
   ```

5. **Create pull request**

### Code Style

- Use TypeScript for all new files
- Follow existing naming conventions
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Commit Message Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Login as admin
- [ ] Login as teacher
- [ ] Login as student
- [ ] Logout
- [ ] Invalid credentials

**Student Flow:**
- [ ] Check-in with valid location
- [ ] Check-in outside radius
- [ ] Check-in without location permission
- [ ] Check-out with valid location
- [ ] Try duplicate check-in
- [ ] View attendance status

**Teacher Flow:**
- [ ] View student list
- [ ] See attendance status
- [ ] Validate attendance (approve)
- [ ] Validate attendance (reject)
- [ ] Add teacher notes
- [ ] Change date filter

**Admin Flow:**
- [ ] View classes list
- [ ] Create new class
- [ ] Update class
- [ ] Delete class
- [ ] Update school settings
- [ ] Change coordinates
- [ ] Change radius
- [ ] Change time windows

### Testing Location Validation

To test without physically moving:

**Option 1: Browser DevTools**
1. Open Chrome DevTools
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "sensors"
4. Select "Show Sensors"
5. Change location to custom coordinates

**Option 2: Mock Location (for development)**

Add to `lib/location.ts` for testing only:
```typescript
// DEVELOPMENT ONLY - REMOVE IN PRODUCTION
const MOCK_LOCATION = {
  latitude: -6.2088,
  longitude: 106.8456,
  accuracy: 20
};
```

### Database Testing

**Reset database:**
```bash
npm run db:migrate
```

**Manual SQL queries:**
```bash
# Connect to database
psql $DATABASE_URL

# View all users
SELECT * FROM users;

# View today's attendance
SELECT * FROM attendance WHERE date = CURRENT_DATE;

# Check validation status distribution
SELECT final_status, COUNT(*) 
FROM attendance 
GROUP BY final_status;
```

## Common Development Tasks

### Adding a New API Endpoint

1. Create file in `app/api/[path]/route.ts`
2. Export async function for HTTP method:
   ```typescript
   export async function GET(request: NextRequest) {
     // Implementation
   }
   ```
3. Add authentication check
4. Implement logic
5. Return JSON response

### Adding a New Page

1. Create folder in `app/[page-name]/`
2. Add `page.tsx` file
3. Implement component
4. Add to navigation if needed

### Modifying Database Schema

1. Edit `database/schema.sql`
2. Test changes locally
3. Document in migration notes
4. Update `lib/types.ts` if needed

### Adding New User Role

1. Update `user_role` enum in schema
2. Update `UserRole` type in `lib/types.ts`
3. Add authorization checks in API routes
4. Create dashboard page
5. Update login redirect logic

## Debugging

### Common Issues

**Database connection errors:**
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**JWT token errors:**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Clear browser storage
# Open DevTools > Application > Storage > Clear site data
```

**Location permission denied:**
- Use HTTPS in production
- Check browser console for errors
- Try different browser
- Check system location settings

### Development Tools

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript
- Tailwind CSS IntelliSense
- PostgreSQL

**Browser DevTools:**
- Console: Check for errors
- Network: Monitor API calls
- Application: View localStorage
- Sensors: Mock location

## Performance Optimization

### Database Indexes

Already created:
```sql
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
```

### Caching Strategies

For production, consider:
- Redis for session storage
- Next.js static generation where possible
- Database query result caching

### Bundle Size

Monitor with:
```bash
npm run build
# Check .next/build-manifest.json
```

## Security Best Practices

1. **Never commit secrets**
   - Use `.env.local` (gitignored)
   - Never hardcode passwords
   - Rotate secrets regularly

2. **Validate all inputs**
   - Server-side validation
   - Sanitize user input
   - Use parameterized queries

3. **Protect API routes**
   - Require authentication
   - Check user roles
   - Rate limiting in production

4. **HTTPS only**
   - Required for geolocation API
   - Use in production always

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Pull Request Guidelines

- Clear description of changes
- Reference related issues
- Include test results
- Update documentation
- Follow code style

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [JWT.io](https://jwt.io/)

## Getting Help

- Check existing documentation
- Search GitHub issues
- Open new issue with:
  - Environment details
  - Steps to reproduce
  - Expected vs actual behavior
  - Error messages/logs

---

**Happy coding! 🚀**
