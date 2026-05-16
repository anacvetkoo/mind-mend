# MindMend - Mental Health & Wellness App

A modern, calming, and highly polished mobile mental health application with AI companion support.

## Overview

MindMend is a comprehensive wellness platform that combines elements from Headspace, Calm, Finch, and Thera AI into a cohesive, emotionally-safe experience. The app features:

- **Otto the Otter** - Your AI wellness companion
- **Daily mood check-ins** with AI analysis
- **Guided exercises** - Breathing, meditation, sleep therapy
- **Journal & mood tracking** with emotional insights
- **AI chat support** for instant guidance
- **Professional therapist matching**
- **Progress tracking** with streaks and achievements

## Design Highlights

### Visual Style
- **Calming pastel palette** - Lavender, soft purple, muted blue, soft mint
- **Rounded, friendly UI** - 3xl border radius on cards, full rounded buttons
- **Soft glassmorphism** - Subtle backdrop blur and transparency
- **Smooth gradients** - Primary actions and featured content
- **Premium spacing** - Generous padding for breathing room

### User Experience
- **Conversational onboarding** - Otto guides setup naturally
- **Emotionally intelligent** - AI that responds with empathy
- **Safe-space journaling** - Private, local-first approach
- **Micro-interactions** - Delightful animations throughout
- **Accessibility-first** - High contrast, clear hierarchy, 44px touch targets

## App Flow

### First Launch
1. **Splash Screen** - Animated logo with Otto
2. **Onboarding** - Conversational setup flow
3. **Authentication** - Social login or email/password
4. **Home Dashboard** - Personalized welcome

### Daily Usage
1. **Check-in** - Tap center floating button
2. **Select Mood** - Choose from 5 emotional states
3. **Tag Emotions** - Detailed feeling tags
4. **Journal** (optional) - Free-form writing
5. **AI Analysis** - Personalized insights & recommendations

### Navigation Tabs
- **Home** - Dashboard with daily insights and recommendations
- **Journal** - Mood history, trends, and calendar view
- **Check-in** - Center floating action (heart icon)
- **Chat** - AI companion & therapist messaging
- **Profile** - Stats, settings, and preferences

## Key Screens

### Home Dashboard
- Personalized greeting with Otto
- Daily check-in CTA card
- Streak counter and activity stats
- AI-generated insights
- Recommended exercises
- Quick actions

### Mood Check-In
- 5-level mood emoji selector (Terrible → Amazing)
- 12 detailed emotion tags
- Optional journal entry
- AI typing animation
- Safe, non-judgmental language

### AI Analysis
- Loading state with Otto thinking
- Pattern recognition (e.g., "stress in afternoons")
- Progress updates (e.g., "18% mood improvement")
- Trigger detection
- Personalized recommendations
- Exercise suggestions

### Journal History
- 7-day mood trend chart
- Calendar heatmap
- Timeline of entries
- Emotional insights
- Searchable & filterable

### Content Library
- Categories: Breathing, Meditation, Sleep, Anxiety, Relationships
- Search functionality
- Duration badges (5 min, 10 min, etc.)
- Featured content section
- Bookmark & like features

### Chat Screen
- Real-time AI conversation
- Typing indicators
- Quick suggestion chips
- Voice message support (UI)
- Attachment options (UI)

### Therapist Section
- Licensed professional directory
- Specialization filtering
- Ratings & reviews
- Availability status
- Video session support
- Matching quiz

### Profile
- Stats dashboard (streak, goals, badges)
- Progress tracking
- Settings (notifications, dark mode, biometrics)
- Account management

## Component Library

### Core UI Components
- `Button` - 4 variants (primary, secondary, outline, ghost)
- `Card` - 3 variants (default, glass, gradient)
- `Input` - Rounded inputs with labels and error states
- `MoodEmoji` - Interactive mood selector
- `ChatBubble` - Conversational UI
- `Badge` - Status and duration indicators
- `StatCard` - Metric display with icons
- `ProgressBar` - Animated progress indication
- `BreathingAnimation` - Guided breathing visuals

### Mascot
- `OtterMascot` - SVG-based otter with emotions
  - Sizes: sm, md, lg, xl
  - Emotions: happy, calm, thinking, excited, supportive
  - Floating animation

### Navigation
- `BottomNav` - 5-tab mobile navigation with floating center button

## Technical Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with custom theme
- **Motion (Framer Motion)** - Animations
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Color Palette

```css
--lavender: #B8A4D9     /* Primary brand */
--soft-purple: #D4C5F9  /* Secondary */
--muted-blue: #A8C5E6   /* Serenity */
--soft-mint: #B8E0D2    /* Growth */
--soft-pink: #F5D6E3    /* Warmth */
--warm-white: #FFFBF5   /* Background */
--light-gray: #F5F6FA   /* Alt background */
```

## Typography

**Font**: Outfit (rounded sans-serif from Google Fonts)
**Weights**: 300, 400, 500, 600, 700

## Mobile Optimizations

- Safe area insets for notched devices
- Smooth scrolling
- Hidden scrollbars (maintained functionality)
- No tap highlight
- Optimized touch targets (min 44x44px)
- Responsive layouts

## Future Enhancements

- [ ] Sound therapy integration
- [ ] Live therapist video sessions
- [ ] Community support groups
- [ ] Achievement badges system
- [ ] Data export & backup
- [ ] Sleep tracking
- [ ] Meditation timer
- [ ] Habit tracking
- [ ] Emergency resources
- [ ] Offline mode

## Design System

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for comprehensive design guidelines, component documentation, and best practices.

## Development

The app is structured as a single-page application with state-based routing:

```tsx
// App states: splash → onboarding → auth → app
// Screen navigation: home | journal | checkin | chat | profile
```

All screens are self-contained and can be developed independently. The design system ensures visual consistency across the entire app.

---

**MindMend** - Your companion for mental wellness 💙
