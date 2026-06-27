import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0F23] p-4 font-sans text-white relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37]/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-[#8B6E32]/10 blur-[100px]" />
      
      <div className="w-full max-w-lg space-y-8 rounded-3xl bg-[#1A1A3E]/40 p-10 shadow-2xl backdrop-blur-xl border border-white/10 text-center relative z-10">
        
        {/* Animated 404 text */}
        <div className="relative">
          <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] to-[#F3E5AB] opacity-90 drop-shadow-lg">
            404
          </h1>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Page Not Found
          </h2>
          <p className="text-sm text-[#E8E8E8]/70 leading-relaxed max-w-sm mx-auto">
            It looks like you've wandered into an unfamiliar area. The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          
          <Link
            to="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] px-6 py-3 text-sm font-semibold text-[#0F0F23] transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}