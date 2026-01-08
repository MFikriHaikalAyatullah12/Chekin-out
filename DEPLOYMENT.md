# Deployment Guide

## Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account
- PostgreSQL database (Neon recommended)

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   
   In Vercel project settings, add these environment variables:
   
   ```
   DATABASE_URL=postgresql://your_neon_connection_string
   JWT_SECRET=your-strong-random-secret-key-here
   JWT_EXPIRES_IN=7d
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **Important:** Generate a strong JWT_SECRET:
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32
   
   # Or use Node.js:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

5. **Run Database Migration**
   
   After first deployment, you need to run migration once:
   
   **Option A: Local Migration (Recommended)**
   ```bash
   # Make sure your .env.local has production DATABASE_URL
   npm run db:migrate
   ```
   
   **Option B: Using Neon Console**
   - Go to Neon console
   - Open SQL Editor
   - Copy and paste content from `database/schema.sql`
   - Run the SQL
   - Then run content from `database/seed.sql`

### Post-Deployment Checklist

- [ ] Test login with demo accounts
- [ ] Test check-in/check-out from mobile device
- [ ] Verify location permission prompt works
- [ ] Test teacher validation workflow
- [ ] Test admin settings update
- [ ] Check all pages load correctly

### Updating the App

Every time you push to GitHub, Vercel will automatically deploy:

```bash
git add .
git commit -m "Your changes"
git push
```

### Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `NEXT_PUBLIC_APP_URL` environment variable

### Troubleshooting

**Issue: Database connection failed**
- Check DATABASE_URL is correct
- Ensure Neon database is active
- Verify SSL mode is enabled

**Issue: JWT token errors**
- Regenerate JWT_SECRET
- Clear browser localStorage
- Try login again

**Issue: Location permission not working**
- Ensure site is served over HTTPS (Vercel does this automatically)
- Check browser console for errors
- Test on mobile device with location enabled

### Performance Optimization

For production, consider:
- Enable Vercel Analytics
- Add Redis caching for frequently accessed data
- Implement rate limiting for API endpoints
- Add monitoring (Sentry, LogRocket, etc.)

### Monitoring

Monitor your app:
- Vercel Dashboard for deployment logs
- Neon Dashboard for database metrics
- Browser DevTools for client-side errors

---

## Alternative: Deploy to Other Platforms

### Netlify

Similar to Vercel:
1. Connect GitHub repo
2. Set environment variables
3. Deploy

Build command: `npm run build`
Publish directory: `.next`

### Railway

1. Connect GitHub repo
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

### Docker (Self-hosted)

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t chekin-out .
docker run -p 3000:3000 --env-file .env.local chekin-out
```

---

**Need help?** Open an issue on GitHub or check [Next.js deployment docs](https://nextjs.org/docs/deployment).
