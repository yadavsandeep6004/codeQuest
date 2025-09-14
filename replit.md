# CodeQuest - LeetCode-like Coding Platform

## Overview

CodeQuest is a full-stack web application designed as a coding practice platform similar to LeetCode. The platform supports two types of users (students and admins) and offers two main problem types: multiple-choice questions (MCQs) and coding challenges with an integrated code editor. Students can solve problems, view their submission history, and track their progress, while admins can manage the question database and monitor student performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Code Editor**: Monaco Editor integration for syntax highlighting and code editing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API structure with role-based access control
- **Middleware**: Custom authentication middleware for protected routes
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Design**: Structured with separate tables for users, questions, and submissions
- **Migrations**: Drizzle Kit for database schema management

### Key Features Implementation
- **User Roles**: Student and admin roles with different access levels
- **Problem Types**: Support for both MCQ and coding problems with different data structures
- **Code Execution**: Integration ready for external code execution services
- **Progress Tracking**: Comprehensive submission history and statistics
- **Admin Panel**: Full CRUD operations for question management

### Security Considerations
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based authorization middleware
- Input validation with Zod schemas
- Protected API endpoints

## External Dependencies

### Core Framework Dependencies
- **React 18** - Frontend framework with hooks and modern patterns
- **Express.js** - Backend web framework for Node.js
- **TypeScript** - Type safety across the entire stack
- **Vite** - Fast build tool and development server

### Database and ORM
- **Drizzle ORM** - Type-safe ORM for PostgreSQL operations
- **@neondatabase/serverless** - Serverless PostgreSQL client
- **PostgreSQL** - Primary database (configured for cloud deployment)

### UI and Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **Monaco Editor** - Code editor with syntax highlighting

### Authentication and Security
- **jsonwebtoken** - JWT token generation and verification
- **bcrypt** - Password hashing and comparison
- **Zod** - Schema validation library

### State Management and API
- **TanStack Query** - Server state management and caching
- **Wouter** - Lightweight client-side routing

### Development Tools
- **ESBuild** - Fast JavaScript bundler for production builds
- **TSX** - TypeScript execution for development
- **PostCSS** - CSS processing with Autoprefixer

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal** - Development error handling
- **@replit/vite-plugin-cartographer** - Development tooling
- **@replit/vite-plugin-dev-banner** - Development environment indicators