# ChainfrenTV App Analysis & Redesign Plan

## Background and Motivation

The user wants to redesign the ChainfrenTV application. This is a Next.js-based live streaming platform that integrates with Livepeer for video streaming, Privy for authentication, and includes monetization features. The app allows creators to create livestreams, upload video assets, and monetize their content through various payment models.

**NEW REQUIREMENT**: The user wants to create a shareable creator profile page that displays creator details, streams, and assets. This page will be generated from the settings page and follow a similar pattern to the existing view/[playbackId] route.

**LATEST REQUIREMENT**: The user wants to create a public landing page accessible before authentication with a hero component introducing the product and a section displaying all available streams. Additionally, an AuthGuard component should be created to protect routes that require authentication.

## Current App Architecture Analysis

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: Redux Toolkit with RTK Query patterns
- **Authentication**: Privy (Web3 wallet + social login)
- **Video Streaming**: Livepeer Studio API
- **Payment Processing**: OnchainKit (Coinbase)
- **UI Components**: Radix UI + custom components
- **File Upload**: TUS protocol for video uploads

### Core Features Identified

#### 1. Stream Management
- **Creation**: Users can create livestreams with customization options
- **Broadcasting**: Live streaming with Livepeer integration
- **Recording**: Optional stream recording
- **Customization**: Background colors, text colors, font sizes, logos
- **Monetization**: Free, one-time payment, or monthly subscription models

#### 2. Video Asset Management
- **Upload**: Video file uploads using TUS protocol
- **Storage**: Assets stored via Livepeer
- **Playback**: Video player with controls
- **Organization**: User-specific asset filtering

#### 3. Monetization System
- **Payment Models**: Free, one-time, monthly subscription
- **Donation Presets**: Customizable donation amounts
- **Product Store**: Merchandise/products for sale
- **Access Control**: Stream gating based on payment status

#### 4. User Experience
- **Dashboard**: Overview of streams and assets
- **Analytics**: Viewer metrics and performance data
- **Chat**: Real-time chat during streams
- **Mobile Responsive**: Mobile sidebar and responsive design

#### 5. NEW: Creator Profile Pages
- **Shareable URLs**: Public profile pages for creators
- **Creator Details**: Display creator information and bio
- **Content Showcase**: Streams and video assets
- **Link Generation**: Settings page integration for profile URL creation

### State Management Architecture

#### Redux Store Structure
```typescript
{
  streams: {
    streams: Stream[],
    loading: boolean,
    success: boolean,
    error: string | null,
    stream: Stream | null
  },
  assets: {
    assets: Asset[],
    loading: boolean,
    error: string | null,
    success: boolean
  }
}
```

#### Key API Endpoints
- **Livepeer Studio**: `/stream`, `/asset`, `/data/views`
- **Custom Backend**: `https://chaintv.onrender.com/api/`
  - `/streams/addstream` - Stream metadata
  - `/videos/addvideo` - Video metadata
  - `/streams/getstream` - Stream details
  - `/{creatorId}/products` - Creator products
  - **NEW**: `/creators/{creatorId}/profile` - Creator profile data

### User Flow Analysis

#### 1. Authentication Flow
1. User connects via Privy (wallet or social login)
2. Embedded wallet created automatically
3. User redirected to dashboard if authenticated

#### 2. Stream Creation Flow
1. User clicks "Create new stream channel"
2. Form with customization options (name, colors, logo, etc.)
3. Stream created via Livepeer API
4. Metadata sent to custom backend
5. User redirected to broadcast page

#### 3. Broadcasting Flow
1. User accesses stream page with stream ID
2. Livepeer broadcast component loads
3. Real-time viewer metrics displayed
4. Chat functionality available
5. Stream customization applied

#### 4. Viewer Experience Flow
1. Viewer accesses stream URL
2. Payment gate check (if not free)
3. Stream player loads with customization
4. Sidebar shows creator's other videos
5. Chat and interaction features

#### 5. NEW: Creator Profile Flow
1. Creator goes to `/dashboard/settings`
2. Creator generates/customizes their profile page
3. Creator gets shareable URL (e.g., `/creator/{creatorId}`)
4. Viewers access profile page to see creator's content
5. Profile page displays streams, assets, and creator details

### Key Challenges and Analysis

#### 1. Architecture Issues
- **Dual API System**: Livepeer + custom backend creates complexity
- **State Synchronization**: Multiple sources of truth for stream data
- **Error Handling**: Inconsistent error handling across components
- **Loading States**: Multiple loading states that could be consolidated

#### 2. User Experience Issues
- **Complex Navigation**: Sidebar with many commented-out options
- **Mobile Experience**: Basic mobile sidebar implementation
- **Form Complexity**: Stream creation form has many fields
- **Payment Flow**: Stream gating might interrupt user experience

#### 3. Technical Debt
- **Type Safety**: Some `any` types and loose typing
- **Component Structure**: Large components with multiple responsibilities
- **API Integration**: Manual API calls instead of RTK Query
- **State Management**: Some local state that could be in Redux

#### 4. Performance Considerations
- **Bundle Size**: Multiple large dependencies
- **Real-time Updates**: Polling for metrics instead of WebSocket
- **Image Optimization**: Static image imports
- **Caching**: Limited caching strategy

### Current File Structure Analysis

#### Core Components
- **Dashboard**: Main user interface with streams and assets
- **Stream Creation**: Complex form with customization options
- **Broadcast**: Live streaming interface with controls
- **Player**: Video playback with chat and sidebar
- **Upload**: Video asset upload with TUS protocol
- **Settings**: Account management and linking (currently basic)

#### State Management
- **Redux Store**: Centralized state for streams and assets
- **Custom Hooks**: Stream gate, viewer metrics, asset management
- **Context**: Stream context (partially implemented)

#### API Layer
- **Livepeer Integration**: Direct API calls to Livepeer Studio
- **Custom Backend**: Additional metadata and business logic
- **Authentication**: Privy integration for Web3 wallets

## NEW: Creator Profile Page Implementation Plan

### Phase 1: Backend API Development
- [ ] Create creator profile API endpoint
- [ ] Design creator profile data structure
- [ ] Implement profile customization endpoints
- [ ] Add profile URL generation logic

### Phase 2: Frontend Route Structure
- [x] Create `/creator/[creatorId]` route
- [x] Implement creator profile page component
- [x] Add profile data fetching logic
- [x] Create profile customization interface

### Phase 3: Settings Page Integration
- [x] Add profile customization section to settings
- [x] Implement profile URL generation
- [x] Add profile preview functionality
- [x] Create shareable link generation

### Phase 4: Profile Page Features
- [x] Creator details section (bio, social links, etc.)
- [x] Streams showcase with live status
- [x] Video assets gallery
- [x] Responsive design for mobile/desktop
- [ ] SEO optimization for public pages

### Phase 5: Advanced Features
- [ ] Profile analytics (views, engagement)
- [ ] Custom profile themes
- [ ] Social sharing integration
- [ ] Profile verification badges

## High-level Task Breakdown

### NEW: Landing Page & Authentication Guard Implementation

#### Phase 1: Landing Page Structure
- [ ] **Task 1.1**: Create a new landing page route that doesn't require authentication
- [ ] **Task 1.2**: Design and implement Hero component with product introduction
- [ ] **Task 1.3**: Create streams showcase section to display all available streams
- [ ] **Task 1.4**: Add navigation between landing page and authenticated areas
- **Success Criteria**: Landing page loads without authentication, displays hero section and streams, has proper navigation

#### Phase 2: AuthGuard Component
- [ ] **Task 2.1**: Create AuthGuard component that checks authentication status
- [ ] **Task 2.2**: Implement redirect logic for unauthenticated users
- [ ] **Task 2.3**: Create HOC (Higher Order Component) wrapper for protected routes
- [ ] **Task 2.4**: Apply AuthGuard to existing protected routes (dashboard, settings, etc.)
- **Success Criteria**: AuthGuard properly protects routes, redirects unauthenticated users, allows authenticated users to access protected content

#### Phase 3: Route Restructuring
- [ ] **Task 3.1**: Update main page.tsx to redirect to landing page instead of auth
- [ ] **Task 3.2**: Modify authentication flow to work with new landing page
- [ ] **Task 3.3**: Update navigation components to handle public/private routes
- [ ] **Task 3.4**: Test authentication flow end-to-end
- **Success Criteria**: Users can access landing page without auth, protected routes are properly guarded, authentication flow works seamlessly

### Phase 1: Architecture Assessment & Planning

## Project Status Board

### Current Sprint: Landing Page & AuthGuard Implementation
- [x] **Task 1.1**: Create a new landing page route that doesn't require authentication
- [x] **Task 1.2**: Design and implement Hero component with product introduction  
- [x] **Task 1.3**: Create streams showcase section to display all available streams
- [x] **Task 1.4**: Add navigation between landing page and authenticated areas
- [x] **Task 2.1**: Create AuthGuard component that checks authentication status
- [x] **Task 2.2**: Implement redirect logic for unauthenticated users
- [x] **Task 2.3**: Create HOC wrapper for protected routes
- [x] **Task 2.4**: Apply AuthGuard to existing protected routes
- [x] **Task 3.1**: Update main page.tsx to redirect to landing page instead of auth
- [x] **Task 3.2**: Modify authentication flow to work with new landing page
- [x] **Task 3.3**: Update navigation components to handle public/private routes
- [ ] **Task 3.4**: Test authentication flow end-to-end

### Completed Tasks
- [x] Creator profile page implementation
- [x] Solana wallet integration
- [x] React hooks error fixes
- [x] Landing page implementation
- [x] AuthGuard component creation
- [x] Route protection implementation

## Current Status / Progress Tracking

**Current Phase**: Implementation Complete - Ready for Testing
**Next Action**: Test the authentication flow end-to-end
**Blockers**: None identified

## Executor's Feedback or Assistance Requests

**Implementation Summary:**
✅ Landing page created at "/" route with Hero component and streams showcase
✅ AuthGuard component created as reusable component with authentication checks
✅ Dashboard layout protected with AuthGuard (all dashboard routes now require authentication)
✅ Landing page accessible without authentication
✅ Streams showcase loads public streams from Redux store
✅ Navigation between public and protected areas implemented

**Ready for testing:**
1. Visit "/" - should show landing page without authentication
2. Try to access "/dashboard" - should redirect to "/" if not authenticated
3. Login via Hero component - should redirect to dashboard
4. Streams showcase should display available streams
5. Creator profile pages remain public and accessible

**Ready to proceed with implementation once user confirms the plan.**