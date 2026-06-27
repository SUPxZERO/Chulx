import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import QrGenerator from '../components/totp/QrGenerator';
import QrScanner from '../components/totp/QrScanner';
import axios from 'axios';

export default function MeetingHandshake() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState<'client' | 'companion' | null>(null);

    useEffect(() => {
        // Fetch current user details or booking details to determine role
        axios.get(`/api/user`)
            .then(res => {
                setUserRole(res.data.role || 'client'); // default fallback
            })
            .catch(err => {
                console.error("Failed to fetch user role", err);
                // For demo purposes, we fallback to client if api fails
                setUserRole('client');
            });
    }, []);

    const handleVerified = () => {
        // Navigate back to chat or show success state
        setTimeout(() => {
            navigate(`/bookings/${id}/chat`);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#0F0F23] text-white p-4 md:p-8 flex flex-col font-sans relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col z-10">
                <div className="flex items-center justify-between mb-12">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Return to Booking</span>
                    </button>
                    
                    <div className="flex items-center gap-2 text-[#D4AF37]">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium tracking-wider uppercase">Secure Handshake</span>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4AF37] to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 mb-6"
                    >
                        <ShieldCheck className="w-8 h-8 text-[#0F0F23]" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-3">Identity Verification</h1>
                    <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                        To ensure the safety of both parties, please verify the secure meeting code before proceeding with the session.
                    </p>
                </div>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 flex flex-col justify-center pb-20"
                >
                    {!userRole ? (
                        <div className="text-center text-[#D4AF37] animate-pulse">
                            Loading security protocols...
                        </div>
                    ) : userRole === 'client' ? (
                        <QrGenerator bookingId={id || ''} />
                    ) : (
                        <QrScanner bookingId={id || ''} onVerified={handleVerified} />
                    )}
                </motion.div>
            </div>
        </div>
    );
}
