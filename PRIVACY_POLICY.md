# Privacy Policy - Chekin-out Student Attendance System

**Last Updated:** January 2026

## Our Commitment to Privacy

Chekin-out is designed from the ground up with privacy as a core principle. We believe that student attendance tracking should be transparent, ethical, and respectful of personal data.

## What Data We Collect

### User Account Information
- Name
- Email address
- Encrypted password
- Role (Admin, Teacher, or Student)
- Class assignment

### Attendance Records
When a student performs check-in or check-out:
- **Timestamp** of the action
- **Validation status** (VALID, KURANG_AKURAT, or TIDAK_VALID)
- **Final attendance status** (calculated from check-in/out validation)

**IMPORTANT:** We do NOT store:
- ❌ GPS coordinates (latitude/longitude)
- ❌ Precise location data
- ❌ Location history
- ❌ Movement patterns

### Teacher Notes
- Optional notes added by teachers during validation
- Used for attendance record-keeping only

## How We Use Location Data

### User-Initiated Only
Location data is ONLY accessed when:
1. A student **explicitly presses** the check-in button
2. A student **explicitly presses** the check-out button

**We NEVER:**
- Track location in the background
- Monitor student movement
- Access location without user action
- Store location data permanently

### Location Validation Process
1. Student presses check-in/check-out button
2. Browser requests location permission (if not already granted)
3. Location is captured **once**
4. Server calculates distance from school
5. Server determines validation status
6. **Only the validation status is stored** (not coordinates)
7. Location data is immediately discarded

### Technical Implementation
```javascript
// Location is used only for validation, never stored
const distance = calculateDistance(
  studentLocation, 
  schoolLocation
);
const status = distance <= radius ? 'VALID' : 'TIDAK_VALID';
// Only 'status' is saved, coordinates are discarded
```

## Legal Basis for Processing

We process personal data based on:
- **Legitimate Interest:** School attendance tracking
- **Consent:** Users grant location permission voluntarily
- **Contract:** School-student relationship

## Data Retention

- **User accounts:** Retained while user is active
- **Attendance records:** Retained for academic year + archive period
- **Location coordinates:** Immediately discarded (never stored)

## Data Security

We implement industry-standard security measures:
- Passwords encrypted with bcrypt
- JWT tokens for authentication
- SSL/TLS encrypted connections
- Secure database (PostgreSQL with SSL)
- Regular security updates

## User Rights

You have the right to:
- **Access** your personal data
- **Correct** inaccurate data
- **Delete** your account (contact admin)
- **Object** to processing
- **Revoke** location permissions at any time

### How to Revoke Location Permission

**On Chrome/Edge:**
1. Click lock icon in address bar
2. Click "Site settings"
3. Change Location to "Block"

**On Firefox:**
1. Click lock icon in address bar
2. Click "Connection secure"
3. Click "More information"
4. Go to "Permissions" tab
5. Uncheck "Access Your Location"

**On Safari/Mobile:**
1. Go to browser/system settings
2. Find site permissions
3. Disable location access

## Teacher Validation

Teachers act as the final authority for attendance validation. They can:
- Confirm system-determined status
- Override system status
- Add contextual notes
- Manually verify exceptional cases

This ensures fairness and human oversight.

## Data Sharing

We do NOT:
- Sell personal data
- Share data with third parties for marketing
- Use data for purposes other than attendance

We MAY share data with:
- School administrators (for attendance management)
- Teachers (for their assigned classes only)
- Parents/guardians (upon school policy)

## Children's Privacy

This system is designed for educational institutions. We:
- Comply with COPPA (if applicable)
- Require parental consent for minors
- Limit data collection to necessary information
- Provide transparency about data use

## Changes to This Policy

We may update this policy. Changes will be:
- Posted on this page
- Notified to users via email
- Effective after 30 days notice

## Compliance

We strive to comply with:
- GDPR (EU General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- COPPA (Children's Online Privacy Protection Act)
- Local data protection laws

## Contact Us

For privacy concerns or questions:
- Email: [Your Contact Email]
- GitHub: [Repository Issues]

## Technical Details for Transparency

### Database Schema
Our attendance table structure:
```sql
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    date DATE,
    check_in_time TIMESTAMP,      -- When, not where
    check_in_status TEXT,          -- VALID/KURANG_AKURAT/TIDAK_VALID
    check_out_time TIMESTAMP,      -- When, not where
    check_out_status TEXT,         -- VALID/KURANG_AKURAT/TIDAK_VALID
    final_status TEXT,             -- Calculated status
    teacher_validated BOOLEAN,     -- Teacher review
    teacher_note TEXT              -- Optional note
    -- NO GPS COORDINATES STORED HERE!
);
```

### Location Validation Logic
See our [open source code](https://github.com/your-repo) for full transparency.

---

**By using Chekin-out, you acknowledge that you have read and understood this Privacy Policy.**

*We believe in ethical technology. If you have suggestions to improve our privacy practices, please let us know.*
