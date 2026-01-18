import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { menuItemsData } from '../assets/assets';

const MenuItems = ({ setSideBarOpen, appData }) => {
  const location = useLocation();

  // Add badges for items with notifications (customize paths as needed)
  const getBadgeCount = (path) => {
    if (path.includes('messages')) return appData?.newMessages || 0;
    if (path.includes('likes') || path.includes('notifications')) return appData?.notificationsCount || 0;
    return 0;
  };

  return (
    <div className="px-6 text-gray-700 dark:text-gray-300 space-y-2 font-medium mb-8">
      {menuItemsData.map(({ to, label, Icon }) => {
        const badgeCount = getBadgeCount(to);
        const isActive = location.pathname === to || location.pathname.startsWith(to);

        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/feed/home'}
            onClick={() => setSideBarOpen?.(false)}
            className={({ isActive: navActive }) =>
              `px-4 py-3 flex items-center gap-4 rounded-2xl transition-all duration-200 group hover:shadow-md hover:-translate-x-1 ${
                navActive || isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-social hover:shadow-primary/40 hover:scale-[1.02]'
                  : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary dark:hover:text-accent'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-6 h-6 flex-shrink-0" />
              {badgeCount > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </div>
              )}
            </div>
            <span className="font-semibold text-sm whitespace-nowrap">{label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default MenuItems;
