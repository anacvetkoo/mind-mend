import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageCircle } from 'lucide-react';

interface VideoCallScreenProps {
  therapistName: string;
  therapistAvatar: string;
  onEndCall: () => void;
}

export function VideoCallScreen({ therapistName, therapistAvatar, onEndCall }: VideoCallScreenProps) {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [showControls]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50"
      onClick={() => setShowControls(true)}
    >
      <div className="max-w-[390px] mx-auto w-full h-full relative">
        {/* Therapist Video Feed (Main) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center">
          {/* Video Placeholder */}
          <img
            src={therapistAvatar}
            alt={therapistName}
            className="w-full h-full object-cover"
          />

          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        </div>

        {/* User Self-View (Picture-in-Picture) */}
        <motion.div
          drag
          dragConstraints={{ left: -150, right: 150, top: -300, bottom: 300 }}
          className="absolute top-6 right-6 w-24 h-32 bg-gradient-to-br from-[var(--muted-blue)] to-[var(--soft-purple)] rounded-2xl shadow-2xl overflow-hidden border-2 border-white/50"
        >
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white/60" />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <p className="text-white text-xs">You</p>
            </div>
          )}
        </motion.div>

        {/* Top Overlay - Name and Timer */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 p-6 text-center"
            >
              <h2 className="text-white text-xl mb-1">{therapistName}</h2>
              <p className="text-white/80 text-sm font-mono">{formatTime(seconds)}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 p-6 pb-24"
            >
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isMuted ? 'bg-red-500' : 'bg-white/20 backdrop-blur-xl'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isVideoOff ? 'bg-red-500' : 'bg-white/20 backdrop-blur-xl'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onEndCall}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-2xl"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
                >
                  <MessageCircle className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}