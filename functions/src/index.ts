import * as admin from 'firebase-admin';
import cors from 'cors';
import { onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

admin.initializeApp();

const corsHandler = cors({ origin: true });


export const createPaymentIntent = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const authHeader = request.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const idToken = authHeader.replace('Bearer ', '');
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      const {
        amount,
        appointmentId,
        therapistId,
        therapistName,
        appointmentType,
        date,
        startTime,
      } = request.body;

      if (!amount || amount <= 0 || !therapistId || !appointmentType || !date || !startTime) {
        response.status(400).json({ error: 'Missing payment data' });
        return;
      }

      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  response.status(500).json({ error: 'Stripe secret key is not configured' });
  return;
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-04-22.dahlia',
});

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100),
        currency: 'eur',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: decodedToken.uid,
          appointmentId: appointmentId || '',
          therapistId,
          therapistName: therapistName || '',
          appointmentType,
          date,
          startTime,
        },
      });

      response.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      response.status(500).json({ error: 'Failed to create payment intent' });
    }
  });
});