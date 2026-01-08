# Tuma Helper - Connect Africa

## Overview

**Tuma Helper** is a comprehensive service marketplace platform that connects customers with top-rated local service professionals across Africa, with a primary focus on Namibia. The platform streamlines the process of finding, booking, and managing home services, trades, and professional expertise.

## Mission

Building strong communities by connecting local service providers with customers who need their expertise, while ensuring quality, trust, and safety in every interaction.

## Core Purpose

Tuma Helper serves as a bridge between:
- **Customers** seeking reliable, verified local service professionals
- **Service Providers** looking to grow their business and reach more clients
- **Communities** building economic opportunities through local services

## Key Features

### For Customers

#### Service Discovery & Booking
- **AI-Powered Service Matching**: Intelligent matching system to find the right professional for specific needs
- **Advanced Search & Filters**: Search by service type, location, rating, availability, and more
- **Service Categories**: Organized categories including:
  - Interior Services (plumbing, electrical, painting, etc.)
  - Exterior Services (roofing, landscaping, etc.)
  - Lawn & Garden Services
  - Tutoring and Educational Services
  - And many more specialized services

#### Trust & Safety
- **Verified Providers**: All service providers undergo KYC (Know Your Customer) verification
- **Review System**: Enhanced review and rating system with detailed feedback
- **Secure Payments**: Integrated payment processing with transaction protection
- **Background Checks**: Comprehensive safety measures for peace of mind

#### User Experience
- **Personalized Dashboard**: Tailored experience based on user preferences and history
- **Booking Management**: Track all bookings, schedules, and service history
- **Message Center**: Direct communication with service providers
- **Favorites System**: Save and organize preferred service providers
- **Multi-language Support**: Localized experience for diverse users
- **Search History**: Smart suggestions based on previous searches

### For Service Providers

#### Business Management
- **Provider Dashboard**: Comprehensive dashboard for managing bookings, earnings, and performance
- **Profile Management**: Create and maintain detailed professional profiles
- **Availability Calendar**: Set and manage service availability
- **Earnings Tracking**: Real-time tracking of income and payments
- **Performance Analytics**: Insights into ratings, reviews, and business growth

#### Professional Development
- **Training Center**: Access to professional development modules
- **Skill Certification**: Build credentials through training completion
- **Provider Community**: Connect with other professionals, share knowledge
- **Resource Library**: Access to tools and resources for business growth

#### Customer Engagement
- **Review Management**: Respond to customer feedback
- **Messaging System**: Direct communication with clients
- **Booking Notifications**: Stay updated on new opportunities
- **Dispute Resolution**: Structured process for handling concerns

### For Business Accounts

#### Corporate Features
- **Corporate Account Manager**: Manage business accounts for large organizations
- **Franchise Management**: Tools for managing franchise operations
- **API Integration**: Programmatic access to platform features
- **Bulk Booking Management**: Handle multiple service requests efficiently

### Administrative Features

#### Platform Management
- **Admin Dashboard**: Comprehensive oversight of platform operations
- **Advanced Analytics**: Data-driven insights on platform performance
- **User Management**: Oversee customer and provider accounts
- **Service Quality Monitoring**: Ensure service standards are maintained
- **Dispute Management**: Handle conflicts and ensure fair resolutions

#### IoT Integration
- **Device Management**: IoT device integration for smart service coordination
- **Real-time Monitoring**: Track service delivery and quality

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **Styling**: 
  - Tailwind CSS 3.4.11
  - shadcn-ui component library
  - Custom design system with Radix UI primitives
- **State Management**: TanStack Query (React Query) 5.56.2
- **Routing**: React Router DOM 6.26.2
- **Forms**: React Hook Form 7.53.0 with Zod validation
- **UI Components**: Comprehensive set from Radix UI
  - Dialogs, Dropdowns, Popovers, Tooltips
  - Accordions, Tabs, Navigation menus
  - Form controls (Select, Checkbox, Radio, Slider)
  - Data display (Avatar, Progress, Scroll Area)

### Backend & Database
- **Backend as a Service**: Supabase 2.50.5
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with secure user management
- **Storage**: Supabase Storage for images and files
- **Real-time**: WebSocket support for live updates

### Additional Technologies
- **Payment Processing**: Stripe integration (@stripe/stripe-js ^7.4.0, @stripe/react-stripe-js ^3.7.0)
- **Charts & Visualization**: Recharts 2.12.7
- **Date Handling**: date-fns 3.6.0
- **Theming**: next-themes 0.3.0 for dark/light mode
- **Icons**: Lucide React 0.462.0
- **Notifications**: Sonner toast notifications
- **Carousels**: Embla Carousel React

### Testing & Quality Assurance
- **Unit Testing**: Vitest 3.2.4
- **Integration Testing**: Testing Library (React, Jest DOM, User Event)
- **E2E Testing**: Playwright 1.54.1
- **Linting**: ESLint 9.9.0 with TypeScript support
- **Security**: eslint-plugin-security for code security checks
- **Performance**: Lighthouse 12.7.1 for performance audits

### Development Tools
- **Type Checking**: TypeScript 5.5.3
- **Package Management**: npm/bun
- **Code Formatting**: ESLint with React Hooks and React Refresh plugins
- **Environment**: Node.js with modern ES modules

## Application Structure

### Pages & Routes

#### Public Pages
- **Landing Page** (`/`): Dynamic homepage with marketing content for visitors and personalized dashboard for logged-in users
- **How It Works** (`/how-it-works`): Platform explanation and user guide
- **About** (`/about`): Company information and values
- **Help** (`/help`): Support and FAQ
- **Safety** (`/safety`): Safety guidelines and policies
- **Contact** (`/contact`): Customer support contact
- **Blog** (`/blog`): Articles and updates
- **Press** (`/press`): Media resources
- **Careers** (`/careers`): Job opportunities

#### Service Pages
- **Services** (`/services`): Browse all available services
- **Service Detail** (`/services/:id`): Individual service information
- **Interior Services** (`/interior`): Interior-focused services
- **Exterior Services** (`/exterior`): Exterior-focused services
- **Lawn & Garden** (`/lawn-garden`): Landscaping and garden services

#### Customer Portal
- **Authentication** (`/auth`): Login and signup
- **Profile** (`/profile`): User profile management
- **Bookings** (`/bookings`): View all bookings
- **Booking Detail** (`/bookings/:id`): Individual booking information
- **Messages** (`/messages`): Communication center
- **Favorites** (`/favorites`): Saved service providers

#### Provider Portal
- **Become Provider** (`/become-provider`): Provider registration
- **KYC Verification** (`/kyc-verification`): Identity verification
- **Provider Login** (`/provider-login`): Provider authentication
- **Provider Dashboard** (`/provider/dashboard`): Main provider interface
- **Provider Profile** (`/provider/profile`): Provider profile management
- **Training Center** (`/provider/training`, `/training`): Professional development

#### Business & Enterprise
- **Corporate Dashboard** (`/corporate-dashboard`): Corporate account management
- **Franchise Dashboard** (`/franchise-dashboard`): Franchise operations
- **API Management** (`/api-management`): API integration tools

#### Administrative
- **Admin Dashboard** (`/admin/dashboard`): Platform administration
- **Advanced Analytics** (`/admin/analytics`): Business intelligence

#### Legal & Compliance
- **Terms of Service** (`/terms`): Terms and conditions
- **Privacy Policy** (`/privacy`): Privacy information
- **Provider Resources** (`/provider-resources`): Provider-specific resources

## Database Schema

The platform uses a comprehensive PostgreSQL database with the following key tables:

### User Management
- **profiles**: User profile information
- **provider_profiles**: Extended profiles for service providers

### Services
- **service_categories**: Service categorization
- **services**: Available service listings
- **service_images**: Service photos and media

### Bookings & Transactions
- **bookings**: Service booking records
- **booking_status_history**: Booking status tracking
- **provider_earnings**: Financial tracking

### Provider Features
- **provider_skills**: Provider expertise and certifications
- **provider_availability**: Schedule management
- **provider_reviews**: Customer feedback
- **provider_disputes**: Conflict resolution
- **provider_training_progress**: Training completion tracking
- **training_modules**: Educational content

### Customer Features
- **customer_favorites**: Saved providers
- **messages**: Communication records
- **search_history**: Search pattern tracking

### Additional Features
- **loyalty_rewards**: Customer loyalty program
- **iot_devices**: Smart device integration

## Security & Privacy

- **Authentication**: Secure user authentication with Supabase Auth
- **Authorization**: Role-based access control (Customer, Provider, Admin)
- **Data Protection**: Encrypted data storage and transmission
- **Payment Security**: PCI-compliant payment processing via Stripe
- **KYC Verification**: Identity verification for service providers
- **Code Security**: ESLint security plugin for vulnerability detection
- **HTTPS**: Secure communication protocol

## Localization & Accessibility

- **Multi-language Support**: Language context with translation capabilities
- **Responsive Design**: Mobile-first, works on all device sizes
- **Accessibility**: WCAG compliant UI components from Radix UI
- **Theme Support**: Light/dark mode with system preference detection

## Performance Optimizations

- **Code Splitting**: Vite's automatic code splitting
- **Lazy Loading**: React Router lazy loading for routes
- **Image Optimization**: Optimized image loading
- **Caching**: React Query for efficient data caching
- **Database Indexing**: Optimized database queries
- **CDN**: Static asset delivery via CDN

## Development Workflow

### Getting Started
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

### Testing
```bash
# Run unit tests
npm run test

# Run E2E tests
npx playwright test

# Generate test coverage
npm run test:coverage
```

## Deployment

The application is designed for deployment on:
- **Lovable Platform**: Primary deployment platform
- **Custom Domain Support**: Available through project settings
- **Environment Variables**: Managed through Supabase and deployment platform

## Future Enhancements

Based on the codebase structure, planned features include:
- Enhanced AI matching algorithms
- IoT device integration expansion
- Mobile application development
- Additional payment methods
- Expanded franchise management tools
- Advanced analytics and reporting
- API marketplace for third-party integrations

## Support & Documentation

- **User Guide**: Available in Help section
- **API Documentation**: For enterprise integrations
- **Provider Resources**: Training and business tools
- **Community Forum**: Provider community features
- **24/7 Support**: Customer support availability

## Project Statistics

These statistics are displayed on the platform's About page as target metrics:
- **1,000+** Active Service Providers (target)
- **5,000+** Happy Customers (target)
- **4.8** Average Platform Rating (target)
- **24/7** Support Available

## Contributing

This is a Lovable-managed project. Changes can be made through:
1. Lovable platform interface
2. Local IDE with git push
3. GitHub web interface
4. GitHub Codespaces

## License

All rights reserved. Proprietary software.

## Contact

For more information, visit the platform or contact through the website's contact page.

---

*Built with ❤️ for connecting communities across Africa*
