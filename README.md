# Hire Me! - Job Portal Application

A full-stack job portal web application inspired by Indeed, built with React, Express.js, and MongoDB.

![Hire Me! Logo](https://via.placeholder.com/400x100/4F46E5/FFFFFF?text=Hire+Me!)

## 🚀 Features

### For Job Seekers
- ✅ Register/Login with role selection
- ✅ Browse jobs with pagination
- ✅ Advanced search (title, company, location, tags)
- ✅ Filter by remote/on-site positions
- ✅ Apply to jobs with cover letters
- ✅ Personal dashboard with applied jobs

### For Employers
- ✅ Register/Login as employer
- ✅ Post new job opportunities
- ✅ Edit/Delete job postings
- ✅ View and manage applicants
- ✅ Company dashboard

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for forms
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **multer** for file uploads
- **cors** for cross-origin requests

## 📁 Project Structure

```
hire-me-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── seeders/          # Database seeders
│   └── server.js
├── package.json          # Root package.json
├── .env.example         # Environment variables template
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hire-me-app
```

### 2. Install Dependencies
```bash
npm install
```
This will install dependencies for both client and server.

### 3. Environment Setup
1. Copy `.env.example` to `.env` in the root directory:
```bash
copy .env.example .env
```

2. Update the environment variables in `.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://aayushkumbharkar53:aayush@08@cluster0.fefw2oh.mongodb.net/hireme

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Client Configuration
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database (Optional)
```bash
npm run seed
```
This will populate your database with sample jobs and users.

### 5. Start Development Servers
```bash
npm run dev
```
This will start both frontend (http://localhost:5173) and backend (http://localhost:5000) servers.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (with pagination and filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (Employer only)
- `PUT /api/jobs/:id` - Update job (Employer only)
- `DELETE /api/jobs/:id` - Delete job (Employer only)

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications/user` - Get user's applications
- `GET /api/applications/job/:jobId` - Get job applications (Employer only)

## 🎨 Design System

### Color Palette
- **Primary**: #4F46E5 (Indigo)
- **Secondary**: #10B981 (Emerald)
- **Accent**: #F59E0B (Amber)
- **Neutral**: #6B7280 (Gray)
- **Success**: #10B981
- **Warning**: #F59E0B
- **Error**: #EF4444

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Responsive**: Mobile-first approach

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build --prefix client`
3. Set output directory: `client/dist`
4. Add environment variable: `VITE_API_URL=your-backend-url`

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `npm install --prefix server`
3. Set start command: `npm start --prefix server`
4. Add environment variables from `.env.example`

## 🧪 Sample Users

After running the seed script, you can use these test accounts:

### Job Seeker
- **Email**: jobseeker@example.com
- **Password**: password123

### Employer
- **Email**: employer@example.com
- **Password**: password123

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Indeed and other job portal platforms
- Built with modern web technologies
- Designed for scalability and performance

## 📞 Support

For support, email support@hireme.com or create an issue in this repository.

---

**Made with ❤️ by [Your Name]**
