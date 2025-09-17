
# Highland Residency Cultural Association Portal

A comprehensive society management system for Highland Residency Cultural Association, featuring event management, donation tracking, and member engagement tools.

## 🚀 Features

### 🌟 User Features
- **Event Management**
  - View upcoming cultural events
  - Register for events with participant details
  - View registration history
  - Download event receipts

- **Donation Tracking**
  - View donation history
  - Download donation receipts
  - Track payment status

- **User Profile**
  - Personal information management
  - Flat/building details
  - Update contact information

### 🛠️ Admin Features
- **Event Management**
  - Create and manage events
  - Set registration deadlines
  - Track event registrations
  - Manage participant lists
  - Generate event reports

- **Donation Management**
  - Record and track donations
  - Generate donation receipts
  - Financial reporting
  - Export financial data

- **User Management**
  - Member directory
  - Role-based access control
  - User activity monitoring

- **Analytics Dashboard**
  - Event participation statistics
  - Financial overview
  - Member engagement metrics

## 🛠️ Tech Stack

### Frontend
- ⚡ Vite - Next Generation Frontend Tooling
- ⚛️ React 18 - A JavaScript library for building user interfaces
- 📘 TypeScript - Type-safe JavaScript
- 🎨 Tailwind CSS - A utility-first CSS framework
- ✨ shadcn/ui - Beautifully designed components
- 🔄 React Query - Server state management
- 📱 React Router - Client-side routing
- 📊 Recharts - Composable charting library

### Backend
- 🔥 Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Cloud Functions

### Development Tools
- 🛠️ ESLint - JavaScript/TypeScript linter
- 💅 Prettier - Code formatter
- 🐙 Git - Version control
- 🔄 GitHub - Code hosting

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Firebase CLI (for deployment)

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/society-dues-dashboard-pro-20.git
   cd society-dues-dashboard-pro-20
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Create a `.env` file in the root directory
   - Add your Firebase configuration:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── admin/         # Admin-specific components
│   ├── auth/          # Authentication components
│   ├── common/        # Shared components
│   └── user/          # User-specific components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and configurations
├── pages/             # Page components
├── services/          # API and service integrations
├── store/             # State management (Zustand)
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## 📦 Deployment

### Firebase Hosting
1. Build the application
   ```bash
   npm run build
   ```

2. Deploy to Firebase
   ```bash
   firebase login
   firebase init
   firebase deploy
   ```


## 👥 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For any queries, please contact the development team at [your-email@example.com](mailto:your-email@example.com)

---

Built with ❤️ by Highland Residency Cultural Association
