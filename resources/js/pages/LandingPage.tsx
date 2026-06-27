import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Star, Lock, MapPin, Calendar, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

export default function LandingPage() {
    const { isAuthenticated } = useAuthStore();

    return (
        <div className="min-h-screen bg-[#0A0A16] text-white overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
            
            {/* Nav */}
            <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-[#0F0F23]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#AA8B22] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                                <span className="font-bold text-black text-xl font-['Outfit']">C</span>
                            </div>
                            <span className="text-2xl font-bold font-['Outfit'] tracking-wider text-white">CHULX</span>
                        </div>
                        <div className="flex items-center space-x-6">
                            {isAuthenticated ? (
                                <Link to="/dashboard">
                                    <Button>Go to Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-white/80 hover:text-white transition-colors font-medium">Log In</Link>
                                    <Link to="/register">
                                        <Button>Become a Member</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-sm font-semibold tracking-wider uppercase mb-6">
                            Elite Companion Network
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold font-['Outfit'] mb-8 leading-tight">
                            Elevate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">Social Experience.</span>
                        </h1>
                        <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Discover curated, verified companions for exclusive events, elite travel, and luxurious dinners. Fully discreet. Secured by Smart Escrow.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <Link to="/register">
                                <Button size="lg" className="px-8 text-lg w-full sm:w-auto">
                                    Explore Companions
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="lg" variant="outline" className="px-8 text-lg w-full sm:w-auto border-white/20 hover:bg-white/5">
                                    Apply to Earn
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Client Features */}
            <section className="py-24 bg-gradient-to-b from-[#0F0F23] to-[#0A0A16] border-y border-white/5 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold font-['Outfit'] mb-4 text-white">For the Discerning Client</h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">An experience engineered for absolute privacy and luxury.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                            <div className="w-14 h-14 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mb-6">
                                <Star className="w-7 h-7 text-[#D4AF37]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Curated Selection</h3>
                            <p className="text-white/60 leading-relaxed">Every companion on our network undergoes strict KYC verification. Browse elite profiles with confidence.</p>
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                            <div className="w-14 h-14 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mb-6">
                                <Lock className="w-7 h-7 text-[#D4AF37]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Ironclad Privacy</h3>
                            <p className="text-white/60 leading-relaxed">No tracking, no history, no trace. Secure TOTP QR codes verify meetings offline without leaking GPS data.</p>
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                            <div className="w-14 h-14 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mb-6">
                                <Shield className="w-7 h-7 text-[#D4AF37]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Escrow Protection</h3>
                            <p className="text-white/60 leading-relaxed">Funds are securely locked in smart escrow until the session completes. Dispute protection guarantees your peace of mind.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Companion Features */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold font-['Outfit'] mb-6 text-white">Empowering Independent Companions</h2>
                            <p className="text-white/60 text-lg mb-8 leading-relaxed">
                                Take control of your time, rates, and safety. Chulx provides the ultimate platform for premium providers to scale their business securely.
                            </p>
                            
                            <ul className="space-y-6">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mr-4">
                                        <Shield className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">Guaranteed Payouts</h4>
                                        <p className="text-white/50 mt-1">Clients pre-fund the escrow. No more no-shows or payment disputes.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mr-4">
                                        <MapPin className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">Custom Service Areas</h4>
                                        <p className="text-white/50 mt-1">Draw exactly where you want to work on a map. You set your boundaries.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mr-4">
                                        <Calendar className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">Flexible Scheduling</h4>
                                        <p className="text-white/50 mt-1">Automated calendar management and precise hourly rate controls.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent rounded-3xl transform rotate-3 scale-105 blur-sm" />
                            <div className="relative bg-[#0F0F23] border border-white/10 rounded-3xl p-8 shadow-2xl">
                                <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
                                    <div>
                                        <p className="text-white/50 text-sm">Wallet Balance</p>
                                        <p className="text-4xl font-bold text-white mt-1">$4,250.00</p>
                                    </div>
                                    <Button size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Withdraw</Button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                                                <Clock className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Session Completed</p>
                                                <p className="text-white/50 text-xs">Today, 2:00 PM</p>
                                            </div>
                                        </div>
                                        <span className="text-green-400 font-bold">+$300.00</span>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mr-3">
                                                <Clock className="w-5 h-5 text-[#D4AF37]" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Time Extension</p>
                                                <p className="text-white/50 text-xs">Yesterday, 11:30 PM</p>
                                            </div>
                                        </div>
                                        <span className="text-green-400 font-bold">+$150.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-[#05050A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#AA8B22] rounded-lg flex items-center justify-center">
                            <span className="font-bold text-black text-sm font-['Outfit']">C</span>
                        </div>
                        <span className="text-xl font-bold font-['Outfit'] tracking-wider text-white">CHULX</span>
                    </div>
                    <p className="text-white/40 text-sm">© 2026 Chulx Elite Network. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
