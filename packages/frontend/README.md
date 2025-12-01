# Frontend - Product Catalog

A modern React frontend for the Product Catalog application built with Chakra UI v3, TypeScript, and Vite.

## Features

- **Authentication**: Login and registration with JWT
- **Product Management**: Full CRUD operations for products
- **Category Management**: Organize products by categories
- **Inventory Tracking**: Update stock levels and monitor low-stock items
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Chakra UI v3 components
- **Type Safety**: Full TypeScript integration
- **State Management**: Zustand for authentication, React Query for server state

## Tech Stack

- **React 18+** - UI library
- **TypeScript** - Type safety
- **Chakra UI v3.30.0** - Modern component library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling
- **Vitest** - Testing framework

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:3000/dev
```

### Development

```bash
# Run dev server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Testing
pnpm test

# Build for production
pnpm build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── categories/     # Category management
│   ├── inventory/      # Inventory components
│   ├── layout/         # Layout components
│   ├── products/       # Product components
│   └── ui/             # Base UI components
├── pages/              # Route components
├── services/           # API clients
├── stores/             # State management
└── test/               # Test utilities
```

## Key Features

### Authentication
- JWT-based authentication
- Persistent login state
- Protected routes
- Auto-redirect on auth state changes

### Product Management
- Create, read, update, delete products
- Search and filter by category
- Image URL support
- Price and stock tracking

### Inventory Management
- Stock level monitoring
- Low stock alerts (< 10 units)
- Stock update with reasons
- Add/subtract/set operations

### Category Management
- Create and manage product categories
- Associate products with categories
- Category-based filtering

## Code Quality

The codebase follows these principles:

- **Functional Programming**: Prefer functions over classes
- **Immutability**: Use const, avoid mutations
- **Single Responsibility**: One purpose per function/component
- **DRY**: Don't repeat yourself
- **Type Safety**: Full TypeScript coverage

## Performance Optimizations

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Query Caching**: React Query for efficient data fetching
- **Bundle Optimization**: Vite for fast builds

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage
```

## Deployment

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## API Integration

The frontend integrates with the backend API through:

- **Authentication endpoints**: `/auth/login`, `/auth/register`
- **Product endpoints**: `/products` CRUD operations
- **Category endpoints**: `/categories` CRUD operations  
- **Inventory endpoints**: `/inventory/update`, `/inventory/low-stock`

All API calls include proper error handling and loading states.
