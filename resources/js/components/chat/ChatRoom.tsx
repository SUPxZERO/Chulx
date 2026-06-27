import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Shield, MoreVertical, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Message {
    id: number;
    user_id: number;
    body: string;
    created_at: string;
    user?: { id: number; name: string; avatar?: string };
}

interface ChatRoomProps {
    bookingId: number | string;
    currentUser: { id: number; name: string };
}

export default function ChatRoom({ bookingId, currentUser }: ChatRoomProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Fetch initial messages
        axios.get(`/api/bookings/${bookingId}/messages`)
            .then(res => {
                setMessages(res.data.data || res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load messages", err);
                setIsLoading(false);
            });

        // Listen for new messages via Laravel Echo
        const echo = (window as any).Echo;
        let channel: any;
        
        if (echo) {
            channel = echo.private(`booking.${bookingId}`)
                .listen('.MessageSent', (e: { message: Message }) => {
                    setMessages(prev => {
                        if (prev.find(m => m.id === e.message.id)) return prev;
                        return [...prev, e.message];
                    });
                });
        }

        return () => {
            if (channel && echo) {
                echo.leave(`booking.${bookingId}`);
            }
        };
    }, [bookingId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const optimisticMessage: Message = {
            id: Date.now(),
            user_id: currentUser.id,
            body: newMessage,
            created_at: new Date().toISOString(),
            user: currentUser
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');

        try {
            const res = await axios.post(`/api/bookings/${bookingId}/messages`, {
                body: optimisticMessage.body
            });
            // Update the optimistic message with the real one from server
            setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? res.data.message : m));
        } catch (error) {
            console.error("Failed to send message", error);
            // Optionally revert the message or show an error indicator
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-h-[80vh] bg-[#1A1A3E] rounded-2xl overflow-hidden border border-[#D4AF37]/20 shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0F0F23] border-b border-[#D4AF37]/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#1A1A3E] flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Booking #{bookingId}</h3>
                        <p className="text-xs text-[#D4AF37]">End-to-end encrypted</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#1A1A3E] to-[#0F0F23]">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                        No messages yet. Start the conversation.
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                            const isMe = msg.user_id === currentUser.id;
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                        isMe 
                                            ? 'bg-gradient-to-br from-[#D4AF37] to-amber-600 text-[#0F0F23] rounded-tr-sm' 
                                            : 'bg-[#0F0F23] border border-[#D4AF37]/30 text-gray-200 rounded-tl-sm'
                                    }`}>
                                        <p className="text-sm font-medium">{msg.body}</p>
                                        <div className={`text-[10px] mt-1 flex items-center justify-end ${isMe ? 'text-[#0F0F23]/70' : 'text-gray-500'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0F0F23] border-t border-[#D4AF37]/20">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a secure message..."
                        className="flex-1 bg-[#1A1A3E] text-white rounded-full py-3 pl-6 pr-12 border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-gray-600"
                    />
                    <button 
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="absolute right-2 w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0F0F23] disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-400 transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="w-5 h-5 ml-[-2px]" />
                    </button>
                </form>
            </div>
        </div>
    );
}
