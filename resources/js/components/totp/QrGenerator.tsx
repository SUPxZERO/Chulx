import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';

interface QrGeneratorProps {
    bookingId: number | string;
}

export default function QrGenerator({ bookingId }: QrGeneratorProps) {
    const [secret, setSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSecret = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.get(`/api/bookings/${bookingId}/totp-secret`);
            setSecret(res.data.secret);
        } catch (err) {
            setError('Failed to load secure handshake code.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSecret();
        // Refresh TOTP every 30 seconds
        const interval = setInterval(fetchSecret, 30000);
        return () => clearInterval(interval);
    }, [bookingId]);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-[#1A1A3E] rounded-3xl border border-[#D4AF37]/30 shadow-2xl shadow-black/60 max-w-sm w-full mx-auto relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#D4AF37]/20 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-6 text-[#D4AF37]">
                <ShieldCheck className="w-6 h-6" />
                <h2 className="text-xl font-semibold tracking-wide uppercase">Client Code</h2>
            </div>

            <div className="relative w-64 h-64 bg-white p-4 rounded-2xl flex items-center justify-center shadow-inner">
                {isLoading && !secret ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Loader2 className="w-10 h-10 text-[#0F0F23]" />
                    </motion.div>
                ) : error ? (
                    <div className="text-red-500 text-center font-medium">{error}</div>
                ) : secret ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full"
                    >
                        <QRCode
                            value={secret}
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                            fgColor="#0F0F23"
                        />
                    </motion.div>
                ) : null}
            </div>

            <p className="mt-6 text-gray-400 text-sm text-center leading-relaxed">
                Present this code to your companion to verify the meeting and commence the session.
            </p>

            <button 
                onClick={fetchSecret}
                disabled={isLoading}
                className="mt-6 flex items-center gap-2 text-xs text-[#D4AF37] hover:text-white transition-colors"
            >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Code
            </button>
        </div>
    );
}
