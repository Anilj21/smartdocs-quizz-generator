# SmartDocs Quiz Generator

An AI-powered quiz generation platform that converts documents into interactive multiple-choice quizzes using OpenAI GPT.

## Features

- **Upload Multiple Document Types**: Support for .pptx, .docx, and .pdf files up to 25MB
- **Customizable Quiz Length**: Generate 3-20 questions per quiz
- **AI-Powered Generation**: Uses OpenAI GPT-4o for high-quality question creation
- **Firebase Authentication**: Google OAuth sign-in for user management
- **Personal Quiz Library**: Save and manage your generated quizzes
- **PDF Export**: Download quizzes as formatted PDF documents
- **Interactive Quiz Taking**: Take quizzes directly in the browser
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- shadcn/ui component library
- Tailwind CSS for styling
- TanStack React Query for state management
- Firebase Authentication
- Wouter for routing

### Backend
- Express.js with TypeScript
- Multer for file uploads
- OpenAI API integration
- PDFKit for PDF generation
- In-memory storage (development)

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- Firebase project with Google Auth enabled

### Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id  
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Add a web app to your project
3. Enable Google Authentication in Authentication settings
4. Add your domain to the authorized domains list
5. Copy the configuration values to your environment variables

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smartdocs-quiz-generator.git
cd smartdocs-quiz-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Usage

1. **Upload**: Select a document (.pptx, .docx, or .pdf) file
2. **Configure**: Choose the number of questions (3-20)
3. **Generate**: AI creates multiple-choice questions from your document content
4. **Review**: View and take the generated quiz
5. **Save**: Sign in to save quizzes to your library
6. **Export**: Download as PDF for offline use

## API Endpoints

- `POST /api/generate-quiz` - Generate quiz from uploaded document (PPTX/DOCX/PDF)
- `GET /api/quizzes` - Get user's saved quizzes (requires auth)
- `POST /api/quizzes` - Save a new quiz (requires auth)
- `GET /api/quizzes/:id/pdf` - Download quiz as PDF

## Project Structure

```
├── client/src/           # React frontend
│   ├── components/       # UI components
│   ├── pages/           # Page components
│   ├── lib/             # Utilities and config
│   └── contexts/        # React contexts
├── server/              # Express backend
│   ├── services/        # Business logic services
│   └── routes.ts        # API routes
├── shared/              # Shared types and schemas
└── uploads/             # Temporary file storage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.