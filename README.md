# HealthConnect - Community Health Platform

A modern healthcare appointments and teleconsultation platform built with Next.js, Firebase, and TypeScript.

## Features

### For Patients
- **User Registration & Authentication** - Secure account creation and login
- **Appointment Booking** - Schedule appointments with healthcare providers
- **Teleconsultation** - Video consultations with doctors
- **Medical Records** - Access to personal health records and prescriptions
- **Profile Management** - Update personal and health information with image upload
- **Notifications** - Email reminders for appointments

### For Doctors
- **Professional Registration** - Apply to join the platform (requires admin approval)
- **Appointment Management** - View, accept, and manage patient appointments
- **Patient Records** - Access patient medical histories securely
- **Teleconsultation** - Conduct video consultations with patients
- **Prescription Management** - Issue digital prescriptions
- **Availability Management** - Set and update availability schedules

### For Administrators
- **User Management** - Approve doctors and manage all user accounts
- **System Monitoring** - Monitor appointments and system health
- **Analytics & Reports** - Generate usage reports and analytics
- **System Settings** - Configure platform settings and notifications

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization library

### Backend & Database
- **Firebase Authentication** - User authentication and authorization
- **Firestore** - NoSQL database for application data
- **Cloudinary** - Image and file storage with optimization

### Real-time Communication
- **WebRTC** - Peer-to-peer video calling
- **Socket.io** - Real-time messaging (planned)

### Testing
- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing

## Architecture

The application follows a modular layered architecture:

\`\`\`
├── app/                    # Next.js App Router pages
├── components/            # Reusable React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── appointments/     # Appointment management
│   ├── teleconsultation/ # Video calling components
│   ├── admin/           # Admin-specific components
│   ├── profile/         # Profile management components
│   └── ui/              # Base UI components
├── lib/                  # Utility libraries and configurations
│   ├── firebase.ts      # Firebase configuration
│   ├── cloudinary.ts    # Cloudinary configuration and utilities
│   ├── auth-context.tsx # Authentication context
│   ├── webrtc.ts        # WebRTC utilities
│   └── types.ts         # TypeScript type definitions
├── __tests__/           # Unit and integration tests
└── e2e/                 # End-to-end tests
\`\`\`

## Design Patterns Used

### 1. **Context Pattern**
- `AuthContext` for global authentication state management
- Provides user authentication status across the application

### 2. **Repository Pattern**
- Firebase service abstractions for data access
- Centralized data operations with consistent interfaces

### 3. **Observer Pattern**
- Real-time listeners for Firestore data changes
- WebRTC event handling for teleconsultation features

### 4. **Factory Pattern**
- WebRTC service creation with different configurations
- Component factories for different user roles

### 5. **Singleton Pattern**
- Firebase configuration and initialization
- Single instance of critical services

### 6. **Adapter Pattern**
- Firebase to application data model conversion
- WebRTC API abstraction for cross-browser compatibility

## Security Features

- **Role-Based Access Control (RBAC)** - Different permissions for patients, doctors, and admins
- **Protected Routes** - Authentication required for sensitive pages
- **Data Validation** - Input validation and sanitization
- **Secure Communication** - HTTPS and encrypted video calls
- **Firebase Security Rules** - Database-level security (to be configured)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Authentication and Firestore enabled
- Cloudinary account for image storage

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd healthconnect-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Firestore Database

4. **Configure Cloudinary**
   - Create a Cloudinary account at https://cloudinary.com
   - Get your cloud name, API key, and API secret
   - Create an upload preset for the application

5. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   \`\`\`

6. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open your browser**
   Navigate to `http://localhost:3000`

### Testing

Run the test suite:
\`\`\`bash
# Unit tests
npm test

# Test with coverage
npm run test:coverage

# End-to-end tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
\`\`\`

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
\`\`\`dockerfile
# Dockerfile included for containerized deployment
docker build -t healthconnect .
docker run -p 3000:3000 healthconnect
\`\`\`

## Firebase Configuration

### Firestore Security Rules
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Appointments - patients and doctors can access their appointments
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid);
    }
    
    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
\`\`\`

### Authentication Configuration
- Enable Email/Password authentication
- Configure authorized domains for production
- Set up email templates for password reset

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Appointment Endpoints
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### User Management (Admin)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/approve` - Approve doctor
- `DELETE /api/admin/users/:id` - Delete user

## Performance Considerations

### Optimization Strategies
- **Code Splitting** - Automatic route-based code splitting with Next.js
- **Image Optimization** - Next.js Image component for optimized images
- **Caching** - Firebase caching and browser caching strategies
- **Lazy Loading** - Components loaded on demand
- **Bundle Analysis** - Regular bundle size monitoring

### Scalability
- **Firestore Indexing** - Proper database indexes for query performance
- **CDN** - Static assets served via Vercel Edge Network
- **Serverless Functions** - API routes scale automatically
- **Real-time Optimization** - Efficient WebRTC connection management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure accessibility compliance
- Follow the existing code style

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

## Roadmap

### Phase 1 (Current)
- ✅ Basic authentication and user management
- ✅ Appointment booking system
- ✅ Teleconsultation platform
- ✅ Admin dashboard

### Phase 2 (Planned)
- 🔄 Mobile app development
- 🔄 Advanced reporting and analytics
- 🔄 Integration with external health systems
- 🔄 AI-powered health recommendations

### Phase 3 (Future)
- 📋 Telemedicine compliance (HIPAA)
- 📋 Multi-language support
- 📋 Advanced scheduling algorithms
- 📋 IoT device integration
