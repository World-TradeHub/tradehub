import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid3X3, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { it } from 'node:test';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/categories', icon: Grid3X3, label: 'Categories' },
  // { to: 'https://world.org/chat', icon: MessageCircle, label: 'Chat',isExternal: true },
  { to: '/profile', icon: User, label: 'Profile' },
];

const disabledRoutes = [];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

   const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: typeof navItems[0]
  ) => {
    if (disabledRoutes.includes(item.to)) {
      e.preventDefault(); // stop react-router from navigating
      toast.info('Coming soon',{ duration: 1000 }); // show your message (toast, alert, modal, etc.)
    }
    // if (item.isExternal) {
    //   e.preventDefault(); // STOP React Router from changing the internal URL
    //   window.open(item.to,'_top'); // Trigger the external app switch
    //   return;
    // }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const { to, icon: Icon, label } = item
          const isActive = location.pathname === to || 
            (to !== '/' && location.pathname.startsWith(to));
          
          return (
            <NavLink
              key={to}
              to={to}
              onClick={(e) => handleClick(e, item)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-2",
                "transition-colors duration-200 rounded-lg",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};