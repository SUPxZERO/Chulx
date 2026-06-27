import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Clock, AlertTriangle, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function ActiveBooking() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [totpUri, setTotpUri] = useState('');
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [extendHours, setExtendHours] = useState(1);
    const [extensionError, setExtensionError] = useState<string | null>(null);

    // Fetch full booking details
    const { data: booking, isLoading, refetch } = useQuery({
        queryKey: ['booking', bookingId],
        queryFn: async () => {
            const res = await api.get(`/bookings/${bookingId}`);
            return res.data.data;
        },
        refetchInterval: (query) => {
            const status = query.state?.data?.status;
            // Poll frequently if pending or in progress (to catch extension updates)
            return (status === 'PENDING' || status === 'IN_PROGRESS') ? 5000 : false;
        },
    });

    const extendMutation = useMutation({
        mutationFn: async (payload: { additional_hours: number }) => {
            const res = await api.post(`/bookings/${bookingId}/extensions`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
            setIsExtendModalOpen(false);
            setExtensionError(null);
        },
        onError: (err: any) => {
            setExtensionError(err.response?.data?.message || 'Failed to request extension.');
        }
    });

    const respondExtensionMutation = useMutation({
        mutationFn: async ({ extensionId, action }: { extensionId: number, action: 'accept' | 'reject' }) => {
            const res = await api.post(`/bookings/${bookingId}/extensions/${extensionId}/${action}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
        }
    });

    useEffect(() => {
        // Listen to Reverb WebSockets for immediate update
        if (window.Echo && bookingId) {
            const channel = window.Echo.private(`booking.${bookingId}`);
            channel.listen('BookingFunded', () => refetch());
            channel.listen('ExtensionRequested', () => refetch());
            channel.listen('ExtensionResponded', () => refetch());

            return () => {
                channel.stopListening('BookingFunded');
                channel.stopListening('ExtensionRequested');
                channel.stopListening('ExtensionResponded');
            };
        }
    }, [bookingId, refetch]);

    useEffect(() => {
        // Once funded, fetch the TOTP QR URI
        if (booking?.status === 'FUNDED' && !totpUri && user?.role === 'CLIENT') {
            api.post(`/bookings/${bookingId}/totp/generate`)
                .then(res => setTotpUri(res.data.uri))
                .catch(err => console.error("Failed to generate TOTP", err));
        }
    }, [booking?.status, bookingId, totpUri, user?.role]);

    if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
    if (!booking) return <div className="text-center text-white py-20">Booking not found.</div>;

    const status = booking.status;
    const isClient = user?.id === booking.client?.id;
    const isCompanion = user?.id === booking.companion?.id;
    const pendingExtension = booking.extensions?.find((ex: any) => ex.status === 'PENDING');
    
    // Calculate cost for extension modal
    // We assume the companion hourly rate is part of the booking, or we derive it from base_amount / hours.
    // For simplicity, let's just use the booking's base_amount_cents / originally scheduled hours.
    const start = new Date(booking.scheduled_start).getTime();
    const end = new Date(booking.scheduled_end).getTime();
    const originalHours = (end - start) / (1000 * 60 * 60) || 1;
    const hourlyRateCents = booking.base_amount_cents / originalHours;
    const extensionCost = (hourlyRateCents * extendHours) / 100;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 mb-24">
            <AnimatePresence mode="wait">
                {status === 'PENDING' && (
                    <motion.div 
                        key="pending"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="rounded-3xl p-10 text-center shadow-2xl bg-[#0F0F23]/80 border border-white/10 backdrop-blur-xl"
                    >
                        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold text-white mb-2">Awaiting Escrow Transfer</h2>
                        <p className="text-white/60">Please complete the ABA Payway transaction. We are monitoring the ledger securely.</p>
                    </motion.div>
                )}

                {status === 'FUNDED' && (
                    <motion.div 
                        key="funded"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="rounded-3xl p-8 text-center shadow-2xl bg-[#0F0F23]/80 border border-white/10 backdrop-blur-xl"
                    >
                        <div className="inline-flex items-center justify-center bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-green-500/30">
                            <CheckCircle className="w-4 h-4 mr-2" /> ESCROW SECURED
                        </div>
                        <h1 className="text-3xl font-bold mb-4 text-white">Offline Handshake</h1>
                        
                        {isClient ? (
                            <>
                                <p className="text-white/70 mb-8 max-w-md mx-auto">
                                    Present this encrypted QR code to your companion upon arrival. They must scan it offline to verify GPS coordinates and unlock the session.
                                </p>
                                {totpUri ? (
                                    <div className="bg-white p-4 rounded-xl inline-block mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                        <QRCode value={totpUri} size={220} />
                                    </div>
                                ) : (
                                    <div className="h-[252px] flex items-center justify-center text-white/50"><Spinner /></div>
                                )}
                                <div className="text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 inline-flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                                    Do not share this screen with anyone else.
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-white/70 mb-8 max-w-md mx-auto">
                                    Awaiting client arrival. Please use the built-in scanner to scan the client's secure QR code to unlock the session.
                                </p>
                                <Button>Open QR Scanner</Button>
                            </>
                        )}
                    </motion.div>
                )}

                {status === 'IN_PROGRESS' && (
                    <motion.div 
                        key="in_progress"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl p-0 overflow-hidden shadow-2xl bg-[#0F0F23] border border-white/10"
                    >
                        <div className="bg-gradient-to-r from-[#1A1A3E] to-[#0F0F23] p-6 border-b border-white/10 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
                            <div className="relative z-10">
                                <h1 className="text-2xl font-bold text-white">Active Session</h1>
                                <div className="text-green-400 text-sm flex items-center mt-1 font-medium">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
                                    Billing Clock Running
                                </div>
                            </div>
                            
                            {isClient && !pendingExtension && (
                                <Button size="sm" variant="outline" onClick={() => setIsExtendModalOpen(true)}>
                                    <Clock className="w-4 h-4 mr-2" /> Extend Time
                                </Button>
                            )}
                        </div>

                        {pendingExtension && (
                            <div className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                    <div className="flex items-center text-[#D4AF37] mb-3 sm:mb-0">
                                        <Clock className="w-5 h-5 mr-3 animate-pulse" />
                                        <div>
                                            <p className="font-semibold text-sm">Extension Requested</p>
                                            <p className="text-xs text-[#D4AF37]/70">
                                                {isClient ? 'Waiting for companion to review...' : `Client requested +${pendingExtension.additional_hours} hours.`}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {isCompanion && (
                                        <div className="flex space-x-2">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="text-red-400 hover:bg-red-400/10"
                                                onClick={() => respondExtensionMutation.mutate({ extensionId: pendingExtension.id, action: 'reject' })}
                                                loading={respondExtensionMutation.isPending}
                                            >
                                                Reject
                                            </Button>
                                            <Button 
                                                size="sm"
                                                onClick={() => respondExtensionMutation.mutate({ extensionId: pendingExtension.id, action: 'accept' })}
                                                loading={respondExtensionMutation.isPending}
                                            >
                                                Accept
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="bg-black/30 p-5 rounded-2xl text-left mb-6 border border-white/5">
                                <h3 className="font-semibold text-white mb-3 flex items-center">
                                    <ShieldCheck className="w-4 h-4 mr-2 text-[#D4AF37]" /> Secure Chat
                                </h3>
                                <div className="text-xs bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 mb-4 flex items-start">
                                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                    All communication is monitored by our Lexicon Filter. Inappropriate language results in permanent ban and loss of escrow.
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Type a message..." className="flex-1 bg-white/5 border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-sm text-white outline-none transition-colors" />
                                    <Button>Send</Button>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-xl flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all duration-300 hover:scale-[1.02]">
                                <AlertTriangle className="w-5 h-5 animate-pulse" />
                                <span>END EARLY / RAISE DISPUTE</span>
                            </button>
                        </div>
                    </motion.div>
                )}
                
                {status === 'COMPLETED' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl p-10 text-center shadow-2xl bg-[#0F0F23]/80 border border-white/10 backdrop-blur-xl"
                    >
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Session Completed</h2>
                        <p className="text-white/60 mb-6">The booking has concluded successfully.</p>
                        <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Extend Modal for Client */}
            <Modal isOpen={isExtendModalOpen} onClose={() => setIsExtendModalOpen(false)} title="Extend Session">
                <div className="space-y-6">
                    {extensionError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {extensionError}
                        </div>
                    )}
                    
                    <p className="text-sm text-white/70">
                        Select how many additional hours you would like to request. Escrow will automatically secure the funds.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Additional Hours</label>
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" onClick={() => setExtendHours(Math.max(1, extendHours - 1))}>-</Button>
                            <span className="text-2xl font-bold text-white w-12 text-center">{extendHours}</span>
                            <Button variant="outline" onClick={() => setExtendHours(extendHours + 1)}>+</Button>
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/60">Hourly Rate</span>
                            <span className="text-white">${(hourlyRateCents / 100).toFixed(2)} / hr</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                            <span className="text-white">Additional Escrow Required</span>
                            <span className="text-[#D4AF37]">${extensionCost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                        <Button variant="ghost" onClick={() => setIsExtendModalOpen(false)}>Cancel</Button>
                        <Button 
                            loading={extendMutation.isPending}
                            onClick={() => extendMutation.mutate({ additional_hours: extendHours })}
                        >
                            Confirm Extension
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
