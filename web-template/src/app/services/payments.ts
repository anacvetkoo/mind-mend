import { getAuth } from 'firebase/auth';

export interface CreatePaymentIntentData {
  amount: number;
  appointmentId?: string;
  therapistId: string;
  therapistName: string;
  appointmentType: string;
  date: string;
  startTime: string;
}

export const createPaymentIntent = async (
  data: CreatePaymentIntentData
): Promise<string> => {
  const currentUser = getAuth().currentUser;

  if (!currentUser) {
    throw new Error('User must be authenticated before payment.');
  }

  const idToken = await currentUser.getIdToken();
  const baseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL;

  const response = await fetch(`${baseUrl}/createPaymentIntent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.clientSecret) {
    throw new Error(result.error || 'Failed to create payment intent.');
  }

  return result.clientSecret;
};