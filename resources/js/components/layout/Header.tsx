// ---------------------------------------------------------------------------
// Header — Top bar with logo, locale switcher, notifications, avatar
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Globe, LogOut, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@lib/cn';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [locale, setLocale] = useState<'EN' | 'KM'>('EN');
  const navigate = useNavigate();

  // Placeholder user — will be replaced by auth store
  const user = JSON.parse(localStorage.getItem('chulx_user') ?? '{"name":"User","email":"user@chulx.com"}');
  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem('chulx_token');
    localStorage.removeItem('chulx_user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0F0F23]/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
            Chulx
          </span>
        </Link>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Locale toggle */}
          <button
            onClick={() => setLocale((l) => (l === 'EN' ? 'KM' : 'EN'))}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-[#E8E8E8]/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">{locale}</span>
          </button>

          {/* Notification bell */}
          <button className="relative rounded-lg p-2 text-[#E8E8E8]/70 transition-colors hover:bg-white/5 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#D4AF37]" />
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-sm font-bold text-[#0F0F23] transition-shadow hover:shadow-lg hover:shadow-[#D4AF37]/20"
            >
              {initials}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/[0.06] bg-[#1A1A3E] shadow-2xl"
                >
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-[#E8E8E8]/50">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <DropdownItem icon={<User className="h-4 w-4" />} label="Profile" href="/profile" />
                    <DropdownItem icon={<Settings className="h-4 w-4" />} label="Settings" href="/settings" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E8E8E8] transition-colors hover:bg-white/5"
    >
      {icon}
      {label}
    </Link>
  );
}
