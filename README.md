# Email Analyzer System

A full-stack application that automatically identifies the Receiving Chain and ESP Type of incoming emails using IMAP integration.

## 🎯 Features

- **IMAP Integration**: Automatically fetches incoming emails
- **Email Analysis**: Extracts receiving chain and detects ESP type
- **Responsive Frontend**: React.js with modern UI
- **RESTful Backend**: NestJS with TypeScript
- **Database Storage**: MongoDB for email logs
- **Real-time Updates**: Live email processing and display

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  NestJS Backend  │    │   MongoDB       │
│                 │    │                 │    │                 │
│ - Dashboard     │◄──►│ - IMAP Service  │◄──►│ - Email Logs    │
│ - Results View  │    │ - Email Parser  │    │ - Receiving Chain│
│ - ESP Detection │    │ - ESP Detection │    │ - ESP Types     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Email account with IMAP access

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd email-analyzer-system
   npm run install:all
   ```

2. **Environment Setup:**
   
   Create `backend/.env`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/email-analyzer
   # or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/email-analyzer
   
   # IMAP Configuration
   IMAP_HOST=imap.gmail.com
   IMAP_PORT=993
   IMAP_USER=your-email@gmail.com
   IMAP_PASS=your-app-password
   TEST_SUBJECT=Test Email Analysis
   
   # Server
   PORT=3001
   ```

   Optional Frontend env (create `frontend/.env.local` during development):
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

3. **Start Development Servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

## 📧 How to Use

1. **Send Test Email:**
   - To: your configured IMAP inbox (e.g., your Gmail address)
   - Subject: `Test Email Analysis` (must match exactly or the `TEST_SUBJECT` value)
   - Keep the email UNREAD and in Inbox
   - The system processes UNREAD emails that match `TEST_SUBJECT`

2. **View Results:**
   - Open the frontend dashboard
   - See the receiving chain timeline
   - View detected ESP type (Gmail, Outlook, etc.)

## 🛠️ Tech Stack

- **Frontend**: React.js, Axios, React Router
- **Backend**: NestJS, TypeScript, IMAP, Mongoose
- **Database**: MongoDB
- **Deployment**: Vercel (Frontend), Render/Heroku (Backend), MongoDB Atlas

## 📁 Project Structure

```
email-analyzer-system/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── package.json
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── imap/           # IMAP service
│   │   ├── email/          # Email processing
│   │   ├── database/       # MongoDB models
│   │   └── utils/          # Utility functions
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/build`
 4. Set environment variable: `REACT_APP_API_URL` to your backend URL

### Backend (Render/Heroku)
1. Connect repository to deployment platform
2. Set build command: `cd backend && npm install && npm run build`
3. Set start command: `cd backend && npm run start:prod`
4. Add environment variables

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Update `MONGODB_URI` in backend environment variables
3. Configure network access and database user

## 📊 API Endpoints

- `GET /emails/latest` - Get latest processed email
- `GET /emails/all` - Get all email logs
- `GET /emails/:id` - Get specific email by ID
 - `GET /emails/rescan` - Trigger immediate IMAP scan
 - `GET /health` - Service and IMAP status

## 🔗 Live Demo

- Frontend: https://email-analyzer-system.vercel.app
- Backend: https://email-analyzer-backend-uw1o.onrender.com
- Health: https://email-analyzer-backend-uw1o.onrender.com/health
- Rescan: https://email-analyzer-backend-uw1o.onrender.com/emails/rescan

## 🎥 Demo Video

- Demo: <add your Loom/video link here>

## 🔧 Configuration

### IMAP Settings for Popular Providers

**Gmail:**
- Host: `imap.gmail.com`
- Port: `993`
- Security: SSL/TLS
- Use App Password (not regular password)

Additional rules:
- Only UNREAD emails are processed.
- Subject must equal `TEST_SUBJECT` (defaults to `Test Email Analysis`).

**Outlook:**
- Host: `outlook.office365.com`
- Port: `993`
- Security: SSL/TLS

**Yahoo:**
- Host: `imap.mail.yahoo.com`
- Port: `993`
- Security: SSL/TLS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
