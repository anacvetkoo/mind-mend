Tukaj so navodila! Kopiraj vse skupaj v Figma Make:

Please fix the following issues in the MindMend app. Do NOT change the design system, colors, fonts, or mascot. Only fix the logic, navigation, and missing screens described below.

FIX 1: Content Library navigation — wire up ContentDetail
In App.tsx, the ContentLibrary screen is not connected to ContentDetail. Fix this:

Pass an onSelectContent prop to ContentLibrary
When a user taps any content card inside ContentLibrary, call onSelectContent(item) which sets selectedContent in App.tsx state
This already works for selectedContent — just make sure ContentLibrary actually calls it on card tap
Make sure this works for BOTH user role (explore tab) AND therapist role (mycontent tab)


FIX 2: Therapist "My Content" screen — create a separate screen
Right now the therapist sees the same ContentLibrary as the user on the mycontent tab. This is wrong. Create a new screen called TherapistMyContent.tsx:

Header: "My Content" title + "Add New +" button in top right (outlined, lavender, pill shaped)
Filter tabs: All / Relaxation / Breathing / Sound Therapy
Each content card shows:

Gradient thumbnail (same style as ContentLibrary)
Title, category badge, duration
Stats row: 👁 Views count, ❤️ Likes count
Two small buttons on the card: "Edit" (outlined) and "Delete" (red outlined)


Show 4-5 sample content cards with realistic data
Empty state: Otto mascot + "You haven't published any content yet" + "Publish your first session" button
At the bottom: floating "Add New Content" button (lavender gradient, full width, rounded, above bottom nav)

In App.tsx, replace ContentLibrary with TherapistMyContent for the therapist mycontent tab.

FIX 3: Admin Users Management screen — create a real screen
Right now the admin users tab shows JournalHistory which is completely wrong. Create a new screen called AdminUsers.tsx:

Header: "Users" title + search bar below
Stats row at top: Total Users count, Active today count (small colored badge cards)
User list (scrollable):

Each row: circular avatar (use emoji or gradient placeholder), full name, email, join date, status badge (Active = green, Suspended = red)
Tap anywhere on row → expands to show 2 action buttons: "Suspend Account" (red outlined) and "View Details" (lavender outlined)


Show at least 6 sample users with realistic names and emails
Soft dividers between rows
Otto mascot empty state if search returns nothing

In App.tsx, replace JournalHistory with AdminUsers for the admin users tab.

FIX 4: HomeDashboard — add "Find a Therapist" navigation
In HomeDashboard.tsx, there should be a card or button that navigates to the Therapist List. Fix this:

Add an onFindTherapist prop to HomeDashboard
Add a card on the Home screen (below the stats, above recommended content) that says:

Title: "Talk to a Professional"
Subtitle: "Find a licensed therapist that fits your needs"
Icon: a small therapist/person icon
Style: soft white card with lavender left border accent, rounded 16px, shadow
Arrow icon on the right
Tapping this card calls onFindTherapist()


In App.tsx, pass onFindTherapist={() => setCurrentScreen('therapists')} to HomeDashboard


FIX 5: ChatScreen — create a proper inbox view
Right now ChatScreen opens directly into a conversation. Replace it with a proper inbox list screen:

Header: "Messages" title
Otto AI chat always pinned at top:

Avatar: Otto otter emoji 🦦
Name: "Otto — AI Companion"
Last message preview: "I'm here whenever you need to talk 💙"
Always shows a soft lavender background to distinguish from human chats


Below: list of therapist conversations

Each row: circular therapist avatar, therapist name, last message preview (max 1 line), timestamp, unread count badge (lavender circle with white number)
Show 2-3 sample therapist conversations with realistic previews


Tapping any row (Otto or therapist) → opens ChatConversation screen with correct name and avatar
In App.tsx:

Add showChatConversation and chatTarget state (already exists — reuse it)
When user taps a conversation in ChatScreen, call a new prop onOpenChat({ name, avatar, isAI }) which sets chatTarget and showChatConversation = true
Make sure ChatScreen receives this prop and calls it on tap




FIX 6: Onboarding — simplify to 4 steps
The current onboarding has 6 steps which is too many. Reduce to 4 cleaner steps:

Step 1: Otto greeting + ask for name (keep as is)
Step 2: Ask for goals (keep the emoji grid — remove age range step entirely)
Step 3: Reminder preference (keep as is, remove "have you journaled before" step)
Step 4: All done! Otto excited + "Let's Begin!" button (keep as is)

Remove steps: age range (step 1 currently) and "have you journaled before" (step 3 currently).
Update totalSteps to 4 and fix the progress bar accordingly.

GENERAL RULES — do not break these:

Keep ALL existing design: colors, fonts, mascot, card styles, shadows, gradients
Keep ALL existing screens that already work correctly
Keep role-based navigation exactly as it is
All new screens must follow the same visual style: Outfit font, pastel palette, rounded cards, 16px padding, soft shadows
Otto mascot must appear in all empty states of new screens
All new screens need the bottom navigation bar visible (pb-24 padding at bottom)
Mobile layout: max-w-md mx-auto, px-6 padding