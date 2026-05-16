import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Pause, PhoneOff } from 'lucide-react';
import { OtterMascot } from '../mascot/OtterMascot';

interface CallScreenProps {
  therapistName: string;
  therapistAvatar: string;
  onEndCall: () => void;
}

export function CallScreen({ therapistName, therapistAvatar, onEndCall }: CallScreenProps) {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] z-50 flex items-center justify-center">
      <div className="max-w-[390px] mx-auto w-full h-full flex flex-col items-center justify-between py-12 px-6 pb-24">
        {/* Top Section */}
        <div className="text-center text-white">
          <p className="text-sm mb-2 opacity-90">Voice Call</p>
          <h1 className="text-2xl mb-4">{therapistName}</h1>
        </div>

        {/* Center - Avatar */}
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <img
              src={therapistAvatar}
              alt={therapistName}
              className="w-40 h-40 rounded-full object-cover border-4 border-white/30 shadow-2xl"
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white/50"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <p className="text-white text-3xl mt-8 font-mono">{formatTime(seconds)}</p>

          {/* Otto Support */}
          <div className="absolute bottom-32 left-6">
            <OtterMascot size="sm" emotion="supportive" animate />
          </div>
        </div>

        {/* Bottom - Controls */}
        <div className="w-full">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMuted(!isMuted)}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center ${
                isMuted ? 'bg-red-500' : 'bg-white/20 backdrop-blur-xl'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
              <span className="text-white text-xs mt-1">{isMuted ? 'Unmute' : 'Mute'}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center ${
                isSpeaker ? 'bg-[var(--lavender)]' : 'bg-white/20 backdrop-blur-xl'
              }`}
            >
              {isSpeaker ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
              <span className="text-white text-xs mt-1">Speaker</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOnHold(!isOnHold)}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center ${
                isOnHold ? 'bg-yellow-500' : 'bg-white/20 backdrop-blur-xl'
              }`}
            >
              <Pause className="w-6 h-6 text-white" />
              <span className="text-white text-xs mt-1">Hold</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onEndCall}
              className="w-16 h-16 rounded-full bg-red-500 flex flex-col items-center justify-center shadow-lg"
            >
              <PhoneOff className="w-6 h-6 text-white" />
              <span className="text-white text-xs mt-1">End</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}