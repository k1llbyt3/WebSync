# Next.js Project on Replit

## Project Overview
This is a Next.js 15.3.3 application using Turbopack, Firebase for authentication and data storage, and Genkit AI for AI features. The project was migrated from Vercel to Replit on November 8, 2025.

## Current State
- **Framework**: Next.js 15.3.3 with Turbopack
- **Package Manager**: npm
- **Development Server**: Running on port 5000, bound to 0.0.0.0
- **Production Ready**: Deployment configured for Replit autoscale

## Project Structure
```
src/
├── ai/              # Genkit AI integration
├── app/             # Next.js App Router pages
│   ├── (auth)/      # Authentication routes
│   └── (main)/      # Main application routes
├── components/      # React components
│   └── ui/          # UI components (Radix UI)
├── firebase/        # Firebase configuration and hooks
├── hooks/           # Custom React hooks
└── lib/             # Utility functions
```

## Configuration Changes for Replit
1. **Port Configuration**: Changed dev and start scripts to use port 5000 with host 0.0.0.0
2. **TypeScript**: Added type assertion for Firebase auth emulator config to resolve type errors
3. **Deployment**: Configured autoscale deployment target with build command

## Known Warnings
- **Cross-origin request warning**: This is an informational warning from Next.js 15 about future versions requiring explicit `allowedDevOrigins` configuration. It does not affect functionality in the current version and can be safely ignored. The feature will be configured once Next.js officially supports it.

## Environment Variables
- **GOOGLE_API_KEY**: Required for AI-powered meeting analysis (Gemini AI)
  - Get your key from https://aistudio.google.com/app/apikey
  - Stored securely in Replit Secrets
- Firebase configuration is in `src/firebase/config.ts`

## Development
- Run `npm run dev` to start the development server
- Server will be available at port 5000
- Hot reloading is enabled via Turbopack

## Production Deployment
- **Deployment Target**: autoscale (for stateless web applications)
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Port**: 5000 (configured in package.json)
- Configuration is managed in `.replit` file

## Firebase Integration
- **Authentication**: Firebase Auth with email/password
- **Database**: Firestore for data storage
- **Configuration**: Uses environment variables from Replit Secrets
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID

## AI Features
- **Genkit AI** integration with Google Generative AI (Gemini 2.5 Flash)
- **Meeting Co-Pilot**: AI-powered transcript analysis
  - Generates concise meeting summaries
  - Extracts action items automatically
  - Identifies keywords, dates, and times
  - Converts action items to tasks or reminders
- Development server: `npm run genkit:dev`
- Watch mode: `npm run genkit:watch`

### Using Meeting Co-Pilot
1. Sign up or log in to your account
2. Navigate to the Meetings page
3. Paste your meeting transcript or upload a text file
4. Click "Analyze Transcript"
5. View AI-generated summary, action items, and key information
6. Add action items as tasks or set reminders with one click

## Recent Updates (November 9, 2025)
- **Enhanced Task Card Design**: Professional aesthetic improvements
  - **Top Gradient Accent**: Colorful gradient bar at the top of each card
  - **Priority Color-Coding**: Left border changes color (red/yellow/green) based on priority
  - **Title Underline**: Task titles have an animated underline on hover
  - **Subtle Background Gradients**: Priority-based background tints for visual depth
  - **Tag Display**: Shows up to 2 tags with "+N more" indicator
  - **Better Typography**: Bold titles, improved spacing, and professional fonts
  - **Enhanced Hover Effects**: Menu button rotates on hover, smooth transitions
  - **Border Accents**: Description has left border accent, sections separated by subtle dividers
  - **Improved Date Display**: Better formatted dates with background and icon
  - **Larger Avatar**: Increased avatar size with enhanced shadows
  - **Dragging Feedback**: Ring effect appears when dragging tasks
- **Password Requirements Display**: Live validation feedback on signup page
  - Shows 3 requirements: 6+ characters, number, special character
  - Green checkmarks appear as each requirement is met
  - Prevents signup with invalid password
- **Sidebar Improvements**: Cleaner navigation
  - Removed sidebar close/toggle button beside WorkSync logo
  - Moved "Log out" button from footer to below Settings in nav menu
  - Streamlined sidebar layout
- **Status Selector on Add Task**: Choose which column tasks go into
  - Dropdown with all 5 status options (Backlog, To-Do, In Progress, Review, Completed)
  - Tasks appear directly in selected column
  - Eliminates need to drag from Backlog
- **Dashboard Enhancement**: Added real-time task status counters
  - Displays 5 separate task counts: Backlog, To-Do, In Progress, Review, Completed
  - Updates automatically when tasks are added, modified, or deleted
  - Uses Firebase real-time listeners for instant synchronization
- **Task Board Fixes**: Resolved React hydration mismatch errors
  - Added client-side mount check for drag-and-drop functionality
  - Fixed react-beautiful-dnd configuration issues
- **Drag-and-Drop Enhancements**: Full task management via drag-and-drop
  - **Move Tasks**: Drag tasks between status columns (Backlog → To-Do → In Progress → Review → Completed)
  - **Delete Tasks**: Drag tasks to delete zone that appears during dragging
  - **Visual Feedback**: Cards rotate and scale while dragging, columns highlight when hovering
  - **Success Notifications**: Toast messages confirm task moves and deletions
  - **Cursor Changes**: Grab cursor on hover, grabbing cursor while dragging
- **Error Handling Improvements**: Better user feedback
  - Replaced silent non-blocking Firebase updates with proper error handling
  - Toast notifications for success and error states
  - Clear error messages when Firebase operations fail
- **Dev Tools Page**: Testing and debugging utilities
  - Check Firebase connection status
  - Add 5 sample tasks distributed across all status columns
  - Clear all tasks to start fresh
  - View user authentication info
  - Helpful tips for Firebase security rule configuration
- **Interactive UI/UX Enhancements**: Made the interface more engaging and responsive
  - **Dashboard Cards**: Added hover effects with scale, shadow, and border animations
  - **Animated Counters**: Task counts now animate from 0 to their actual value
  - **Icon Animations**: Icons rotate and pulse on hover
  - **Activity Items**: Fade-in animations with staggered delays for visual appeal
  - **Task Cards**: Enhanced hover states with subtle scale, border color changes
  - **Button Interactions**: Added rotation and scale effects on hover/active states
  - **Search Input**: Focus states with ring animations and color transitions
  - **Project Cards**: Smooth hover backgrounds and interactive "View Project" links
  - **Loading States**: Pulse animations for skeletons and better visual feedback

## Migration Notes
- Removed `apphosting.yaml` (Firebase-specific)
- Updated all port configurations from 9002 to 5000
- Added 0.0.0.0 host binding for Replit compatibility
- Fixed TypeScript errors in Firebase integration
