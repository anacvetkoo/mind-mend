import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-background pb-24 pt-12 px-6">
      <div className="max-w-md mx-auto">
        <Button variant="secondary" size="sm" onClick={onBack} className="mb-6">
          ← Back
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glass" className="p-6">
            <h3 className="text-2xl text-foreground mb-4 font-bold">Privacy Policy</h3>
            <p className="text-xs text-muted-foreground mb-6">Effective Date: May 19, 2026</p>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p><strong>1. Information We Collect:</strong> We collect account details via Firebase Authentication and daily check-in logs (moods, stress levels, thoughts).</p>
              <p><strong>2. Storage & AI Processing:</strong> Your data is stored securely in Google Firebase Firestore. To generate personal tips, text is analyzed dynamically using Firebase AI Logic (Google Gemini API). Your private thoughts are never used to train public AI models.</p>
              <p><strong>3. Third Parties:</strong> We do not sell or rent your journals. Data is handled safely within Google cloud infrastructure.</p>
              <p><strong>4. Your Rights (GDPR):</strong> As an EU resident, you have the right to access your stored records or request immediate permanent deletion of your account and files.</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}