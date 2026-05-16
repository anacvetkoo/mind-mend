IMPORTANT:
Do NOT redesign, remove, overwrite, rename, or break any existing screens, navigation, components, styling, authentication, user roles, or already implemented functionality in the app. Preserve the current app structure, UI design, theme, color palette, typography, responsive behavior, and all existing flows exactly as they are. Only EXTEND the current application by ADDING a complete appointment booking and scheduling system for therapists and users.

The app already contains 2 existing user roles:

* User
* Therapist

Implement the following scheduling and booking functionality in a production-ready way.

---

## THERAPIST AVAILABILITY SYSTEM

Add a new “Availability & Appointments” section to therapist profiles/dashboard.

This section must support an onboarding/setup flow:

IF therapist has NOT completed availability setup:

* show an informational card/section explaining that appointment booking is not yet configured
* show a CTA button/link:
  “Set up availability”
* explain that therapist must define:

  * working hours
  * appointment duration
  * break duration
  * supported appointment types

AFTER therapist completes setup:

* replace onboarding section with a summary view displaying:

  * working days
  * working hours
  * appointment duration
  * break duration
  * enabled appointment types
* include:

  * Edit button
  * Manage blocked time button

DO NOT remove the onboarding state logic.

---

## WORKING HOURS CONFIGURATION

Therapist can configure:

* working days
* working hours for each day
* appointment duration (30/45/50/60/etc minutes)
* break/buffer duration between appointments
* appointment types offered:

  * Chat
  * Voice Call
  * Video Call
  * In Person

If “In Person” is enabled:

* therapist can define address/location

---

## AUTOMATIC SLOT GENERATION

The system must automatically generate available appointment slots based on:

* working hours
* appointment duration
* break duration
* blocked time
* existing reservations

Users should ONLY see available slots.

The system must prevent:

* overlapping appointments
* double booking
* booking during blocked time
* booking outside working hours

---

## BLOCKED TIME / TIME OFF

Therapists must be able to create blocked time entries.

Examples:

* sick leave
* vacation
* seminar
* personal absence

Blocked time can be:

* full day
* multiple days
* specific hours

Blocked time should automatically remove those appointment slots from user availability.

If appointments already exist during blocked time:

* therapist must be able to cancel/reschedule them

---

## USER BOOKING FLOW

On therapist profile add:

* “Book Appointment” button

Booking flow:

1. select appointment type
2. select date
3. select available time slot
4. optional notes/message
5. continue to payment

For predefined/generated slots:

* therapist approval is NOT required
* payment confirms reservation

Flow:
AVAILABLE
→ PENDING_PAYMENT
→ payment successful
→ CONFIRMED

---

## CUSTOM APPOINTMENT REQUEST FLOW

Users must also have:
“Request Different Time”

Flow:

1. user proposes:

   * date
   * time
   * appointment type
   * optional message
2. status becomes REQUESTED
3. therapist can:

   * accept
   * reject
   * suggest another time
4. if therapist accepts:
   status → PENDING_PAYMENT
5. user completes payment
6. status → CONFIRMED

User must NOT pay before therapist accepts custom request.

---

## PAYMENT SYSTEM

Integrate a generic card payment flow UI.
Do NOT hardcode provider-specific branding.

Requirements:

* secure checkout modal/page
* appointment is NOT confirmed until payment succeeds
* handle:

  * payment success
  * payment failure
  * pending payment timeout
  * refund state

Statuses:

* AVAILABLE
* REQUESTED
* PENDING_PAYMENT
* CONFIRMED
* CANCELLED
* CANCELLED_BY_THERAPIST
* PAYMENT_FAILED
* COMPLETED

If therapist cancels confirmed appointment:

* mark appointment as CANCELLED_BY_THERAPIST
* show refund information/state to user

---

## NOTIFICATIONS

Add notification support for both therapist and user.

Send notifications for:

* new booking request
* appointment confirmed
* appointment rejected
* payment successful
* appointment cancelled
* therapist rescheduled appointment
* reminder 24h before
* reminder 1h before
* reminder 10min before

Notifications should exist in:

* in-app notifications
* optional push notification UI placeholders

---

## CALENDAR / APPOINTMENT MANAGEMENT

Therapist dashboard:

* upcoming appointments
* calendar/schedule view
* blocked time management
* appointment requests
* completed appointments
* cancel/reschedule actions

User dashboard:

* upcoming appointments
* past appointments
* pending payments
* custom requests
* cancel/reschedule requests

---

## UI/UX REQUIREMENTS

Maintain existing app visual identity.

New scheduling UI should feel:

* modern
* calm
* minimal
* clean
* mental-health focused
* mobile-first

Use:

* soft cards
* rounded corners
* subtle shadows
* clean spacing
* intuitive booking flow

Do NOT clutter screens.

Use clear status badges:

* Pending Payment
* Confirmed
* Requested
* Cancelled
  etc.

---

## TECHNICAL / LOGIC REQUIREMENTS

Do NOT break existing functionality.

Do NOT modify existing authentication or user role logic.

Only EXTEND current architecture.

All scheduling logic must properly handle:

* timezone-safe date/time handling
* slot recalculation
* conflict prevention
* appointment status transitions
* cancellation handling
* blocked time handling
* payment-required confirmation flow

Preserve all existing screens and app behavior.