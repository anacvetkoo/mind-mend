import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Clock, User, Phone, Video, Paperclip, Smile, Mic } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { endSession } from '../../services/appointments';
import type { Appointment } from '../../types/appointments';

interface SessionMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

interface SessionScreenProps {
  appointment: Appointment;
  isTherapist: boolean;
  onEndSession: () => void;
  onLeaveSession: () => void;
}

// ─── Enkripcija z Web Crypto API (vgrajen v browser, brez zunanjih knjižnic) ──
// Ključ je unikaten za vsako sejo — kombinacija appointmentId + fiksen string
const getKeyMaterial = (appointmentId: string) =>
  crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`mm_session_${appointmentId}_k9x2p`.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

const encryptMessage = async (text: string, appointmentId: string): Promise<string> => {
  try {
    const key = await getKeyMaterial(appointmentId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(text)
    );
    // Združimo iv + encrypted v base64 string
    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.byteLength);
    return btoa(String.fromCharCode(...combined));
  } catch {
    return text;
  }
};

const decryptMessage = async (cipherText: string, appointmentId: string): Promise<string> => {
  try {
    const key = await getKeyMaterial(appointmentId);
    const combined = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    // Če dešifriranje ne uspe (npr. stara sporočila), vrni original
    return cipherText;
  }
};

function EndConfirmModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.5)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-xl text-foreground mb-2">End Session?</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This will mark the session as completed. The client will be notified.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-[var(--border)] text-foreground text-sm">Cancel</button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-medium">End Session</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SessionEndedModal({ onLeave }: { onLeave: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.5)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl text-foreground mb-2">Session ended</h3>
        <p className="text-sm text-muted-foreground mb-6">Your therapist has ended the session. Hope it was helpful!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onLeave}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white font-medium">
          View My Appointments
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function useSessionTimer(sessionId: string, isTherapist: boolean) {
  const [duration, setDuration] = useState(0);
  const startRef = useRef<Date | null>(null);

  useEffect(() => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const init = async () => {
      if (isTherapist) {
        const snap = await getDoc(sessionRef);
        if (!snap.exists() || !snap.data()?.sessionStartedAt) {
          startRef.current = new Date();
          await setDoc(sessionRef, { sessionStartedAt: serverTimestamp() }, { merge: true });
        }
      }
      return onSnapshot(sessionRef, (snap) => {
        const startedAt = snap.data()?.sessionStartedAt?.toDate?.();
        if (startedAt && !startRef.current) {
          startRef.current = startedAt;
          setDuration(Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)));
        }
      });
    };
    let unsub: (() => void) | undefined;
    init().then(u => { unsub = u; });
    return () => unsub?.();
  }, [sessionId, isTherapist]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (startRef.current) {
        setDuration(Math.max(0, Math.floor((Date.now() - startRef.current.getTime()) / 1000)));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return `${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`;
}

// ─── Voice Call Block ─────────────────────────────────────────────────────────
function VoiceCallBlock({ isTherapist, otherPersonName, timerDisplay, sessionId, showEndConfirm, setShowEndConfirm, showSessionEndedModal, handleEndSession, onLeaveSession }: any) {
  const [phoneInput, setPhoneInput] = useState('');
  const [clientPhone, setClientPhone] = useState<string | null>(null);
  const [phoneSent, setPhoneSent] = useState(false);

  // Real-time listener na clientPhone iz Firestorea
  useEffect(() => {
    const sessionRef = doc(db, 'sessions', sessionId);

    // Takoj preveri če telefonska že obstaja
    getDoc(sessionRef).then(snap => {
      const phone = snap.data()?.clientPhone;
      if (phone) {
        setClientPhone(phone);
        setPhoneSent(true);
      }
    });

    // Real-time listener za spremembe
    return onSnapshot(sessionRef, (snap) => {
      const phone = snap.data()?.clientPhone;
      if (phone) {
        setClientPhone(phone);
        setPhoneSent(true);
      }
    });
  }, [sessionId]);

  const handleSendPhone = async () => {
    if (!phoneInput.trim()) return;
    const sessionRef = doc(db, 'sessions', sessionId);
    await setDoc(sessionRef, { clientPhone: phoneInput.trim() }, { merge: true });
    setPhoneSent(true);
  };

  const handleCall = () => {
    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'openURL', url: `tel:${clientPhone}` }));
    } else {
      window.open(`tel:${clientPhone}`, '_self');
    }
  };

  const handleCopyPhone = () => {
    if (clientPhone) navigator.clipboard.writeText(clientPhone);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] px-4 py-3 flex items-center gap-3 shadow-lg">
        <button onClick={isTherapist ? () => setShowEndConfirm(true) : onLeaveSession}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Phone className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-white">{otherPersonName}</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-white/80 text-xs">Voice Call · {timerDisplay}</p>
          </div>
        </div>
        {isTherapist && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowEndConfirm(true)}
            className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
            End
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 max-w-[390px] mx-auto w-full">
        <div className="w-24 h-24 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center">
          <Phone className="w-12 h-12 text-[var(--lavender)]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl text-foreground mb-1">Voice Call Session</h2>
          <p className="text-muted-foreground text-sm">with {otherPersonName}</p>
        </div>

        {/* USER — vpiše telefonsko */}
        {!isTherapist && (
          <div className="w-full bg-card rounded-2xl p-5 shadow-md">
            {!phoneSent ? (
              <>
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  Enter your phone number so your therapist can call you
                </p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+386 41 123 456"
                    className="flex-1 px-4 py-3 rounded-2xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none text-foreground placeholder:text-muted-foreground text-sm"
                  />
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleSendPhone}
                    disabled={!phoneInput.trim()}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm font-medium disabled:opacity-40">
                    Send
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-foreground font-medium mb-1">Wait for therapist's call</p>
                <p className="text-xs text-muted-foreground">Your therapist will call you shortly</p>
              </div>
            )}
          </div>
        )}

        {/* TERAPEVT — vidi telefonsko in jo pokliče */}
        {isTherapist && (
          <div className="w-full bg-card rounded-2xl p-5 shadow-md">
            {!clientPhone ? (
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border-4 border-[var(--lavender)] border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Waiting for client's phone number...</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-2 text-center">Client's phone number</p>
                <div className="flex items-center gap-2 bg-[var(--muted)] rounded-xl px-4 py-3 mb-4">
                  <p className="flex-1 text-foreground font-medium">{clientPhone}</p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleCall}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white font-medium flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call Now
                </motion.button>
              </>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showEndConfirm && <EndConfirmModal onCancel={() => setShowEndConfirm(false)} onConfirm={handleEndSession} />}
        {showSessionEndedModal && <SessionEndedModal onLeave={onLeaveSession} />}
      </AnimatePresence>
    </div>
  );
}

export function SessionScreen({ appointment, isTherapist, onEndSession, onLeaveSession }: SessionScreenProps) {
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = getAuth().currentUser;

  const sessionId = appointment.id;
  const otherPersonName = isTherapist ? appointment.userName : appointment.therapistName;
  const timerDisplay = useSessionTimer(sessionId, isTherapist);

  useEffect(() => {
    const q = query(collection(db, 'sessions', sessionId, 'messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, async (snapshot) => {
      // Dešifriramo vsa sporočila ob branju iz Firestorea
      const decrypted = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          return {
            id: d.id,
            text: await decryptMessage(data.text, sessionId),
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp,
          } as SessionMessage;
        })
      );
      setMessages(decrypted);
    });
  }, [sessionId]);

  useEffect(() => {
    if (isTherapist) return;
    return onSnapshot(doc(db, 'appointments', sessionId), (snap) => {
      if (snap.data()?.status === 'COMPLETED') setShowSessionEndedModal(true);
    });
  }, [sessionId, isTherapist]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    return timestamp.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSending || !currentUser) return;
    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    inputRef.current?.focus();
    try {

      // Šifriramo sporočilo preden ga shranimo v Firestore
      const encryptedText = await encryptMessage(text, sessionId);

      console.log('Original:', text);
      console.log('Encrypted:', encryptedText);

      await addDoc(collection(db, 'sessions', sessionId, 'messages'), {
        text: encryptedText,
        senderId: currentUser.uid,
        senderName: isTherapist ? appointment.therapistName : appointment.userName,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession(sessionId, appointment.therapistId);
      onEndSession();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // ─── Voice Call ───────────────────────────────────────────────────────────
  if (appointment.appointmentType === 'Voice Call') {
    return <VoiceCallBlock
      isTherapist={isTherapist}
      otherPersonName={otherPersonName}
      timerDisplay={timerDisplay}
      sessionId={sessionId}
      showEndConfirm={showEndConfirm}
      setShowEndConfirm={setShowEndConfirm}
      showSessionEndedModal={showSessionEndedModal}
      handleEndSession={handleEndSession}
      onLeaveSession={onLeaveSession}
    />;
  }

    // ─── Video Call ───────────────────────────────────────────────────────────
  if (appointment.appointmentType === 'Video Call') {
    const zoomLink = (appointment as any).therapistZoomLink || null;

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] px-4 py-3 flex items-center gap-3 shadow-lg">
          <button onClick={isTherapist ? () => setShowEndConfirm(true) : onLeaveSession}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-white">{otherPersonName}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/80 text-xs">Video Call · {timerDisplay}</p>
            </div>
          </div>
          {isTherapist && (
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowEndConfirm(true)}
              className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
              End
            </motion.button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 max-w-[390px] mx-auto w-full">
          <div className="w-24 h-24 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center">
            <Video className="w-12 h-12 text-[var(--lavender)]" />
          </div>
          <div className="text-center">
            <h2 className="text-xl text-foreground mb-1">Video Call Session</h2>
            <p className="text-muted-foreground text-sm">with {otherPersonName}</p>
          </div>
          {zoomLink ? (
            <div className="w-full bg-card rounded-2xl p-5 shadow-md">
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Tap below to join via Zoom
              </p>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if ((window as any).ReactNativeWebView) {
                    (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'openURL', url: zoomLink }));
                  } else {
                    window.open(zoomLink, '_blank');
                  }
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white font-medium flex items-center justify-center gap-2 shadow-md">
                <Video className="w-5 h-5" />
                Join Zoom Call
              </motion.button>
            </div>
          ) : (
            <div className="w-full bg-[var(--muted)] rounded-2xl p-5 text-center">
              <p className="text-sm text-muted-foreground">
                {isTherapist
                  ? 'Add your Zoom link in Profile → Edit Profile.'
                  : 'Your therapist has not set up a Zoom link yet.'}
              </p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showEndConfirm && <EndConfirmModal onCancel={() => setShowEndConfirm(false)} onConfirm={handleEndSession} />}
          {showSessionEndedModal && <SessionEndedModal onLeave={onLeaveSession} />}
        </AnimatePresence>
      </div>
    );
  }

  // ─── Chat — TOČNA kopija ChatConversation.tsx strukture ───────────────────
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="max-w-[390px] mx-auto w-full h-full flex flex-col">

        {/* Header — točno kot ChatConversation */}
        <div className="bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] px-4 py-3 flex items-center gap-3 shadow-lg">
          <button onClick={isTherapist ? () => setShowEndConfirm(true) : onLeaveSession}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-white">{otherPersonName}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/80 text-xs">In Session · {timerDisplay}</p>
            </div>
          </div>
          {isTherapist && (
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowEndConfirm(true)}
              className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
              End
            </motion.button>
          )}
        </div>

        {/* Messages — točno kot ChatConversation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-24">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Session started. Say hello! 👋</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.uid;
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                  {!isMe && <p className="text-xs text-muted-foreground mb-1">{msg.senderName}</p>}
                  <div className={`px-4 py-3 rounded-2xl ${
                    isMe
                      ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white rounded-br-sm'
                      : 'bg-card text-foreground shadow-md rounded-bl-sm'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar — točno kot ChatConversation */}
        <div className="bg-card border-t border-[var(--border)] px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center">
                <Smile className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSend}
              disabled={!inputText.trim() || isSending}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center shadow-lg disabled:opacity-40">
              <Send className="w-5 h-5 text-white" />
            </motion.button>
            <button className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Mic className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEndConfirm && <EndConfirmModal onCancel={() => setShowEndConfirm(false)} onConfirm={handleEndSession} />}
        {showSessionEndedModal && <SessionEndedModal onLeave={onLeaveSession} />}
      </AnimatePresence>
    </div>
  );
}