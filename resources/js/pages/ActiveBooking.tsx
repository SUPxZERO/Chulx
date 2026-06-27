import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActiveBooking() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    
    const [totpUri, setTotpUri] = useState('');

    // Poll payment status every 5 seconds until FUNDED
    const { data: statusData, refetch: refetchStatus } = useQuery({
        queryKey: ['booking-status', bookingId],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/bookings/${bookingId}/payment-status`);
            return res.data;
        },
        refetchInterval: (query) => {
            const status = query.state?.data?.status;
            return status === 'PENDING' ? 5000 : false;
        },
    });

    const status = statusData?.status || 'PENDING';

    useEffect(() => {
        // Listen to Reverb WebSockets for immediate update
        if (window.Echo && bookingId) {
            const channel = window.Echo.private(`booking.${bookingId}`);
            channel.listen('BookingFunded', (e: any) => {
                // Instantly update UI without waiting for next poll
                refetchStatus();
            });

            return () => {
                channel.stopListening('BookingFunded');
            };
        }
    }, [bookingId, refetchStatus]);

    useEffect(() => {
        // Once funded, fetch the TOTP QR URI
        if (status === 'FUNDED' && !totpUri) {
            axios.post(`/api/v1/bookings/${bookingId}/totp/generate`)
                .then(res => setTotpUri(res.data.uri))
                .catch(err => console.error("Failed to generate TOTP", err));
        }
    }, [status, bookingId, totpUri]);

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <AnimatePresence mode="wait">
                {status === 'PENDING' && (
                    <motion.div 
                        key="pending"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass-card rounded-2xl p-10 text-center shadow-2xl"
                    >
                        <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold text-slate-100 font-['Outfit'] mb-2">Awaiting Escrow Transfer</h2>
                        <p className="text-slate-400">Please complete the ABA Payway transaction. We are monitoring the ledger securely.</p>
                    </motion.div>
                )}

                {status === 'FUNDED' && (
                    <motion.div 
                        key="funded"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card rounded-2xl p-8 text-center shadow-2xl"
                    >
                        <div className="inline-block bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm font-bold mb-6 border border-green-500/30">
                            ✓ ESCROW SECURED
                        </div>
                        <h1 className="text-3xl font-bold mb-4 text-slate-100 font-['Outfit']">Offline Handshake</h1>
                        <p className="text-slate-300 mb-8 max-w-md mx-auto">
                            Present this encrypted QR code to your companion upon arrival. They must scan it offline to verify GPS coordinates and unlock the session.
                        </p>

                        {totpUri ? (
                            <div className="bg-white p-4 rounded-xl inline-block mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <QRCode value={totpUri} size={220} />
                            </div>
                        ) : (
                            <div className="h-[252px] flex items-center justify-center text-slate-500">Generating Secure QR...</div>
                        )}
                        
                        <div className="text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 inline-block">
                            Do not share this screen with anyone else.
                        </div>
                    </motion.div>
                )}

                {status === 'IN_PROGRESS' && (
                    <motion.div 
                        key="in_progress"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl p-0 overflow-hidden shadow-2xl"
                    >
                        <div className="bg-gradient-to-r from-blue-900 to-navy-900 p-6 border-b border-blue-800 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-100 font-['Outfit']">Active Session</h1>
                                <div className="text-blue-300 text-sm flex items-center mt-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
                                    Billing Clock Running
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="bg-slate-900/80 p-5 rounded-xl text-left mb-6 border border-slate-700/50">
                                <h3 className="font-bold text-slate-200 mb-3 font-['Outfit']">Secure Chat</h3>
                                <div className="text-xs bg-red-900/20 text-red-400 p-3 rounded-lg border border-red-900/30 mb-4 flex items-start">
                                    <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    All communication is monitored by our Lexicon Filter. Inappropriate language results in permanent ban and loss of escrow.
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Type a message..." className="flex-1 bg-slate-800/50 border border-slate-700 focus:border-gold-500 rounded-lg p-3 text-sm text-slate-200 outline-none transition-colors" />
                                    <button className="bg-navy-600 hover:bg-navy-500 text-white px-4 rounded-lg transition-colors">Send</button>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-xl flex justify-center items-center gap-3 shadow-lg shadow-red-900/20 transition-all duration-300 hover:scale-[1.01]">
                                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                <span>PANIC BUTTON — EMERGENCY ONLY</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
