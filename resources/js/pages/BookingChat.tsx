import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatRoom from '../components/chat/ChatRoom';
import SlideToPanic from '../components/ui/SlideToPanic';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function BookingChat() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isPanicking, setIsPanicking] = useState(false);
    
    // In a real app, this would come from an auth context or global state
    const currentUser = { id: 1, name: 'Current User' }; 

    const handlePanic = async () => {
        setIsPanicking(true);
        try {
            await axios.post(`/api/bookings/${id}/panic`);
            // Handle successful panic (e.g. redirect to safe page)
            window.location.href = 'https://google.com';
        } catch (error) {
            console.error("Failed to trigger panic", error);
            setIsPanicking(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F23] text-white p-4 md:p-8 font-sans selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                    
                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 text-sm font-medium">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Monitored Session</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat Section */}
                    <div className="lg:col-span-2">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <ChatRoom bookingId={id || ''} currentUser={currentUser} />
                        </motion.div>
                    </div>

                    {/* Sidebar / Tools */}
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#1A1A3E] rounded-2xl p-6 border border-[#D4AF37]/20 shadow-xl"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">Emergency Tools</h3>
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                If you feel unsafe, use the slider below to immediately alert security and exit this page.
                            </p>
                            
                            <SlideToPanic onActivate={handlePanic} isSubmitting={isPanicking} />
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-[#1A1A3E] to-[#0F0F23] rounded-2xl p-6 border border-[#D4AF37]/10 shadow-xl"
                        >
                            <h3 className="text-[#D4AF37] font-semibold mb-2">Secure Handshake</h3>
                            <p className="text-xs text-gray-400 mb-4">
                                Ensure to verify the identity of your party in person using the TOTP scanner.
                            </p>
                            <button 
                                onClick={() => navigate(`/bookings/${id}/handshake`)}
                                className="w-full py-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-[#0F0F23] transition-all font-medium text-sm"
                            >
                                Open Handshake
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            {/* Full screen panic overlay */}
            <AnimatePresence>
                {isPanicking && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 bg-red-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6"
                    >
                        <ShieldAlert className="w-24 h-24 text-red-400 mb-6 animate-pulse" />
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-widest text-center">EMERGENCY PROTOCOL ACTIVATED</h1>
                        <p className="text-red-200 text-lg text-center max-w-md">
                            Security has been alerted with your last known location. Clearing session data and redirecting to safety...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
