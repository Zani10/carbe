# 🚗 Carbe - Premium Car Sharing Platform

<div align="center">
  carbe
  
  **A modern, professional car-sharing platform built for the next generation**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?style=for-the-badge&logo=stripe)](https://stripe.com/)
</div>

---

## 🌟 Overview

Carbe is a premium car-sharing platform that connects car owners with renters, similar to Airbnb but for vehicles. Built with modern web technologies, it offers a seamless experience for both hosts and renters with features like AI-powered search, real-time chat, smart booking system, and comprehensive fleet management.

### ✨ Key Features

- 🔍 **AI-Powered Smart Search** - Natural language car search with OpenAI integration
- 📱 **Mobile-First Design** - Responsive design with desktop enhancements
- 💳 **Secure Payments** - Stripe integration with auth-and-capture flow
- 🗓️ **Advanced Calendar** - Host calendar management with availability controls
- 💬 **Real-time Chat** - Built-in messaging system between hosts and renters
- 🔐 **Smart Authentication** - Supabase Auth with role-based access control
- 📊 **Analytics Dashboard** - Comprehensive insights for hosts
- 🎨 **Premium UI/UX** - Dark theme with glassmorphism design elements
- 📍 **Interactive Maps** - Location-based car discovery
- ⭐ **Review System** - Rating and review functionality
- 🔔 **Real-time Notifications** - Push notifications for bookings and messages

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Headless UI
- **Animations**: Framer Motion
- **State Management**: React Hooks + Context API
- **Maps**: Interactive mapping integration
- **Icons**: Lucide React

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Row Level Security**: Comprehensive RLS policies

### External Services
- **Payments**: Stripe (with webhooks)
- **AI Search**: OpenAI GPT-4
- **Email**: Supabase Auth emails
- **Analytics**: Custom analytics system

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Git Hooks**: Husky (optional)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- OpenAI API key (for AI search)

### 1. Clone and Install

```bash
git clone https://github.com/Zani10/carbe.git
cd carbe
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# OpenAI Configuration (for AI search)
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL migrations found in the project root:
   ```bash
   # Run these SQL files in your Supabase SQL editor in order:
   # 1. complete_database_update.sql
   # 2. sql_updates.sql
   # 3. proper_rls_policies.sql
   ```

### 4. Stripe Setup

1. Install Stripe CLI
2. Login to Stripe CLI: `stripe login`
3. Set up webhook forwarding (keep this running during development):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### 5. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Navbar, Toaster
│   ├── page.tsx                 # Homepage
│   ├── explore/                 # Car discovery & filtering
│   ├── car/[id]/               # Car detail pages
│   ├── my-bookings/            # User booking management
│   ├── chat/                   # Real-time messaging
│   ├── profile/                # User profiles
│   ├── host/                   # Host-specific pages
│   │   ├── home/              # Host dashboard
│   │   ├── garage/            # Fleet management
│   │   ├── calendar/          # Availability management
│   │   └── earnings/          # Financial analytics
│   ├── ai/                    # AI-powered search
│   └── api/                   # API routes
│       ├── auth/              # Authentication endpoints
│       ├── bookings/          # Booking management
│       ├── cars/              # Car CRUD operations
│       ├── chat/              # Chat functionality
│       ├── host/              # Host-specific APIs
│       └── webhooks/          # External service webhooks
│
├── components/                  # Reusable UI components
│   ├── layout/                 # Navigation, Footer
│   ├── car/                   # Car-related components
│   ├── booking/               # Booking flow components
│   ├── chat/                  # Chat interface
│   ├── host/                  # Host dashboard components
│   ├── ai/                    # AI search components
│   └── ui/                    # Base UI components
│
├── lib/                        # Business logic & utilities
│   ├── supabase.ts           # Supabase client configuration
│   ├── auth.ts               # Authentication helpers
│   ├── stripe.ts             # Payment processing
│   ├── booking/              # Booking business logic
│   ├── ai/                   # AI search functionality
│   └── utils/                # General utilities
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts            # Authentication state
│   ├── useBooking.ts         # Booking operations
│   ├── useChat.ts            # Chat functionality
│   └── useSmartSearch.ts     # AI search integration
│
├── types/                      # TypeScript type definitions
│   ├── car.ts                # Car-related types
│   ├── booking.ts            # Booking types
│   ├── user.ts               # User types
│   └── index.ts              # Exported types
│
└── constants/                  # Application constants
    ├── roles.ts              # User roles
    ├── carTypes.ts           # Vehicle categories
    └── pricing.ts            # Pricing rules
```

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Stripe Development

```bash
# Forward webhooks to local development (run in separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test webhook delivery
stripe trigger payment_intent.succeeded

# View Stripe dashboard
stripe dashboard
```

---

## 🎨 Design System

### Colors
- **Primary Red**: `#FF4646` - Brand color for CTAs and accents
- **Background**: `#212121` - Main background
- **Card Background**: `#292929` - Card and component backgrounds
- **Text**: White and gray variations for dark theme

### Typography
- Clean, modern fonts optimized for readability
- Consistent spacing and hierarchy
- Mobile-first responsive typography

### Components
- Glassmorphism design elements
- Smooth animations and transitions
- Accessible contrast ratios
- Touch-friendly mobile interfaces

---

## 🔐 Authentication & Authorization

### User Roles
- **Guest**: Unauthenticated users (browse only)
- **Renter**: Can book cars and chat with hosts
- **Host**: Can list cars and manage bookings
- **Admin**: Full platform access

### Security Features
- Supabase Row Level Security (RLS) policies
- JWT-based authentication
- Role-based access control
- Secure API endpoints with middleware

---

## 💳 Payment Flow

### Booking Process
1. **Instant Booking**: Immediate payment processing
2. **Host Approval**: Auth-and-capture flow
   - Payment authorized but not captured
   - 24-hour approval window
   - Automatic capture on approval
   - Authorization release on rejection

### Supported Features
- Secure payment processing
- Refund handling
- Cancellation policies
- Service fee calculation
- Multi-currency support (planned)

---

## 🔄 Real-time Features

### Chat System
- Real-time messaging between hosts and renters
- Message status indicators
- File sharing capabilities
- Push notifications

### Live Updates
- Booking status changes
- Calendar availability
- Notification delivery
- Price updates

---

## 🚀 Deployment

### Environment Setup
1. Set up production environment variables
2. Configure Supabase production instance
3. Set up Stripe production webhooks
4. Configure domain and DNS

### Recommended Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **AWS Amplify**

### Deployment Steps
```bash
# Build the application
npm run build

# Deploy to your chosen platform
# Follow platform-specific deployment guides
```

---

## 📊 Monitoring & Analytics

### Built-in Analytics
- Booking conversion rates
- Revenue tracking
- User engagement metrics
- Host performance insights

### Monitoring Tools
- Error tracking and logging
- Performance monitoring
- Database query optimization
- API response times

---

## 🧪 Testing

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Payment flow testing with Stripe test mode

### Test Commands
```bash
# Run unit tests (when implemented)
npm run test

# Run E2E tests (when implemented)
npm run test:e2e

# Test Stripe webhooks
stripe fixtures trigger payment_intent.succeeded
```

---

## 🔧 Troubleshooting

### Common Issues

**Authentication Issues**
- Verify Supabase environment variables
- Check RLS policies in Supabase dashboard
- Ensure proper session handling

**Payment Issues**
- Confirm Stripe webhook endpoints
- Verify webhook signatures
- Check Stripe dashboard for failed payments

**Build Issues**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

---

## 🤝 Contributing

We welcome contributions to Carbe! Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit with descriptive messages
6. Push to your fork and submit a pull request

### Coding Standards
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain component modularity
- Write clear, self-documenting code
- Follow the established project structure

### Pull Request Process
1. Ensure all tests pass
2. Update documentation as needed
3. Add screenshots for UI changes
4. Request review from maintainers

---

## 📝 API Documentation

### Authentication
All protected endpoints require a valid Supabase JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints
- `GET /api/cars` - List available cars
- `POST /api/bookings` - Create new booking
- `GET /api/host/vehicles` - Host's car listings
- `POST /api/chat/messages` - Send chat message
- `POST /api/webhooks/stripe` - Stripe webhook handler

---

## 🔮 Roadmap

### Short Term
- [ ] Mobile app development
- [ ] Advanced search filters
- [ ] Multi-language support
- [ ] Push notifications

### Medium Term
- [ ] Insurance integration
- [ ] Advanced analytics dashboard
- [ ] Fleet management tools
- [ ] API rate limiting

### Long Term
- [ ] International expansion
- [ ] Electric vehicle focus
- [ ] Carbon footprint tracking
- [ ] Partnership integrations

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<div align="center">
  <p>Built with ❤️</p>
  <p>© 2025 Carbe. All rights reserved.</p>
</div> 
