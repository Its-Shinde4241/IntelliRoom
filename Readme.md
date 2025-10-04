# IntelliRoom 🚀

A collaborative real-time code editor with integrated compilation and execution capabilities. Built with React, TypeScript, Node.js, and Prisma.

## ✨ Features

- **Real-time Collaborative Editing** - Multiple users can code together in shared rooms
- **Multi-language Support** - Support for C++, Java, Python, JavaScript, TypeScript, HTML, CSS
- **Integrated Terminal** - Run code directly in the browser with input/output handling
- **File Management** - Create, edit, rename, and delete files within rooms and projects
- **Authentication** - Secure user authentication with Firebase Auth (Email/Password + Google OAuth)
- **Room & Project System** - Organize code into rooms for collaboration or projects for personal work
- **Responsive UI** - Modern, clean interface built with Radix UI components and Tailwind CSS
- **Code Execution** - Execute code using Judge0 API with real-time results

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Monaco Editor** for code editing experience
- **Tailwind CSS** for styling
- **Radix UI** for accessible UI components
- **Zustand** for state management
- **Firebase** for authentication
- **React Router** for navigation

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** as ORM with MySQL database
- **Firebase Admin** for authentication verification
- **WebSocket** support for real-time features
- **Judge0 API** for code execution

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- MySQL database
- Firebase project with Auth enabled
- Judge0 API access (optional, for code execution)

## ⚠️ Important Security Notice

**CRITICAL**: Never commit your Firebase service account key (`serviceAccountKey.json`) to version control. This file contains sensitive credentials that could compromise your Firebase project if exposed.

### Security Best Practices:

- Add `serviceAccountKey.json` to your `.gitignore` file
- Store credentials as environment variables in production
- Rotate keys immediately if accidentally exposed
- Use Firebase Admin SDK securely in server environments only

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd intelliroom
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL="mysql://username:password@localhost:3306/intelliroom"
FIREBASE_SERVICE_ACCOUNT_KEY_PATH="./serviceAccountKey.json"
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

**Important**: Make sure to add the following to your `.gitignore` file:

```
.env
serviceAccountKey.json
node_modules/
dist/
build/
```

Set up the database:

```bash
npm run dbpush
npm run db_generate
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APIKEY=your_firebase_api_key
VITE_AUTHDOMAIN=your_project.firebaseapp.com
VITE_PROJECTID=your_project_id
VITE_STORAGEBUCKET=your_project.appspot.com
VITE_MESSAGINGSENDERID=your_sender_id
VITE_APPID=your_app_id
VITE_MEASUREMENTID=your_measurement_id
VITE_JUDGE0_URL=https://judge0-ce.p.rapidapi.com
VITE_JUDGE0_KEY=your_rapidapi_key
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in the backend directory
   - **NEVER commit this file to version control**
4. Copy the Firebase config to your frontend `.env` file
5. Set up Firestore database rules for secure data access

**Security Note**: In production, use environment variables instead of the service account key file:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## 📁 Project Structure

```
intelliroom/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # Utility functions
│   │   └── hooks/          # Custom React hooks
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controller/     # API controllers
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── db/            # Database configuration
│   │   └── services/       # Business logic
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

The application uses the following main entities:

- **User** - User authentication and profile data
- **Room** - Collaborative coding rooms
- **Project** - Personal coding projects
- **File** - Code files belonging to rooms or projects
- **Message** - Chat messages in rooms

## 🔧 Available Scripts

### Backend

```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run dbpush       # Push Prisma schema to database
npm run db_generate  # Generate Prisma client
npm run db_studio    # Open Prisma Studio
```

### Frontend

```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🌐 API Routes

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Rooms

- `GET /api/rooms/user/:userId` - Get user's rooms
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:roomId` - Update room
- `DELETE /api/rooms/:roomId` - Delete room

### Files

- `GET /api/files/:fileId` - Get file by ID
- `POST /api/files` - Create new file
- `PUT /api/files/:fileId` - Update file
- `DELETE /api/files/:fileId` - Delete file

### Projects

- `GET /api/projects/user/:userId` - Get user's projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:projectId` - Update project
- `DELETE /api/projects/:projectId` - Delete project

## 🎯 Key Features Explained

### Code Execution

The application integrates with Judge0 API to execute code in multiple languages:

- Supports C++, Java, Python, JavaScript, TypeScript
- Real-time compilation and execution feedback
- Input/output handling through integrated terminal

### Real-time Collaboration

- Room-based collaboration system
- Real-time file editing and synchronization
- User presence indicators

### File Management

- Hierarchical file organization
- Support for multiple file types
- Real-time file operations (create, rename, delete)

## 🔒 Authentication Flow

1. Users can sign up/in with email/password or Google OAuth
2. Firebase handles authentication on the frontend
3. Backend verifies Firebase ID tokens for API access

## 🚀 Deployment

### Backend Deployment

1. Build the application: `npm run build`
2. Set production environment variables:
   ```env
   DATABASE_URL=your_production_database_url
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=production
   PORT=3001
   ```
3. Deploy to your preferred platform (Heroku, Railway, DigitalOcean, etc.)
4. Ensure proper CORS configuration for your frontend domain

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)
3. Update API base URL for production in environment variables
4. Configure proper redirects for SPA routing

### Production Security Checklist

- [ ] Environment variables are set correctly
- [ ] Service account keys are not exposed
- [ ] CORS is properly configured
- [ ] HTTPS is enabled
- [ ] Database connections are secure
- [ ] Firebase security rules are properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place

## � Troubleshooting

### Common Issues

**Database Connection Issues**

- Verify your MySQL server is running
- Check DATABASE_URL format and credentials
- Ensure database exists and is accessible

**Firebase Authentication Errors**

- Verify Firebase project configuration
- Check if service account key is valid and not expired
- Ensure Firebase Auth is enabled for your project

**Judge0 API Issues**

- Verify your RapidAPI key is valid
- Check rate limits and quota
- Ensure proper CORS configuration

**Build/Development Issues**

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Ensure all environment variables are set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests if applicable
4. Ensure code follows the project's style guidelines
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request with a clear description

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation when needed
- Test your changes thoroughly
- Never commit sensitive credentials

## �📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🛟 Support

For support, [email](shindeshubham4241@gmail.com) or open an issue in the GitHub repository.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editing experience
- [Judge0](https://judge0.com/) for code execution capabilities
- [Radix UI](https://radix-ui.com/) for accessible UI components
- [Firebase](https://firebase.google.com/) for authentication services
- [Prisma](https://prisma.io/) for database management

---

**Happy Coding! 🎉**
