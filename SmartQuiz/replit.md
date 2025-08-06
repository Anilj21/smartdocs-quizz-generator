# SmartDocs Quiz Generator

## Overview

SmartDocs is a full-stack web application that generates AI-powered quiz questions from documents. Users can upload .pptx, .docx, and .pdf files, customize the number of questions (3-20), generate multiple-choice questions using OpenAI's GPT model, authenticate with Firebase Google Auth, save quizzes to their personal library, and download them as formatted PDFs. The application features a modern React frontend with Firebase authentication, an Express.js backend, in-memory storage for development, and shadcn/ui for the user interface components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side application uses React with TypeScript, built on Vite for fast development and bundling. The UI is constructed using shadcn/ui components with Tailwind CSS for styling, providing a consistent design system with proper accessibility features. State management is handled through TanStack React Query for server state and React hooks for local state. The application follows a page-based routing structure using Wouter for client-side navigation.

Key architectural decisions:
- **Component Library**: Uses shadcn/ui for consistent, accessible UI components
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe forms

### Backend Architecture

The server is built with Express.js using TypeScript and follows a modular service-oriented architecture. File uploads are handled through Multer middleware with validation for .pptx files only. The application uses a plugin-based storage system that can switch between in-memory storage (for development) and PostgreSQL (for production) through a common interface.

Key architectural decisions:
- **Framework**: Express.js with TypeScript for type safety
- **File Processing**: Multer for file uploads with size and type validation
- **Service Layer**: Separate services for OpenAI integration, PDF generation, and PPTX parsing
- **Storage Abstraction**: Interface-based storage system supporting multiple backends
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Database Design

The application uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema includes users and quizzes tables with JSON storage for quiz questions, allowing flexible question structures while maintaining relational integrity.

Schema design:
- **Users Table**: Basic user management with username/password authentication
- **Quizzes Table**: Stores quiz metadata with JSON field for questions array
- **Relationships**: Foreign key relationships between users and their quizzes
- **Indexing**: Primary keys and user ID indexing for efficient queries

### AI Integration

OpenAI GPT-4o integration generates quiz questions from extracted PowerPoint content. The system uses structured prompts to ensure consistent question format and quality, with built-in retry logic and error handling for API failures.

Implementation details:
- **Model**: Uses GPT-4o for high-quality question generation
- **Customizable Question Count**: Users can select 3-20 questions per quiz
- **Prompt Engineering**: Dynamic prompts adapt to selected question count with 4 options each
- **Error Handling**: Graceful fallbacks and retry logic for API failures
- **Response Validation**: JSON schema validation for generated quiz content

### Authentication & User Management

Firebase Authentication provides secure user management with Google OAuth integration. Users can sign in to save quizzes to their personal library and access them across sessions.

Implementation details:
- **Provider**: Firebase Auth with Google OAuth
- **User Context**: React context manages authentication state
- **Protected Routes**: Quiz library requires authentication
- **Graceful Degradation**: Users can generate and download quizzes without signing in

### File Processing Pipeline

The document processing pipeline extracts text content from uploaded files using specialized parsers for each format. The system supports PowerPoint presentations (.pptx), Word documents (.docx), and PDF files (.pdf).

Processing flow:
- **Upload Validation**: File type and size validation for .pptx, .docx, and .pdf files
- **Format Detection**: Automatic detection of file type based on extension and MIME type
- **Text Extraction**: 
  - PPTX: XML-based text extraction from presentation structure
  - DOCX: Mammoth library for Word document parsing
  - PDF: pdf-parse-new library for PDF text extraction
- **Content Analysis**: Fallback content generation for insufficient text
- **Cleanup**: Automatic file cleanup after processing

### PDF Generation

Quiz PDFs are generated server-side using PDFKit, creating properly formatted documents with consistent styling and layout. The system handles page breaks, styling, and includes metadata like source file and generation date.

## External Dependencies

### Core Technologies
- **React 18**: Frontend framework with TypeScript support
- **Express.js**: Backend web server framework
- **Vite**: Frontend build tool and development server
- **Node.js**: Runtime environment

### Authentication
- **Firebase**: Authentication service with Google OAuth
- **Firebase Auth**: User management and session handling

### Database & ORM
- **In-Memory Storage**: Development storage implementation
- **PostgreSQL**: Production database support (configured via Drizzle)
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Cloud PostgreSQL hosting (@neondatabase/serverless)

### AI Services
- **OpenAI API**: GPT-4o model for quiz question generation
- **OpenAI SDK**: Official OpenAI client library

### UI & Styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Icons**: Additional icons including Google logo

### File Processing
- **Multer**: File upload middleware
- **Mammoth**: Word document (.docx) parsing
- **pdf-parse-new**: PDF text extraction
- **PDFKit**: PDF generation library

### State Management & Data Fetching
- **TanStack React Query**: Server state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### Development Tools
- **TypeScript**: Type safety across the stack
- **Replit**: Development environment with live reload
- **ESBuild**: Fast JavaScript bundler for production builds

## Recent Changes (January 2025)

### Added Features
- **Customizable Question Count**: Users can now select 3-20 questions per quiz
- **Firebase Authentication**: Google OAuth sign-in for user management
- **Multiple Document Types**: Support for .pptx, .docx, and .pdf file uploads
- **Quiz Settings Component**: Interface for selecting question count before generation
- **Authentication-Protected Features**: Quiz library requires sign-in, but generation/download works without authentication
- **Enhanced User Experience**: Login modals, user avatars, and graceful authentication flows

### Technical Updates
- **Firebase Integration**: Complete Firebase Auth setup with Google provider
- **Multi-Format Document Processing**: Added Mammoth for DOCX parsing and pdf-parse-new for PDF extraction
- **Enhanced File Validation**: Updated MIME type validation for multiple document formats
- **Schema Updates**: Added question count validation and request schemas
- **Backend Enhancement**: API endpoints now accept and process question count parameter
- **UI Components**: New authentication components, quiz settings, and improved navigation
- **Context Management**: AuthProvider for managing Firebase authentication state
- **Document Parser Service**: Unified service for handling multiple document formats with format detection