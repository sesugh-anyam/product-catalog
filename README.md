# Product Catalog - Fullstack Application

> A modern, serverless product catalog system with inventory tracking, authentication, and email verification. Built with React 18, TypeScript, AWS Lambda, and MongoDB.

## 🚀 Live Demo

- **Frontend:** [Coming Soon - AWS S3/CloudFront]
- **API:** [Coming Soon - AWS Lambda/API Gateway]

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Running Locally](#-running-locally)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Troubleshooting](#-troubleshooting)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js 20+** - [Download](https://nodejs.org/)
  ```bash
  node --version  # Should be v20.x or higher
  ```
- **pnpm 8+** - Install globally
  ```bash
  npm install -g pnpm
  pnpm --version  # Should be 8.x or higher
  ```
- **Git** - [Download](https://git-scm.com/)

### Required Services
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas)
  - Create a free cluster
  - Whitelist your IP address
  - Create a database user
- **SMTP Email Service** (for OTP/password reset)
  - Gmail, Outlook, SendGrid, or any SMTP provider
  - [See SMTP setup guide](#email-configuration)

### For Deployment (Optional)
- **AWS Account** - [Sign up](https://aws.amazon.com/)
- **AWS CLI** - [Install](https://aws.amazon.com/cli/)
  ```bash
  aws --version
  aws configure  # Set up credentials
  ```
- **Serverless Framework** (optional) - For backend deployment
  ```bash
  npm install -g serverless
  ```

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite** - Build tool and dev server
- **Chakra UI v3** - Component library
- **TanStack Query v5** - Server state management
- **Zustand v4** - Client state management
- **React Router v6** - Routing
- **React Hook Form** - Form validation

### Backend
- **AWS Lambda** - Serverless compute
- **API Gateway** - REST API
- **Node.js 20.x** - Runtime
- **TypeScript 5.9.3** - Type safety
- **Serverless Framework v3** - Deployment tool
- **Mongoose 8.x** - MongoDB ODM
- **JWT** - Authentication
- **Nodemailer 7.x** - Email service

### Database & Storage
- **MongoDB Atlas** - Primary database
- **AWS S3** - Image storage (optional)

### Development & Testing
- **Jest 29.7** - Testing framework
- **ESLint 9.x** - Code linting
- **Prettier** - Code formatting
- **pnpm Workspaces** - Monorepo management

---

## 📦 Project Structure

```
product-catalog/
├── packages/
│   ├── frontend/              # React application
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # API client
│   │   │   ├── stores/        # Zustand stores
│   │   │   └── test/          # Test utilities
│   │   ├── .env               # Frontend environment variables
│   │   └── package.json
│   │
│   ├── backend/               # Serverless API
│   │   ├── src/
│   │   │   ├── handlers/      # Lambda handlers
│   │   │   ├── models/        # Mongoose models
│   │   │   ├── utils/         # Utility functions
│   │   │   └── config/        # Configuration
│   │   ├── .env               # Backend environment variables
│   │   ├── serverless.yml     # Serverless config
│   │   └── package.json
│   │
│   └── shared/                # Shared code
│       ├── src/
│       │   ├── types.ts       # Shared TypeScript types
│       │   ├── constants.ts   # Shared constants
│       │   └── utils.ts       # Shared utilities
│       └── package.json
│
├── .github/
│   └── copilot-instructions.md  # AI coding guidelines
├── pnpm-workspace.yaml          # Monorepo configuration
├── package.json                 # Root package.json
├── tsconfig.json                # Root TypeScript config
└── README.md                    # This file
```

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/sesugh-anyam/product-catalog
cd Wrk
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for all packages in the monorepo.

### 3. Environment Configuration

#### 📁 Where to Place `.env` Files

You need to create **TWO** `.env` files:

1. **Backend:** `packages/backend/.env`
2. **Frontend:** `packages/frontend/.env`

#### Backend Environment (`packages/backend/.env`)

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/product-catalog?retryWrites=true&w=majority

# JWT Secret (use a strong random string, min 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Environment
NODE_ENV=development

# SMTP Configuration (for OTP emails and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=Product Catalog <your-email@gmail.com>

# AWS S3 (Optional - for product images)
S3_REGION=us-east-1
S3_S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

#### Frontend Environment (`packages/frontend/.env`)

```env
# API URL (local development)
VITE_API_URL=http://localhost:3000/dev

# For production, change to your deployed API URL:
# VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
```

#### 📧 Email Configuration

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in `SMTP_PASS`

**For Other Providers:**
- **Outlook/Hotmail:** `smtp-mail.outlook.com` (Port 587)
- **SendGrid:** `smtp.sendgrid.net` (Port 587) - API key as password
- **AWS SES:** Region-specific SMTP endpoint

See example files:
- `packages/backend/.env.example`
- `packages/frontend/.env.example`

#### 🗄️ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster (M0 Sandbox)
3. Create a database user:
   - Database Access → Add New Database User
   - Set username and password
4. Whitelist your IP:
   - Network Access → Add IP Address
   - Add Current IP Address or `0.0.0.0/0` (for development)
5. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace database name with `product-catalog`

### 4. Build Shared Package

The shared package must be built first (it's used by both frontend and backend):

```bash
cd packages/shared
pnpm run build
cd ../..
```

---

## 💻 Running Locally

### Option 1: Run All Services (Recommended)

From the **root directory**:

```bash
pnpm run dev
```

This starts:
- ✅ **Frontend** → http://localhost:5173
- ✅ **Backend** → http://localhost:3000
- ✅ **Shared** → Watch mode (auto-rebuilds on changes)

### Option 2: Run Services Separately

**Terminal 1 - Backend:**
```bash
cd packages/backend
pnpm run dev
```

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
pnpm run dev
```

**Terminal 3 - Shared (optional watch mode):**
```bash
cd packages/shared
pnpm run dev
```

### 🌐 Access the Application

1. Open browser: **http://localhost:5173**
2. Register a new account
3. Check email for OTP verification code
4. Verify account and start using the app!

### 🛑 Stopping Services

Press `Ctrl+C` in each terminal window.

---

## 🧪 Testing

### Run All Tests

```bash
# From root directory
pnpm test
```

### Run Backend Tests Only

```bash
cd packages/backend
pnpm test
```

**Test Coverage:**
- ✅ 4 test suites, 53 tests
- ✅ Authentication utilities
- ✅ Rate limiting
- ✅ Handler utilities
- ✅ Email generation

### Type Checking

```bash
# Check all packages
pnpm run type-check

# Check specific package
cd packages/frontend
pnpm run type-check
```

### Linting

```bash
# Lint all packages
pnpm run lint

# Auto-fix issues
pnpm run lint -- --fix
```

### Build for Production

```bash
# Build all packages
pnpm run build
```

---

## 🚢 Deployment

### Backend Deployment (AWS Lambda)

1. **Configure AWS CLI:**
   ```bash
   aws configure
   # Enter: Access Key ID, Secret Access Key, Region (e.g., us-east-1)
   ```

2. **Update Backend Environment Variables:**
   
   Edit `packages/backend/serverless.yml` to add production environment variables, or use AWS Systems Manager Parameter Store.

3. **Deploy Backend:**
   ```bash
   cd packages/backend
   pnpm run deploy
   # or
   serverless deploy --stage prod
   ```

4. **Note the API Gateway URL** from deployment output.

### Frontend Deployment (AWS S3 + CloudFront)

1. **Update Frontend Environment:**
   
   Create `packages/frontend/.env.production`:
   ```env
   VITE_API_URL=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod
   ```

2. **Build Frontend:**
   ```bash
   cd packages/frontend
   pnpm run build
   ```

3. **Deploy to S3:**
   ```bash
   # Create S3 bucket (one-time)
   aws s3 mb s3://your-product-catalog-frontend

   # Upload build files
   aws s3 sync dist/ s3://your-product-catalog-frontend --delete

   # Make bucket public (if not using CloudFront)
   aws s3 website s3://your-product-catalog-frontend --index-document index.html --error-document index.html
   ```

4. **Optional: Set up CloudFront** for HTTPS and better performance.

### Environment Variables for Production

**Backend (AWS Lambda Environment Variables):**
- Set in `serverless.yml` or AWS Console
- Never commit secrets to git
- Use AWS Systems Manager Parameter Store for sensitive data

**Frontend:**
- Build-time variables only (starts with `VITE_`)
- Embedded in built JavaScript files
- Don't put secrets in frontend `.env`

---

## ✨ Features

### Core Features (Implemented)
- ✅ **User Authentication**
  - Email/password registration with JWT
  - Email OTP verification (6-digit code, 10-min expiry)
  - Login with token-based sessions
  - Logout functionality
  - Protected routes

- ✅ **Password Reset**
  - Forgot password flow
  - Email with secure reset link
  - Token-based reset (1-hour expiry)
  - Rate limiting on sensitive endpoints

- ✅ **Product Management**
  - Create, Read, Update, Delete products
  - Fields: name, description, price, stock, category, image
  - Search products by name
  - Filter by category
  - Pagination

- ✅ **Category Management**
  - Create, Read, Update, Delete categories
  - Associate products with categories
  - List products by category

- ✅ **Inventory Tracking**
  - Real-time stock updates
  - Stock history tracking
  - Low stock alerts (<10 units)
  - Update stock levels

- ✅ **Product Images**
  - S3 pre-signed URL upload
  - Image URL support
  - Image removal
  - Validation (image types, size limits)

### Security Features
- ✅ Rate limiting (IP-based)
  - 20 requests per 15 min (registration)
  - 20 requests per 5 min (OTP resend)
  - 20 requests per 15 min (password reset)
- ✅ JWT token validation
- ✅ Input sanitization
- ✅ CORS configuration
- ✅ Environment variable protection

### UI/UX Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading states and skeletons
- ✅ Error handling with toast notifications
- ✅ Confirmation dialogs for destructive actions
- ✅ Form validation with real-time feedback
- ✅ Dark mode support (Chakra UI)
- ✅ Context-aware empty states

---

## 🏗️ Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────┐
│           React Application             │
├─────────────────────────────────────────┤
│  Pages (Login, Register, Dashboard,     │
│         Products, Categories, Inventory) │
├─────────────────────────────────────────┤
│  Components (Modals, Tables, Forms)     │
├─────────────────────────────────────────┤
│  State Management                        │
│  ├─ Zustand (auth, global state)        │
│  └─ TanStack Query (server state)       │
├─────────────────────────────────────────┤
│  API Client (axios)                      │
└─────────────────────────────────────────┘
           │
           ▼
    [API Gateway + Lambda]
```

**State Management:**
- **Zustand** - Global client state (auth, user data) with localStorage persistence
- **TanStack Query** - Server state, caching, mutations, auto-refetch

### Backend Architecture

```
┌─────────────────────────────────────────┐
│         API Gateway (AWS)               │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      AWS Lambda Functions               │
├─────────────────────────────────────────┤
│  Handlers:                               │
│  ├─ auth.ts (register, login, OTP)      │
│  ├─ products.ts (CRUD)                   │
│  ├─ categories.ts (CRUD)                 │
│  └─ inventory.ts (stock updates)         │
├─────────────────────────────────────────┤
│  Middleware:                             │
│  ├─ JWT verification                     │
│  ├─ Rate limiting                        │
│  └─ Error handling                       │
├─────────────────────────────────────────┤
│  Utils:                                  │
│  ├─ auth.ts (token generation)           │
│  ├─ email.ts (OTP, password reset)       │
│  ├─ rateLimit.ts (IP-based limiting)     │
│  └─ handler.ts (response helpers)        │
└────────────┬────────────────────────────┘
             │
             ▼
      ┌──────────────┐
      │   MongoDB    │
      │    Atlas     │
      └──────────────┘
```

**Serverless Pattern:**
- Each handler is an independent Lambda function
- Cold start optimizations
- Shared code through layers
- Environment-based configuration

### Database Schema

**User:**
```typescript
{
  email: string (unique, indexed)
  password: string (hashed)
  isVerified: boolean
  otp?: string
  otpExpiry?: Date
  resetToken?: string
  resetTokenExpiry?: Date
  createdAt: Date
}
```

**Product:**
```typescript
{
  name: string (indexed)
  description: string
  price: number
  stock: number
  category: ObjectId (ref: Category)
  imageUrl?: string
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

**Category:**
```typescript
{
  name: string (unique, indexed)
  description?: string
  createdAt: Date
  updatedAt: Date
}
```

**StockHistory:**
```typescript
{
  product: ObjectId (ref: Product)
  previousStock: number
  newStock: number
  change: number
  reason: string
  updatedBy: ObjectId (ref: User)
  updatedAt: Date
}
```

### Key Design Decisions

1. **Monorepo with pnpm Workspaces**
   - Share types between frontend/backend
   - Single `node_modules` for efficiency
   - Unified scripts and tooling

2. **Serverless Architecture**
   - Cost-effective (pay per use)
   - Auto-scaling
   - Zero server maintenance
   - Easy deployment

3. **TypeScript Everywhere**
   - Type safety across stack
   - Better IDE support
   - Fewer runtime errors
   - Self-documenting code

4. **Functional Programming**
   - Pure functions where possible
   - Immutable data structures
   - Minimal side effects
   - Easier to test

5. **MongoDB with Mongoose**
   - Flexible schema
   - Rich query API
   - Built-in validation
   - Easy to scale

---

## 🐛 Troubleshooting

### Common Issues

#### `pnpm install` fails

**Symptoms:**
```
ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY
```

**Solutions:**
1. Ensure Node.js 20+: `node --version`
2. Ensure pnpm 8+: `pnpm --version`
3. Delete lockfile and try again:
   ```bash
   rm pnpm-lock.yaml
   pnpm install
   ```
4. Clear pnpm cache:
   ```bash
   pnpm store prune
   pnpm install
   ```

---

#### Cannot connect to MongoDB

**Symptoms:**
```
MongooseServerSelectionError: Could not connect to any servers
```

**Solutions:**
1. **Check connection string** in `packages/backend/.env`
   - Ensure password is correct
   - Ensure database name is `product-catalog`
2. **Whitelist IP address** in MongoDB Atlas:
   - Network Access → Add IP Address → `0.0.0.0/0` (for development)
3. **Check database user** permissions:
   - Database Access → Edit user → Ensure "Read and write to any database"
4. **Test connection:**
   ```bash
   cd packages/backend
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(console.error)"
   ```

---

#### Backend returns CORS errors

**Symptoms:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solutions:**
1. **Ensure backend is running** on port 3000
2. **Check `VITE_API_URL`** in `packages/frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3000/dev
   ```
3. **Restart frontend** after changing `.env`:
   ```bash
   cd packages/frontend
   pnpm run dev
   ```
4. **Check `serverless.yml`** has CORS enabled (already configured)

---

#### Frontend can't reach backend API

**Symptoms:**
```
Network Error
```

**Solutions:**
1. **Ensure backend is running:**
   ```bash
   cd packages/backend
   pnpm run dev
   ```
2. **Check API URL** is correct in frontend
3. **Test backend directly:**
   ```bash
   curl http://localhost:3000/dev/health
   ```

---

#### Email OTP/Reset not sending

**Symptoms:**
- No email received after registration
- No password reset email

**Solutions:**
1. **Check SMTP credentials** in `packages/backend/.env`
2. **For Gmail:**
   - Enable 2FA
   - Generate App Password
   - Use app password in `SMTP_PASS`
3. **Check spam folder**
4. **Test SMTP connection:**
   ```bash
   cd packages/backend
   # Add console.log in email.ts to debug
   ```
5. **Check rate limiting** - wait 5-15 minutes between attempts

---

#### Build fails with TypeScript errors

**Symptoms:**
```
error TS2307: Cannot find module '@product-catalog/shared'
```

**Solutions:**
1. **Build shared package first:**
   ```bash
   cd packages/shared
   pnpm run build
   ```
2. **Clean and rebuild:**
   ```bash
   pnpm run clean  # If available
   pnpm install
   pnpm run build
   ```

---

#### AWS deployment fails

**Symptoms:**
```
Error: Missing credentials in config
```

**Solutions:**
1. **Configure AWS CLI:**
   ```bash
   aws configure
   ```
2. **Check credentials:**
   ```bash
   aws sts get-caller-identity
   ```
3. **Ensure IAM permissions** for Lambda, API Gateway, S3
4. **Check Serverless Framework version:**
   ```bash
   serverless --version
   ```

---

#### Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
1. **Kill process on port:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```
2. **Change port** in `serverless.yml`:
   ```yaml
   custom:
     serverless-offline:
       httpPort: 3001
   ```

---

#### Lambda ImportModuleError with MongoDB/Mongoose

**Symptoms:**
```
Runtime.ImportModuleError: Error: Cannot find module 'mongodb/lib/bulk/common'
```

**Cause:**
The Serverless Framework's TypeScript plugin doesn't properly bundle all MongoDB driver dependencies for Lambda deployment.

**Solutions:**
1. **Use serverless-esbuild plugin** (already configured):
   ```bash
   cd packages/backend
   pnpm install
   ```

2. **Redeploy with proper bundling:**
   ```bash
   cd packages/backend
   pnpm run deploy
   ```

3. **If issue persists, verify package.json** has:
   ```json
   {
     "devDependencies": {
       "serverless-esbuild": "^1.52.1"
     }
   }
   ```

4. **Verify serverless.yml** has esbuild configuration:
   ```yaml
   plugins:
     - serverless-esbuild
   
   custom:
     esbuild:
       bundle: true
       minify: false
   ```

---

#### Shared types not updating

**Symptoms:**
- Frontend shows old type definitions
- TypeScript errors after changing shared types

**Solutions:**
1. **Rebuild shared package:**
   ```bash
   cd packages/shared
   pnpm run build
   ```
2. **Run shared in watch mode:**
   ```bash
   cd packages/shared
   pnpm run dev  # Auto-rebuilds on changes
   ```
3. **Restart TypeScript server** in VS Code:
   - `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

### Getting Help

If you encounter issues not covered here:

1. **Check logs:**
   - Frontend: Browser console (F12)
   - Backend: Terminal output
2. **Enable debug mode:**
   ```env
   NODE_ENV=development
   DEBUG=*
   ```
3. **Search GitHub issues**
4. **Open a new issue** with:
   - Error message
   - Steps to reproduce
   - Environment info (Node version, OS)

---

## 📚 Additional Documentation

- **[SMTP Setup Guide](./SMTP_SETUP.md)** - Detailed instructions for configuring email providers (Gmail, Outlook, SendGrid, AWS SES, etc.) for OTP and password reset emails
- **[Backend Test Coverage](./BACKEND_TESTS.md)** - Comprehensive test suite documentation (53 tests across 4 test suites)
- **[Rate Limiting](./RATE_LIMITING.md)** - IP-based rate limiting implementation and configuration
- **[GitHub Copilot Instructions](./.github/copilot-instructions.md)** - AI-assisted development guidelines and coding standards

---

## 📄 License

MIT License - feel free to use this project for learning or production.

---

## 👤 Author

Built as part of a fullstack development assessment.

---

## 🔗 Links

- **GitHub Repository:** https://github.com/sesugh-anyam/product-catalog
- **Live Demo:** https://catalog.beau.com.ng
- **API Documentation:** https://github.com/sesugh-anyam/product-catalog/blob/master/README.md

---

## 🎯 Project Goals

This project demonstrates:

- ✅ Modern fullstack development practices
- ✅ Serverless architecture on AWS
- ✅ TypeScript type safety
- ✅ React best practices
- ✅ Authentication & authorization
- ✅ Database design & modeling
- ✅ API design & documentation
- ✅ Testing & code quality
- ✅ Deployment automation
- ✅ Security best practices

**Built with ❤️ using React, TypeScript, AWS Lambda, and MongoDB**
