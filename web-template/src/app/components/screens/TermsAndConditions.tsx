import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/Button';

interface TermsConditionsPageProps {
  onBack: () => void;
}

export function TermsConditionsPage({ onBack }: TermsConditionsPageProps) {
  return (
    <div className="min-h-screen bg-background pb-24 pt-12 px-6">
      <div className="max-w-md mx-auto">
        <Button variant="secondary" size="sm" onClick={onBack} className="mb-6">
          ← Back
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glass" className="p-6">
            <h3 className="text-2xl text-foreground mb-4 font-bold">Terms & Conditions</h3>
            <p className="text-xs text-muted-foreground mb-6">Last Updated: May 19, 2026</p>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="text-red-400 font-semibold">⚠️ 1. Medical Disclaimer:</p>
              <p>MindMend is an AI wellness tool and <strong>does not provide professional medical advice, clinical diagnosis, or psychiatric treatment</strong>.</p>
              <p><strong>Emergency Situations:</strong> MindMend is NOT a crisis response application. If you are in distress, please immediately call 112 or contact official medical emergency channels.</p>
              <p><strong>2. AI Limitations:</strong> Recommendations are automated. AI generation can occasionally include structural errors or minor repetitions. Use personal discretion before following tips.</p>
              <p><strong>3. Technical Liability:</strong> The developers of MindMend hold no liability for any life choices, outcomes, or perceived damages linked to app suggestions.</p>
              <p><strong>4. Appointment Cancellation:</strong> Clients may cancel an appointment at least 72 hours before the scheduled start time and receive a full refund. Cancellations made less than 72 hours before the session are not refundable.</p>
              <p><strong>5. Therapist Cancellation:</strong> If a therapist cancels a confirmed appointment, the client is eligible for a full refund.</p>
              <p><strong>6. Payments and Payouts:</strong> Payments are processed securely through Stripe. MindMend may retain a platform fee from completed paid sessions. Therapist payouts are released only after a session is completed.</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}