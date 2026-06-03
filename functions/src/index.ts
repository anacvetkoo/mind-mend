import * as admin from 'firebase-admin';
import cors from 'cors';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import Stripe from 'stripe';

admin.initializeApp();

const corsHandler = cors({ origin: true });
const db = admin.firestore();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appBaseUrl = "https://mindmend-a8839.web.app";
const platformFeePercent = Number(process.env.PLATFORM_FEE_PERCENT || 20);

const getStripe = ()=> {
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key is not configured');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2026-04-22.dahlia',
  });
};

const verifyUser = async (request: any): Promise<admin.auth.DecodedIdToken> => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const idToken = authHeader.replace('Bearer ', '');
  return admin.auth().verifyIdToken(idToken);
};

const sendError = (response: any, error: unknown, fallbackMessage: string): void => {
  console.error(fallbackMessage, error);
  response.status(500).json({ error: fallbackMessage });
};

export const createStripeConnectAccount = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const decodedToken = await verifyUser(request);
      const stripe = getStripe();

      const userRef = db.collection('users').doc(decodedToken.uid);
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.data();

      if (!userData || userData.role !== 'therapist') {
        response.status(403).json({ error: 'Only therapists can connect Stripe.' });
        return;
      }

      let stripeAccountId = userData.stripeAccountId as string | undefined;

      if (!stripeAccountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'SI',
          email: userData.email || decodedToken.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual',
          metadata: {
            therapistId: decodedToken.uid,
          },
        });

        stripeAccountId = account.id;

        await userRef.set({
          stripeAccountId,
          stripeAccountStatus: 'pending',
          stripeChargesEnabled: false,
          stripePayoutsEnabled: false,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${appBaseUrl}/stripe-connect-refresh`,
        return_url: `${appBaseUrl}/stripe-connect-return`,
        type: 'account_onboarding',
      });

      response.status(200).json({ url: accountLink.url });
    } catch (error) {
      sendError(response, error, 'Failed to create Stripe Connect account.');
    }
  });
});

export const refreshStripeConnectStatus = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const decodedToken = await verifyUser(request);
      const stripe = getStripe();

      const userRef = db.collection('users').doc(decodedToken.uid);
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.data();

      if (!userData?.stripeAccountId) {
        response.status(400).json({ error: 'Stripe account is not connected.' });
        return;
      }

      const account = await stripe.accounts.retrieve(userData.stripeAccountId);

const hasSubmittedDetails = account.details_submitted;
const isVerified = account.charges_enabled && account.payouts_enabled;

const stripeAccountStatus = isVerified
  ? "verified"
  : hasSubmittedDetails
    ? "submitted"
    : "pending";

await userRef.set({
  stripeAccountStatus,
  stripeChargesEnabled: account.charges_enabled,
  stripePayoutsEnabled: account.payouts_enabled,
  stripeDetailsSubmitted: account.details_submitted,
  updatedAt: new Date().toISOString(),
}, {merge: true});

response.status(200).json({
  stripeAccountStatus,
  stripeChargesEnabled: account.charges_enabled,
  stripePayoutsEnabled: account.payouts_enabled,
  stripeDetailsSubmitted: account.details_submitted,
});
    } catch (error) {
      sendError(response, error, 'Failed to refresh Stripe Connect status.');
    }
  });
});

export const createPaymentIntent = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const decodedToken = await verifyUser(request);

      const {
        amount,
        appointmentId,
        therapistId,
        therapistName,
        appointmentType,
        date,
        startTime,
      } = request.body;

      if (!amount || amount <= 0 || !appointmentId || !therapistId || !appointmentType || !date || !startTime) {
        response.status(400).json({ error: 'Missing payment data' });
        return;
      }

      const therapistSnapshot = await db.collection('users').doc(therapistId).get();
      const therapistData = therapistSnapshot.data();

      if (!therapistData?.stripeAccountId || therapistData.stripeAccountStatus !== 'verified') {
        response.status(400).json({ error: 'Therapist has not connected Stripe yet.' });
        return;
      }

      const stripe = getStripe();

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100),
        currency: 'eur',
        automatic_payment_methods: {
          enabled: true,
        },
        transfer_group: appointmentId,
        metadata: {
          userId: decodedToken.uid,
          appointmentId,
          therapistId,
          therapistName: therapistName || '',
          appointmentType,
          date,
          startTime,
        },
      });

      await db.collection('appointments').doc(appointmentId).set({
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
        therapistPayoutStatus: 'pending',
        platformFeePercent,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      response.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      sendError(response, error, 'Failed to create payment intent.');
    }
  });
});

export const cancelAppointmentWithPayment = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const decodedToken = await verifyUser(request);
      const { appointmentId, cancelledBy } = request.body as {
        appointmentId?: string;
        cancelledBy?: 'user' | 'therapist';
      };

      if (!appointmentId || !cancelledBy) {
        response.status(400).json({ error: 'Missing cancellation data.' });
        return;
      }

      const appointmentRef = db.collection('appointments').doc(appointmentId);
      const appointmentSnapshot = await appointmentRef.get();

      if (!appointmentSnapshot.exists) {
        response.status(404).json({ error: 'Appointment not found.' });
        return;
      }

      const appointment = appointmentSnapshot.data() as any;
      const isUser = appointment.userId === decodedToken.uid;
      const isTherapist = appointment.therapistId === decodedToken.uid;

      if ((cancelledBy === 'user' && !isUser) || (cancelledBy === 'therapist' && !isTherapist)) {
        response.status(403).json({ error: 'You cannot cancel this appointment.' });
        return;
      }

      const appointmentStart = new Date(`${appointment.date}T${appointment.startTime}`);
      const hoursUntilAppointment = (appointmentStart.getTime() - Date.now()) / 36e5;
      const isRefundEligible = cancelledBy === 'therapist' || hoursUntilAppointment >= 72;
      const stripe = getStripe();

      let refundId = '';

      if (isRefundEligible && appointment.stripePaymentIntentId && appointment.paymentStatus === 'paid') {
        const refund = await stripe.refunds.create({
          payment_intent: appointment.stripePaymentIntentId,
          reason: 'requested_by_customer',
          metadata: {
            appointmentId,
            cancelledBy,
          },
        });

        refundId = refund.id;
      }

      await appointmentRef.set({
        status: cancelledBy === 'therapist' ? 'CANCELLED_BY_THERAPIST' : 'CANCELLED',
        cancelledBy,
        cancelledAt: new Date().toISOString(),
        refundStatus: isRefundEligible
          ? (refundId ? 'refunded' : 'refundPending')
          : 'notRefundable',
        paymentStatus: isRefundEligible
          ? (refundId ? 'refunded' : appointment.paymentStatus)
          : 'notRefundable',
        stripeRefundId: refundId || appointment.stripeRefundId || '',
        therapistPayoutStatus: isRefundEligible ? 'cancelled' : appointment.therapistPayoutStatus || 'pending',
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      response.status(200).json({
        isRefundEligible,
        refundId,
      });
    } catch (error) {
      sendError(response, error, 'Failed to cancel appointment.');
    }
  });
});

export const releaseTherapistPayout = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const decodedToken = await verifyUser(request);
      const { appointmentId } = request.body as { appointmentId?: string };

      if (!appointmentId) {
        response.status(400).json({ error: 'Missing appointment ID.' });
        return;
      }

      const appointmentRef = db.collection('appointments').doc(appointmentId);
      const appointmentSnapshot = await appointmentRef.get();

      if (!appointmentSnapshot.exists) {
        response.status(404).json({ error: 'Appointment not found.' });
        return;
      }

      const appointment = appointmentSnapshot.data() as any;

      if (appointment.therapistId !== decodedToken.uid) {
        response.status(403).json({ error: 'Only the therapist can complete this session.' });
        return;
      }

      if (appointment.status !== 'COMPLETED') {
        response.status(400).json({ error: 'Appointment must be completed before payout.' });
        return;
      }

      if (appointment.therapistPayoutStatus === 'released') {
        response.status(200).json({ transferId: appointment.stripeTransferId });
        return;
      }

      if (!appointment.stripePaymentIntentId || appointment.paymentStatus !== 'paid') {
        response.status(400).json({ error: 'Appointment payment is not ready for payout.' });
        return;
      }

      const therapistSnapshot = await db.collection('users').doc(appointment.therapistId).get();
      const therapistData = therapistSnapshot.data();

      if (!therapistData?.stripeAccountId || therapistData.stripeAccountStatus !== 'verified') {
        response.status(400).json({ error: 'Therapist Stripe account is not verified.' });
        return;
      }

      const grossAmount = Math.round(Number(appointment.price) * 100);
      const platformFeeAmount = Math.round(grossAmount * (platformFeePercent / 100));
      const therapistAmount = grossAmount - platformFeeAmount;

      const stripe = getStripe();

      const transfer = await stripe.transfers.create({
        amount: therapistAmount,
        currency: 'eur',
        destination: therapistData.stripeAccountId,
        transfer_group: appointmentId,
        metadata: {
          appointmentId,
          therapistId: appointment.therapistId,
          userId: appointment.userId,
        },
      });

      await appointmentRef.set({
        therapistPayoutStatus: 'released',
        stripeTransferId: transfer.id,
        platformFeeAmount: platformFeeAmount / 100,
        therapistPayoutAmount: therapistAmount / 100,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      response.status(200).json({ transferId: transfer.id });
    } catch (error) {
      sendError(response, error, 'Failed to release therapist payout.');
    }
  });
});

// ─── Daily Check-In Reminder ──────────────────────────────────────────────────

const checkInTimeSlots: Record<string, number[]> = {
  morning: [8],    // 8:00
  daytime: [13],   // 13:00
  evening: [20],   // 20:00
};

export const sendDailyCheckInReminders = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'Europe/Ljubljana',
    region: 'europe-west1',
  },
  async () => {
    const now = new Date();
    const currentHour = now.getHours();

    const matchingSlot = Object.entries(checkInTimeSlots).find(([, hours]) =>
      hours.includes(currentHour)
    );

    if (!matchingSlot) return;

    const [slotName] = matchingSlot;

    const usersSnapshot = await db
      .collection('users')
      .where('checkInTime', '==', slotName)
      .where('notificationsEnabled', '==', true)
      .get();

    if (usersSnapshot.empty) {
      console.log(`[CheckInReminder] No users found for slot: ${slotName}`);
      return;
    }

    const validTokens = usersSnapshot.docs
      .map((userDoc) => userDoc.data().expoPushToken)
      .filter((token): token is string => typeof token === 'string' && token.startsWith('ExponentPushToken'));

    const messages = validTokens.map((token) => ({
      to: token,
      sound: 'default' as const,
      title: '💜 Daily Check-In',
      body: 'How are you feeling today? Take a moment to check in with yourself.',
      data: { screen: 'checkin' },
    }));

    if (messages.length === 0) {
      console.log(`[CheckInReminder] No valid push tokens for slot: ${slotName}`);
      return;
    }

    const chunks: (typeof messages)[] = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    await Promise.all(
      chunks.map((chunk) =>
        fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk),
        })
      )
    );

    console.log(`[CheckInReminder] Sent to ${messages.length} users (slot: ${slotName})`);
  }
);