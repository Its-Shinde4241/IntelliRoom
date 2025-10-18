<img width="1916" height="1079" alt="Screenshot 2025-10-17 224129" src="https://github.com/user-attachments/assets/37cf5bcc-02d2-4899-8acf-5db825a2dcc0" />

# IntelliRoom 🚀

A collaborative real-time code editor with integrated compilation and execution capabilities. Built with React, TypeScript, Node.js, and Prisma.

## 📸 Demo

<div align="center">

### 🏠 Homepage
<img width="1919" height="1079" alt="Screenshot 2025-10-17 224152" src="https://github.com/user-attachments/assets/31bf4859-e253-4a63-8712-1d075eaf0602" />

*Clean and modern landing page with authentication options*

### 👥 Rooms

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/2110097b-a8ec-4a87-9798-624f906e3658" />


*Multiple Rooms as per topics or any other criteria*

### 💻 Code Editor Interface
<img width="1919" height="1079" alt="code editor" src="https://github.com/user-attachments/assets/95c031ae-1479-4c5f-bc69-0ce59caa6627" />



*Monaco editor with syntax highlighting and integrated terminal*

### 📁 Project Management

<img width="1919" height="1079" alt="Project Management" src="https://github.com/user-attachments/assets/7a97d974-06d1-48c5-9780-854d4612554e" />

*Organize and manage your code files and projects*

### 🔧 Live Code Execution

<img width="1919" height="1079" alt="live_preview" src="https://github.com/user-attachments/assets/8bc2a384-1bef-4461-bc8c-0618394a89c7" />


*Execute code in multiple languages with real-time output*

### 📱 Responsive Design

<img width="1919" height="1079" alt="project_file" src="https://github.com/user-attachments/assets/72bbe7b6-dbe5-40ab-bbb3-d72f08af1242" />

*Fully responsive interface that works on all devices*

</div>

---

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

**CRITICAL**: Never commit your Firebase service account credentials to version control. These credentials can compromise your Firebase project if exposed.

### Security Best Practices:

- **Always use environment variables** for Firebase credentials (see setup instructions below)
- Add `.env` and `serviceAccountKey.json` to your `.gitignore` file
- Store credentials securely in production environments
- Rotate keys immediately if accidentally exposed
- Use Firebase Admin SDK securely in server environments only
- Never hardcode credentials in your source code

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
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key

# Firebase Configuration (REQUIRED)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"your-private-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com","universe_domain":"googleapis.com"}

# Optional: Gemini AI Integration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_AGENT_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

**Security Note**: Replace all placeholder values with your actual Firebase service account credentials. Get these from your Firebase Console → Project Settings → Service Accounts → Generate new private key.

**Important**: Make sure to add the following to your `.gitignore` file:

```gitignore
# Environment files (CRITICAL - Never commit these)
.env
.env.local
.env.development
.env.production

# Firebase service account keys (if using file method)
serviceAccountKey.json
firebase-adminsdk-*.json

# Dependencies and build outputs
node_modules/
dist/
build/
.next/
coverage/

# IDE and system files
.vscode/
.idea/
*.log
.DS_Store
Thumbs.db
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

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" and follow the setup wizard

2. **Enable Authentication**
   - In your Firebase project, go to Authentication → Sign-in method
   - Enable Email/Password and Google providers
   - Configure authorized domains for your application

3. **Generate Service Account Credentials**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - **IMPORTANT**: Copy the JSON content and paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` in your `.env` file
   - **DO NOT** download and save the JSON file to avoid accidentally committing it

4. **Configure Frontend Firebase**
   - In Project Settings → General, find your web app configuration
   - Copy the Firebase config values to your frontend `.env` file

5. **Set up Firestore Database**
   - Go to Firestore Database and create a database
   - Set up security rules for your application needs

**Security Reminder**: Always use environment variables for Firebase credentials. The service account key should be stored as a JSON string in your `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable, not as a separate file.

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
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=production
   PORT=3001
   
   # Firebase Configuration
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
   
   # Optional: Gemini AI
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_AGENT_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
   ```
3. Deploy to your preferred platform (Heroku, Railway, DigitalOcean, etc.)
4. Ensure proper CORS configuration for your frontend domain

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)
3. Update API base URL for production in environment variables
4. Configure proper redirects for SPA routing

### Production Security Checklist

- [ ] Environment variables are properly configured
- [ ] Firebase service account credentials are stored as environment variables (not files)
- [ ] `.gitignore` file excludes all sensitive files and credentials
- [ ] CORS is properly configured for your domain
- [ ] HTTPS is enabled in production
- [ ] Database connections use secure credentials
- [ ] Firebase security rules are properly configured
- [ ] Rate limiting is implemented for API endpoints
- [ ] Input validation and sanitization is in place
- [ ] Error messages don't expose sensitive information
- [ ] Regular security audits are conducted

## � Troubleshooting

### Common Issues

**Database Connection Issues**

- Verify your MySQL server is running
- Check DATABASE_URL format and credentials
- Ensure database exists and is accessible

**Firebase Authentication Errors**

- Verify Firebase project configuration and environment variables
- Check if service account credentials are properly formatted in the `.env` file
- Ensure Firebase Auth is enabled for your project
- Verify that the service account has the necessary permissions

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
