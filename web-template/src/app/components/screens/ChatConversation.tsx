import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Paperclip, Mic, Smile } from 'lucide-react';
import otterImage from '../../../imports/vidra.png';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'therapist' | 'ai';
  timestamp: string;
}

interface ChatConversationProps {
  therapistName?: string;
  therapistAvatar?: string;
  isAI?: boolean;
  onClose: () => void;
}

export function ChatConversation({ therapistName = 'Otto AI', therapistAvatar, isAI = false, onClose }: ChatConversationProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [displayedText, setDisplayedText] = useState<{ [key: number]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hi! How are you feeling today?', sender: isAI ? 'ai' : 'therapist', timestamp: '10:00 AM' },
    { id: 2, text: "I'm feeling a bit anxious about work.", sender: 'user', timestamp: '10:02 AM' },
    { id: 3, text: "I understand. Let's work through that together. Can you tell me more about what's making you anxious?", sender: isAI ? 'ai' : 'therapist', timestamp: '10:03 AM' }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedText]);

  const typewriterEffect = (messageId: number, fullText: string) => {
    let currentIndex = 0;
    setDisplayedText(prev => ({ ...prev, [messageId]: '' }));

    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(prev => ({ ...prev, [messageId]: fullText.slice(0, currentIndex) }));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTypingMessageId(null);
      }
    }, 30); // Adjust speed here (lower = faster)
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyId = messages.length + 2;
      const replyText = 'Thank you for sharing that with me. How can I support you?';
      const reply: Message = {
        id: replyId,
        text: replyText,
        sender: isAI ? 'ai' : 'therapist',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);

      // Start typewriter effect for AI messages
      if (isAI) {
        setTypingMessageId(replyId);
        typewriterEffect(replyId, replyText);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="max-w-[390px] mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] px-4 py-3 flex items-center gap-3 shadow-lg">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {isAI ? (
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center p-1.5">
              <img
                src={otterImage}
                alt="Otto AI"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <img
              src={therapistAvatar || 'https://images.unsplash.com/photo-1594744803145-a7bf00e71852?w=100&h=100&fit=crop'}
              alt={therapistName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
            />
          )}

          <div className="flex-1">
            <h2 className="text-white">{therapistName}</h2>
            <p className="text-white/80 text-xs">Online</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-24">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center p-1">
                      <img
                        src={otterImage}
                        alt="Otto AI"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{therapistName}</span>
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white rounded-br-sm'
                      : 'bg-card text-foreground shadow-md rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">
                    {msg.sender === 'ai' && typingMessageId === msg.id
                      ? displayedText[msg.id] || ''
                      : msg.text}
                    {msg.sender === 'ai' && typingMessageId === msg.id && (
                      <span className="inline-block w-1 h-4 bg-[var(--lavender)] ml-1 animate-pulse" />
                    )}
                  </p>
                </div>
                <p className={`text-xs text-muted-foreground mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-card px-4 py-3 rounded-2xl rounded-bl-sm shadow-md">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-card border-t border-[var(--border)] px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center">
                <Smile className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center shadow-lg"
            >
              <Send className="w-5 h-5 text-white" />
            </motion.button>

            <button className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Mic className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}