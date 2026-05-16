# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MindMend** - A mental wellness platform built with Figma Make that connects users with therapists, provides AI-powered mental health support, mood tracking, journaling, and appointment booking.

- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS v4.1.12
- **Animation**: Motion 12.23.24 (formerly Framer Motion)
- **UI Components**: Radix UI primitives + custom components

## Development Commands

```bash
# Install dependencies
pnpm install

# Build the application
pnpm build

# Note: This is a Figma Make project
# - The Vite dev server runs automatically in Figma Make environment
# - DO NOT run `vite` or `npm run dev` manually
# - The entrypoint is __figma__entrypoint__.ts (auto-generated at runtime)
```

## Architecture Overview

### State-Based Routing (No React Router)

The app uses a custom state machine for navigation managed in `App.tsx`:

```typescript
type AppState = 'splash' | 'welcome' | 'auth' | 'questionnaire' | 'app';
```

Navigation flow:
1. **Splash** → Initial loading screen
2. **Welcome** → First-time onboarding slides
3. **Auth** → Login/signup with role selection
4. **Questionnaire** → User onboarding assessment (only for new users)
5. **App** → Main application with role-based screens

Within the `app` state, navigation is managed via `currentScreen` state (e.g., 'home', 'profile', 'appointments').

### Multi-Role System

Three user roles with distinct interfaces:

- **User** (default): Home dashboard, mood tracking, therapist booking, journal, AI chat
- **Therapist**: Dashboard, appointments, content management, availability setup
- **Admin**: User management, platform overview

Role is stored in `localStorage` as `userRole` and determines which screens are accessible.

### State Management Strategy

No Redux or external state libraries - all state managed via React hooks:

- **App.tsx**: Root state container for app-level state (auth, navigation, modals)
- **Screen components**: Local state for screen-specific data
- **localStorage**: Persistence for auth state, dark mode, onboarding completion

Modal/overlay pattern: Modals are controlled by boolean flags in App.tsx (e.g., `showMoodCheckIn`, `showBookingFlow`).

### Component Organization

```
src/app/
├── App.tsx                    # Root component, state management hub
├── components/
│   ├── screens/               # Full-page screen components
│   │   ├── HomeDashboard.tsx
│   │   ├── EnhancedQuestionnaire.tsx
│   │   ├── TherapistDashboard.tsx
│   │   └── ...
│   ├── navigation/
│   │   └── BottomNav.tsx      # Role-aware bottom navigation
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx, Card.tsx (custom)
│   │   └── button.tsx, card.tsx (shadcn/ui style)
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── mascot/
│       └── OtterMascot.tsx    # "Otto" the otter mascot
├── hooks/
│   └── useTypingAnimation.ts  # Typing effect for onboarding
├── types/
│   └── appointments.ts        # Appointment system types
└── utils/
    └── appointmentSlots.ts    # Booking logic utilities
```

### Design System

MindMend uses a calming, emotionally-safe design language:

**Theme Colors** (see `src/styles/theme.css`):
- Primary: Lavender (#B8A4D9)
- Secondary: Soft Purple (#D4C5F9)
- Accent: Soft Mint (#B8E0D2)
- Background: Warm White (#FFFBF5)

**Design Principles**:
- Soft rounded corners (border-radius: 1.25rem default)
- Gentle gradients (lavender → soft purple)
- Smooth animations via Motion library
- Mobile-first responsive design
- Emotionally supportive microcopy

**Dark Mode**: Supported via Tailwind's dark mode with palette adjustments in theme.css.

### Key Technical Patterns

**Image Imports**:
- Raster images: Use `figma:asset` virtual module (NOT file paths)
  ```tsx
  import img from "figma:asset/abc123.png"
  ```
- SVGs: Import from `src/imports/` directory using relative paths

**Animations**:
- Use `motion` from `motion/react` (NOT `framer-motion`)
- Import: `import { motion, AnimatePresence } from 'motion/react'`
- Common pattern: AnimatePresence with exit animations for screen transitions

**Styling**:
- Tailwind v4 with CSS variables in theme.css
- Use CSS variables: `var(--lavender)`, `var(--soft-purple)`, etc.
- DO NOT create `tailwind.config.js` (Tailwind v4 uses CSS-first config)
- Font styles defined in theme.css (don't use Tailwind font utilities unless overriding)

**Typing Animation Pattern**:
```tsx
const { displayedText, isComplete } = useTypingAnimation(text, speed);
// Used in onboarding for conversational feel
```

**Scroll Behavior**:
- App automatically scrolls to top on navigation (handled in App.tsx useEffect)
- Smooth scroll when clicking same tab twice

### Appointment Booking System

Complex multi-step flow with state machine:

1. **TherapistList** → Select therapist
2. **BookAppointmentFlow** → Choose date/time/type
3. **PaymentCheckout** → Process payment
4. **Confirmation** → Show success

Appointment types: Chat, Voice Call, Video Call, In Person

**Key files**:
- `types/appointments.ts`: Type definitions
- `utils/appointmentSlots.ts`: Slot generation logic
- `TherapistAvailabilitySetup.tsx`: Therapist onboarding for availability

### Onboarding Flow

**User Onboarding** (EnhancedQuestionnaire.tsx):
- Conversational flow with "Otto" the otter mascot
- Typing animations for questions
- 8+ interactive question types (sliders, mood wheel, card selections, chips)
- Multi-step with progress tracking
- Backward navigation supported

**Question Types**:
- `single-select-cards`: Grid of emoji cards
- `single-select-large`: Large illustrated options
- `age-wheel`: Interactive age picker
- `mood-wheel`: Rotating mood selector
- `yes-no`: Binary choice cards
- `multi-select`: Checkbox-style grid
- `medication-search`: Searchable medication list
- `symptom-chips`: Tag-based multi-select

## Critical Constraints

### Figma Make Environment

This project runs in Figma Make, NOT a standard Vite environment:

- ❌ DO NOT run `vite`, `npm run dev`, or start dev server manually
- ❌ DO NOT create `index.html` (entrypoint is auto-generated)
- ❌ DO NOT modify `__figma__entrypoint__.ts`
- ❌ DO NOT use `localhost` URLs in documentation
- ✅ Preview updates automatically in Figma Make

### File Naming

**Two UI component conventions coexist**:
1. PascalCase: `Button.tsx`, `Card.tsx` (custom components)
2. kebab-case: `button.tsx`, `card.tsx` (shadcn/ui style)

Both are valid - maintain consistency within each category.

### Package Management

- Use `pnpm`, not `npm` or `yarn`
- `react-hook-form` requires version 7.55.0 (specified in package.json)

### Import Conventions

```tsx
// Icons
import { ChevronRight, Heart } from 'lucide-react';

// Motion (NOT framer-motion)
import { motion } from 'motion/react';

// Toasts
import { toast } from 'sonner';

// Path alias
import Component from '@/app/components/Component';
```

## Common Tasks

### Adding a New Screen

1. Create screen component in `src/app/components/screens/`
2. Add screen case to App.tsx render logic
3. Update BottomNav.tsx if it should be in navigation
4. Add to appropriate role's screen set

### Adding a New Question to Onboarding

1. Add question object to `questions` array in EnhancedQuestionnaire.tsx
2. Add rendering logic for new question type (if custom)
3. Update hint text in question text section
4. Ensure answer validation in `canProceed()` function

### Extending the Theme

1. Add CSS variables to `src/styles/theme.css` (both light and dark mode)
2. Use variables via `var(--your-variable)`
3. Register in `@theme inline` section for Tailwind integration

### Adding Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

Use `AnimatePresence` for exit animations and conditional rendering.

## Data Persistence

Currently mock/demo data - no backend:

- **localStorage**: Auth state, user role, dark mode, onboarding completion
- **Component state**: All app data (appointments, content, messages)
- **Mock data**: Defined in screen components or App.tsx

For production: Replace with API calls and database integration.

## Mascot Integration

"Otto" the otter mascot (`/src/imports/vidra.png`):
- Appears in onboarding questionnaire
- Provides supportive messages
- Use for emotionally intelligent interactions
- Import from imports directory, not from public folder
