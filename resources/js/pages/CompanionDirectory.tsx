import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CompanionDirectory() {
    const { data: companions, isLoading } = useQuery({
        queryKey: ['companions'],
        queryFn: async () => {
            // Mock API for now
            return [
                { id: 1, name: 'Sokha R.', rate: 150, language: 'EN, KM', verified: true, role: 'Wedding Plus-One', rating: 4.8 },
                { id: 2, name: 'Chan T.', rate: 50, language: 'EN, ZH', verified: true, role: 'Corporate Fixer', rating: 4.9 },
                { id: 3, name: 'Bopha K.', rate: 25, language: 'FR, KM', verified: false, role: 'Cultural Translator', rating: 4.5 },
                { id: 4, name: 'Vannak S.', rate: 200, language: 'EN, JA', verified: true, role: 'VIP Escort', rating: 5.0 },
                { id: 5, name: 'Malis C.', rate: 80, language: 'EN, KO', verified: true, role: 'Tour Guide', rating: 4.7 },
            ];
        }
    });

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 md:px-0">
            {/* Header Area */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-12 text-center"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-gold-gradient tracking-tight drop-shadow-sm font-['Outfit']">
                    The Directory
                </h1>
                <p className="text-slate-400 mt-3 text-lg">Curated professionals for your exact needs.</p>
            </motion.div>

            {/* Anti-Swipe Vertical List */}
            <div className="flex flex-col space-y-8">
                {isLoading ? (
                    <div className="text-center text-slate-400 animate-pulse text-lg">Loading Directory...</div>
                ) : (
                    companions?.map((comp, index) => (
                        <motion.div 
                            key={comp.id} 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="relative overflow-hidden glass-card rounded-2xl p-6 shadow-2xl transition-all duration-300 group"
                        >
                            {/* Glassmorphism gradient effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
                                {/* Avatar / Placeholder */}
                                <div className="w-24 h-24 shrink-0 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-500 shadow-inner flex items-center justify-center text-3xl font-bold text-white tracking-widest overflow-hidden group-hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-shadow">
                                    {comp.name.charAt(0)}
                                </div>
                                
                                {/* Info Container */}
                                <div className="flex-1 text-center md:text-left space-y-2">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                        <h3 className="text-2xl font-bold text-slate-100 font-['Outfit'] tracking-wide">
                                            {comp.name} 
                                            {comp.verified && (
                                                <span className="inline-flex ml-2 items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 align-middle">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                    KYC
                                                </span>
                                            )}
                                        </h3>
                                        <div className="mt-2 md:mt-0 flex flex-col items-center md:items-end">
                                            <div className="text-2xl font-black text-gold-gradient">
                                                ${comp.rate}<span className="text-sm font-normal text-slate-400">/hr</span>
                                            </div>
                                            <div className="text-sm text-yellow-500 flex items-center mt-1">
                                                <span className="mr-1">★</span> {comp.rating}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-300 font-medium">{comp.role}</p>
                                    
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                                        {comp.language.split(', ').map(l => (
                                            <span key={l} className="px-3 py-1 bg-slate-800/80 border border-slate-600/50 text-slate-300 rounded-full text-xs uppercase tracking-wider font-semibold">
                                                {l}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* CTA */}
                            <div className="relative z-10 mt-6 pt-6 border-t border-slate-700/50">
                                <Link 
                                    to={`/bookings/new/${comp.id}`} 
                                    className="block w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#FFD700] text-[#0F0F23] text-center rounded-xl font-bold tracking-wide shadow-lg transition-all duration-300 group-hover:scale-[1.01]"
                                >
                                    Engage Ambassador
                                </Link>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
            
            {/* End of list indicator to enforce intentional scrolling */}
            <div className="text-center py-12 text-slate-500 text-sm tracking-widest font-semibold opacity-50">
                END OF DIRECTORY
            </div>
        </div>
    );
}