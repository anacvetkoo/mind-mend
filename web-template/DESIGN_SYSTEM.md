# MindMend Design System

A calming, premium mental health and wellness application design system inspired by Headspace, Calm, Finch, and Thera AI.

## Design Philosophy

MindMend creates an emotionally safe, calming space that feels warm and alive — never corporate. The design prioritizes:

- **Emotional comfort** - Soft colors, rounded shapes, gentle animations
- **Accessibility** - Clear hierarchy, readable typography, intuitive navigation
- **Trust** - Professional yet friendly, supportive without being clinical
- **Delight** - Subtle micro-interactions, mascot integration, thoughtful details

## Color Palette

### Primary Colors
- **Lavender** (`#B8A4D9`) - Primary brand color, represents calm and mindfulness
- **Soft Purple** (`#D4C5F9`) - Secondary accent, gradient partner
- **Muted Blue** (`#A8C5E6`) - Serenity and peace
- **Soft Mint** (`#B8E0D2`) - Growth and renewal
- **Soft Pink** (`#F5D6E3`) - Warmth and compassion

### Neutral Colors
- **Warm White** (`#FFFBF5`) - Primary background
- **Light Gray** (`#F5F6FA`) - Secondary background
- **Foreground** (`#4A4458`) - Primary text
- **Muted Foreground** (`#8B8496`) - Secondary text

### Gradients
```css
/* Primary gradient */
from-[var(--lavender)] to-[var(--soft-purple)]

/* Calming gradient */
from-[var(--gradient-start)] to-[var(--gradient-end)]
```

## Typography

**Font Family**: Outfit (rounded sans-serif from Google Fonts)

**Font Weights**:
- Normal: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

**Hierarchy**:
- H1: 3xl (30px)
- H2: 2xl (24px)
- H3: xl (20px)
- H4: lg (18px)
- Body: base (16px)
- Small: sm (14px)
- Tiny: xs (12px)

## Spacing & Layout

**Border Radius**:
- Buttons, inputs: `rounded-full` or `rounded-2xl`
- Cards: `rounded-3xl`
- Small elements: `rounded-xl`

**Padding**:
- Cards: `p-6`
- Buttons: `px-6 py-3` (md), `px-4 py-2` (sm), `px-8 py-4` (lg)
- Screen margins: `px-6 py-8`

**Shadows**:
- Default: `shadow-lg`
- Hover: `shadow-xl`
- Prominent: `shadow-2xl`

## Components

### Buttons
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Ghost</Button>
```

### Cards
```tsx
<Card variant="default">Standard card</Card>
<Card variant="glass">Glassmorphic card</Card>
<Card variant="gradient">Gradient background</Card>
```

### Mood Emojis
Interactive mood selectors with emoji, label, and selection state:
```tsx
<MoodEmoji emoji="😊" label="Happy" isSelected={true} />
```

### Chat Bubbles
Conversational UI for AI interactions:
```tsx
<ChatBubble sender="ai" message="How are you?" />
<ChatBubble sender="user" message="I'm doing well!" />
```

## Mascot: Otto the Otter

Otto is MindMend's AI companion — a friendly otter that appears throughout the app:

**Emotions**:
- `happy` - General friendly state
- `calm` - Meditative, peaceful
- `thinking` - Processing, analyzing
- `excited` - Celebrating achievements
- `supportive` - Empathetic, caring

**Usage**:
```tsx
<OtterMascot size="lg" emotion="happy" />
```

## Screen Architecture

### Navigation
Bottom navigation with 5 tabs:
1. **Home** - Dashboard, insights, recommendations
2. **Journal** - Mood history, timeline, trends
3. **Check-in** - Center floating action button
4. **Chat** - AI conversation, therapist messaging
5. **Profile** - Stats, settings, preferences

### Core Flows

#### Onboarding
1. Splash screen with mascot
2. Conversational setup (name, age, goals)
3. Permissions (notifications, biometrics)
4. Authentication

#### Daily Check-in
1. Mood selection (5 emojis)
2. Emotion tags (detailed feelings)
3. Journal entry (optional)
4. AI analysis and recommendations

#### Content Library
- Category filtering
- Search functionality
- Featured content
- Exercise cards with duration badges

## Motion & Animation

**Principles**:
- Subtle, calming movements
- No jarring transitions
- Reinforce hierarchy and flow
- Enhance emotional connection

**Patterns**:
```tsx
// Page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
```

// Button interactions
```tsx
<motion.button whileTap={{ scale: 0.95 }}>
```

## Accessibility

- Minimum contrast ratio: 4.5:1
- Touch targets: Minimum 44x44px
- Focus indicators: 2px solid ring
- Semantic HTML structure
- Screen reader friendly labels

## Mobile Optimizations

- Safe area insets for notched devices
- Hidden scrollbars with maintained functionality
- Tap highlight removal
- Smooth scrolling
- Responsive touch interactions

## Best Practices

1. **Always use the mascot** for emotional moments (loading, success, empty states)
2. **Prefer gradients** for primary actions and featured content
3. **Use glassmorphism** for floating or overlay elements
4. **Animate thoughtfully** - every motion should have purpose
5. **Write conversationally** - Otto speaks like a supportive friend
6. **Provide feedback** - Loading states, success confirmations, gentle errors
7. **Respect privacy** - Emphasize local-first, secure journaling

## File Structure

```
src/app/
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── MoodEmoji.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   ├── mascot/           # Otto the Otter
│   │   └── OtterMascot.tsx
│   ├── navigation/       # Navigation components
│   │   └── BottomNav.tsx
│   └── screens/          # Full screen views
│       ├── SplashScreen.tsx
│       ├── OnboardingFlow.tsx
│       ├── AuthScreen.tsx
│       ├── HomeDashboard.tsx
│       ├── MoodCheckIn.tsx
│       ├── AIAnalysis.tsx
│       ├── JournalHistory.tsx
│       ├── ContentLibrary.tsx
│       ├── ChatScreen.tsx
│       ├── ProfileScreen.tsx
│       └── TherapistSection.tsx
└── App.tsx               # Main app router
```

## Future Enhancements

- Breathing animation component
- Sound therapy integration
- Therapist video sessions
- Community features
- Achievement system
- Data export/backup
- Dark mode refinement
- Accessibility audit
