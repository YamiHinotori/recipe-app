import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { UtensilsCrossed, ShoppingCart, CalendarDays, Settings } from 'lucide-react';
import { useShoppingList } from '../../context/ShoppingListContext';

/**
 * BottomNav - Mobile-only Navigationsleiste am unteren Bildschirmrand
 *
 * Zeigt sich nur auf kleinen Bildschirmen (md:hidden).
 * Navigiert zwischen Rezepten, Einkaufsliste, Wochenplaner und Einstellungen.
 * Zeigt Badge mit offenen Einkaufslisteneinträgen.
 */
const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { items } = useShoppingList();

  const uncheckedCount = items.filter(i => !i.checked).length;

  const tabs = [
    { icon: UtensilsCrossed, label: 'Rezepte',        to: '/' },
    { icon: ShoppingCart,    label: 'Einkauf',        to: '/shopping-list', badge: uncheckedCount },
    { icon: CalendarDays,    label: 'Wochenplan',     to: '/wochenplaner' },
    { icon: Settings,        label: 'Einstellungen',  to: '/settings' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ icon: Icon, label, to, badge }) => {
        const isActive = pathname === to;
        return (
          <button
            key={to}
            onClick={() => navigate(to)}
            aria-label={label}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              isActive ? 'text-orange-500' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className={`text-xs font-medium ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
