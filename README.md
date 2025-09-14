# CodeQuestHub

A full-stack LeetCode-like coding platform for students with MCQ questions and coding problems.

## Features

- 🔐 JWT Authentication (Student/Admin roles)
- 📝 Multiple Choice Questions (MCQ)
- 💻 Coding Problems with Monaco Editor
- 🏃‍♂️ Code Execution & Testing
- 📊 Progress Tracking & Analytics
- 👨‍💼 Admin Panel for Question Management
- 📱 Responsive Design

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt
- **Code Editor**: Monaco Editor

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)
- npm or yarn

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd CodeQuestHub
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required: Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/codequest_db"

# Required: JWT Secret (use a secure random string)
SESSION_SECRET="your-super-secure-session-secret-change-this-in-production"

# Optional: Server configuration
PORT=5000
NODE_ENV=development
```

### 3. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb codequest_db`
3. Update `DATABASE_URL` in `.env`

#### Option B: Cloud Database (Recommended)

Use a cloud PostgreSQL service:

- **Neon** (Free tier): https://neon.tech
- **Supabase** (Free tier): https://supabase.com
- **Railway** (Free tier): https://railway.app

1. Create a new PostgreSQL database
2. Copy the connection string to `DATABASE_URL` in `.env`

### 4. Database Migration

Push the schema to your database:

```bash
npm run db:push
```

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

The app will be available at: http://localhost:5000

## Usage

### First Time Setup

1. Visit http://localhost:5000
2. Click "Register" to create an account
3. Choose role: "student" or "admin"

### For Students
- Browse and solve coding problems
- Take MCQ quizzes
- View submission history and progress

### For Admins
- Access admin panel at `/admin`
- Create/edit/delete questions
- View student analytics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - List questions
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Create question (admin)
- `PUT /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)

### Submissions
- `GET /api/submissions` - Get user submissions
- `POST /api/submissions` - Submit solution
- `POST /api/execute` - Execute code

### Analytics
- `GET /api/stats/user` - User statistics
- `GET /api/stats/admin` - Admin statistics

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema

### Project Structure

```
CodeQuestHub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database connection
│   └── storage.ts         # Database operations
├── shared/                 # Shared types/schemas
│   └── schema.ts          # Database schema
└── .env                   # Environment variables
```

## Deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
SESSION_SECRET="secure-random-string-for-jwt"
NODE_ENV=production
PORT=5000
```

### Deploy Options

- **Railway**: Connect GitHub repo, set env vars
- **Vercel**: Deploy with PostgreSQL addon
- **Heroku**: Add PostgreSQL addon
- **DigitalOcean**: App Platform with managed database

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
2. Ensure database exists and is accessible
3. Check firewall/network settings for cloud databases

### Build Issues

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check Node.js version (18+ required)
3. Verify all environment variables are set

### Code Execution

Currently uses mock execution. To integrate real Judge0:

1. Get API key from RapidAPI
2. Set `JUDGE0_API_URL` and `JUDGE0_API_KEY` in `.env`
3. Update `/server/routes.ts` execute endpoint

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

MIT License - see LICENSE file for details