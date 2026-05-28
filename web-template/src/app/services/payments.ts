import { getAuth } from 'firebase/auth';

export interface CreatePaymentIntentData {
  amount: number;
  appointmentId: string;
  therapistId: string;
  therapistName: string;
  appointmentType: string;
  date: string;
  startTime: string;
}

const getAuthorizedHeaders = async (): Promise<HeadersInit> => {
  const currentUser = getAuth().currentUser;

  if (!currentUser) {
    throw new Error('User must be authenticated before payment.');
  }

  const idToken = await currentUser.getIdToken();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
  };
};

const getFunctionsBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL;

  if (!baseUrl) {
    throw new Error('Functions base URL is not configured.');
  }

  return baseUrl;
};

export const createPaymentIntent = async (
  data: CreatePaymentIntentData
): Promise<string> => {
  const response = await fetch(`${getFunctionsBaseUrl()}/createPaymentIntent`, {
    method: 'POST',
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.clientSecret) {
    throw new Error(result.error || 'Failed to create payment intent.');
  }

  return result.clientSecret;
};

export const createStripeConnectAccount = async (): Promise<string> => {
  const response = await fetch(`${getFunctionsBaseUrl()}/createStripeConnectAccount`, {
    method: 'POST',
    headers: await getAuthorizedHeaders(),
  });

  const result = await response.json();

  if (!response.ok || !result.url) {
    throw new Error(result.error || 'Failed to connect Stripe account.');
  }

  return result.url;
};

export const refreshStripeConnectStatus = async (): Promise<void> => {
  const response = await fetch(`${getFunctionsBaseUrl()}/refreshStripeConnectStatus`, {
    method: 'POST',
    headers: await getAuthorizedHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to refresh Stripe status.');
  }
};

export const cancelAppointmentPayment = async (
  appointmentId: string,
  cancelledBy: 'user' | 'therapist'
): Promise<{ isRefundEligible: boolean; refundId: string }> => {
  const response = await fetch(`${getFunctionsBaseUrl()}/cancelAppointmentWithPayment`, {
    method: 'POST',
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify({ appointmentId, cancelledBy }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to cancel appointment.');
  }

  return result;
};

export const releaseTherapistPayout = async (appointmentId: string): Promise<void> => {
  const response = await fetch(`${getFunctionsBaseUrl()}/releaseTherapistPayout`, {
    method: 'POST',
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify({ appointmentId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to release therapist payout.');
  }
};