// ---------------------------------------------------------------------------
// BottomNav — Mobile bottom navigation (md:hidden)
// ---------------------------------------------------------------------------

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@lib/cn';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Home',     to: '/dashboard',   icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Search',   to: '/companions',  icon: <Search className="h-5 w-5" /> },
  { label: 'Bookings', to: '/bookings',    icon: <Calendar className="h-5 w-5" /> },
  { label: 'Profile',  to: '/profile',     icon: <User className="h-5 w-5" /> },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0F0F23]/90 backdrop-blur-lg md:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className="group relative flex flex-col items-center gap-0.5"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-indicator"
                    className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#D4AF37]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span
                  className={cn(
                    'transition-colors duration-200',
                    isActive ? 'text-[#D4AF37]' : 'text-[#E8E8E8]/40 group-hover:text-[#E8E8E8]/70',
                  )}
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors duration-200',
                    isActive ? 'text-[#D4AF37]' : 'text-[#E8E8E8]/40 group-hover:text-[#E8E8E8]/70',
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
