import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface QrScannerProps {
    bookingId: number | string;
    onVerified?: () => void;
}

export default function QrScanner({ bookingId, onVerified }: QrScannerProps) {
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;
        
        if (scanState === 'scanning') {
            scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(async (decodedText) => {
                if (scanner) {
                    scanner.pause(true);
                }
                setScanState('verifying');
                
                try {
                    const res = await axios.post(`/api/bookings/${bookingId}/verify-totp`, {
                        code: decodedText
                    });
                    
                    if (res.data.success) {
                        setScanState('success');
                        if (scanner) scanner.clear();
                        if (onVerified) onVerified();
                    } else {
                        throw new Error("Invalid code");
                    }
                } catch (err: any) {
                    setScanState('error');
                    setErrorMessage(err.response?.data?.message || 'Verification failed. Please try again.');
                    setTimeout(() => {
                        setScanState('scanning');
                        if (scanner) scanner.resume();
                    }, 3000);
                }
            }, undefined);
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(console.error);
            }
        };
    }, [scanState, bookingId, onVerified]);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-[#1A1A3E] rounded-3xl border border-[#D4AF37]/30 shadow-2xl shadow-black/60 max-w-sm w-full mx-auto">
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-6 tracking-wide uppercase">Verify Client</h2>
            
            <div className="w-full relative min-h-[300px] flex items-center justify-center bg-[#0F0F23] rounded-2xl overflow-hidden border border-[#D4AF37]/10">
                {scanState === 'idle' && (
                    <button 
                        onClick={() => setScanState('scanning')}
                        className="flex flex-col items-center gap-3 text-[#D4AF37] hover:text-white transition-colors"
                    >
                        <div className="w-16 h-16 rounded-full bg-[#1A1A3E] flex items-center justify-center border border-[#D4AF37]/30 shadow-lg">
                            <Camera className="w-8 h-8" />
                        </div>
                        <span className="font-medium">Tap to Start Scanner</span>
                    </button>
                )}

                <div id="qr-reader" className={`w-full ${scanState === 'scanning' ? 'block' : 'hidden'}`}></div>

                <AnimatePresence>
                    {scanState === 'verifying' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0F0F23]/90 flex flex-col items-center justify-center z-10"
                        >
                            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
                            <p className="text-[#D4AF37] font-medium">Verifying code...</p>
                        </motion.div>
                    )}

                    {scanState === 'success' && (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 bg-green-900/90 flex flex-col items-center justify-center z-10"
                        >
                            <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
                            <p className="text-green-300 font-bold text-lg">Handshake Verified!</p>
                            <p className="text-green-400/80 text-sm mt-2">Session has commenced</p>
                        </motion.div>
                    )}

                    {scanState === 'error' && (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center p-6 text-center z-10"
                        >
                            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                            <p className="text-red-300 font-bold">{errorMessage}</p>
                            <p className="text-red-400/80 text-sm mt-2">Retrying shortly...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {scanState === 'scanning' && (
                <p className="mt-6 text-gray-400 text-sm text-center">
                    Align the client's QR code within the frame to securely verify this meeting.
                </p>
            )}
        </div>
    );
}
