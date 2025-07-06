# Turma Labs Portal - Phase 2 Deployment Instructions

## Overview
Phase 2 development has been completed with the following new features:
- ✅ Manage Users page with full CRUD functionality
- ✅ User invitation system with temporary password generation
- ✅ 20 curated VA training resources with completion tracking
- ✅ CSV export functionality for Time Logs and EOD Reports
- ✅ Enhanced UI/UX with consistent Turma Labs branding

## Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Domain access to labs.turmadigitalagency.com

## Backend Setup

1. **Install Python Dependencies**
   ```bash
   cd backend
   pip3 install flask flask-cors flask-sqlalchemy
   ```

2. **Database Initialization**
   The database will be automatically created on first run with a default admin user:
   - Username: `admin`
   - Password: `admin123`
   - **Important**: Change this password immediately after first login

3. **Start Backend Server**
   ```bash
   cd backend
   python3.11 src/main.py
   ```
   Backend will run on http://localhost:5000

## Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

2. **Development Server**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Production Build**
   ```bash
   npm run build
   ```
   Built files will be in the `dist/` directory

## New Features Guide

### 1. Manage Users (/admin/users)
- **Add User**: Click "Add User" button to create new VA accounts
- **User Information**: Name, Email, Role (Admin/VA), Assigned Client
- **Automatic Credentials**: System generates username and temporary password
- **Password Reset**: Admins can reset user passwords
- **User Status**: Toggle active/inactive status

### 2. VA Training Resources (/admin/trainings)
- **Bulk Import**: Click "Import VA Trainings" to add 20 curated resources
- **Categories**: Productivity, Project Management, Communication, etc.
- **Skill Levels**: Beginner, Intermediate, Advanced, All Levels
- **Completion Tracking**: Users can mark trainings as completed
- **Filtering**: Search by title, category, and skill level

### 3. CSV Export Functionality
- **Time Logs**: Export filtered time logs with user, date, and hours data
- **EOD Reports**: Export reports with tasks, blockers, and support needed
- **Admin Only**: Export features are restricted to admin users
- **Filtering**: Apply date ranges and user filters before export

## Domain Configuration

### DNS Records for labs.turmadigitalagency.com
You'll need to configure these DNS records:

**For Netlify Deployment:**
- CNAME: `labs` → `your-netlify-site.netlify.app`

**For Custom Server:**
- A Record: `labs` → `your-server-ip`

## Production Deployment Options

### Option 1: Netlify (Frontend) + Heroku/Railway (Backend)
1. **Frontend**: Deploy `frontend/dist` to Netlify
2. **Backend**: Deploy backend to Heroku or Railway
3. **Environment**: Update API endpoints in frontend

### Option 2: Single Server Deployment
1. **Build Frontend**: `npm run build` in frontend directory
2. **Copy Build**: Move `dist/*` to `backend/src/static/`
3. **Deploy**: Upload entire backend directory to server
4. **Run**: `python3.11 src/main.py` on server

## Security Considerations

1. **Change Default Admin Password**: First priority after deployment
2. **Environment Variables**: Move sensitive config to environment variables
3. **HTTPS**: Ensure SSL certificate for production domain
4. **Database**: Consider PostgreSQL for production instead of SQLite

## Admin Access Confirmation

You have full admin access to:
- ✅ All routes and pages
- ✅ User management (create, edit, deactivate)
- ✅ Content upload and management
- ✅ Data exports (CSV)
- ✅ Training resource management
- ✅ All administrative functions

## Troubleshooting

### Common Issues:
1. **Backend not starting**: Check Python dependencies are installed
2. **Frontend build errors**: Use `--legacy-peer-deps` flag with npm
3. **API connection issues**: Verify backend is running on port 5000
4. **Database errors**: Delete `backend/src/database/app.db` to reset

### Support:
- Check browser console for JavaScript errors
- Check backend terminal for Python errors
- Verify all dependencies are installed correctly

## Next Steps (Future Phases)
- Scorecard system implementation
- White-label capability per client
- Custom reports with weekly automation
- Client login panel
- Email automation for user invitations

---

**Note**: The application is currently configured for development. For production deployment, additional security measures and environment configuration will be needed.

