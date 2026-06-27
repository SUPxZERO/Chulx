import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function BookingFlow() {
    const { companionId } = useParams();
    const navigate = useNavigate();
    
    // Legal friction state
    const [publicSpace, setPublicSpace] = useState(false);
    const [noContact, setNoContact] = useState(false);
    const [antiVice, setAntiVice] = useState(false);

    const canProceed = publicSpace && noContact && antiVice;

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 shadow-xl">
                <h1 className="text-2xl font-bold mb-6 text-slate-100 border-b border-slate-700 pb-4">
                    Booking Request
                </h1>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gold-400 mb-4">1. Venue Selection</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        Search for a public venue. Note: Hotels, residential addresses, and private rooms are strictly blocked by our spatial enforcement engine.
                    </p>
                    <input 
                        type="text" 
                        placeholder="Search Google Maps for a public venue..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100"
                    />
                </div>

                <div className="mb-8 bg-slate-900 p-6 rounded-lg border border-red-900/30">
                    <h2 className="text-lg font-semibold text-red-400 mb-4">2. Mandatory Compliance Agreements</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        By law, this platform operates strictly as a professional networking and event companion service. You must manually agree to the following terms.
                    </p>
                    
                    <div className="space-y-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mt-1 w-5 h-5 accent-navy-500" 
                                checked={publicSpace}
                                onChange={(e) => setPublicSpace(e.target.checked)}
                            />
                            <span className="text-slate-300">
                                <strong>Public Spaces Only:</strong> I agree that this booking will take place entirely in a verifiable public space.
                            </span>
                        </label>

                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mt-1 w-5 h-5 accent-navy-500" 
                                checked={noContact}
                                onChange={(e) => setNoContact(e.target.checked)}
                            />
                            <span className="text-slate-300">
                                <strong>No Physical Contact:</strong> I understand that any physical contact beyond a professional handshake or traditional Sampeah greeting is strictly prohibited and grounds for immediate termination.
                            </span>
                        </label>

                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mt-1 w-5 h-5 accent-navy-500" 
                                checked={antiVice}
                                onChange={(e) => setAntiVice(e.target.checked)}
                            />
                            <span className="text-slate-300">
                                <strong>Anti-Vice Policy:</strong> I confirm this booking does not violate the Cambodian Law on Suppression of Human Trafficking and Sexual Exploitation. Any violation results in escrow forfeiture and reporting.
                            </span>
                        </label>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gold-400 mb-4">3. Escrow Payment</h2>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/bookings/1/active')}
                            className={`flex-1 py-3 rounded font-medium ${canProceed ? 'bg-navy-600 hover:bg-navy-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`} 
                            disabled={!canProceed}
                        >
                            Pay via Stripe
                        </button>
                        <button 
                            onClick={() => navigate('/bookings/1/active')}
                            className={`flex-1 py-3 rounded font-medium ${canProceed ? 'bg-[#D32F2F] hover:bg-red-700 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`} 
                            disabled={!canProceed}
                        >
                            Pay via ABA KHQR
                        </button>
                    </div>
                    {!canProceed && <p className="text-red-400 text-sm mt-3 text-center">You must agree to all compliance terms before payment.</p>}
                </div>
            </div>
        </div>
    );
}