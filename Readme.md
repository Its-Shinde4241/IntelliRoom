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
3. Download the service account key and place it as `serviceAccountKey.json` in the backend directory
4. Copy the Firebase config to your frontend `.env` file

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
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, Railway, DigitalOcean, etc.)

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)
3. Update API base URL for production

## 📝 License

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
