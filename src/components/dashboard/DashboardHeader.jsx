import React from 'react';
import { Settings, ShoppingCart, Calendar } from 'lucide-react';

/**
 * DashboardHeader - Header-Bereich des Dashboards
 * 
 * Zeigt Titel, Rezeptanzahl, User-Info und Aktions-Buttons
 * 
 * Props:
 * @param {object} user - Angemeldeter Benutzer
 * @param {number} recipeCount - Anzahl der angezeigten Rezepte
 * @param {number} uncheckedItemsCount - Anzahl offener Einkaufslisteneinträge
 * @param {function} onAdminClick - Callback für Admin-Button
 * @param {function} onShoppingListClick - Callback für Einkaufslisten-Button
 * @param {function} onWochenplanerClick - Callback für Wochenplaner-Button
 * @param {function} onLogoutClick - Callback für Abmelden-Button
 */
const DashboardHeader = ({
  user,
  recipeCount,
  uncheckedItemsCount,
  onAdminClick,
  onShoppingListClick,
  onWochenplanerClick
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Titel und Aktions-Buttons */}
        <div className="flex items-center justify-between mb-4">
          
          {/* Titel-Bereich */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Rezepte
            </h1>
            <p className="text-gray-600">
              {recipeCount} {recipeCount === 1 ? 'Rezept' : 'Rezepte'} gefunden
            </p>
          </div>
          
          {/* Aktions-Buttons – auf Mobile alles über Bottom-Nav erreichbar */}
          <div className="hidden md:flex items-center gap-3">

            {/* Einstellungen */}
            <button
              onClick={onAdminClick}
              className="bg-violet-500 text-white p-3 rounded-full hover:bg-violet-600 transition-colors shadow-lg"
              title="Einstellungen"
              aria-label="Einstellungen öffnen"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Wochenplaner */}
            <button
              onClick={onWochenplanerClick}
              className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
              title="Wochenplaner"
              aria-label="Wochenplaner öffnen"
            >
              <Calendar className="w-5 h-5" />
            </button>

            {/* Einkaufsliste mit Badge */}
            <button
              onClick={onShoppingListClick}
              className="relative bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors shadow-lg"
              title="Einkaufsliste"
              aria-label={`Einkaufsliste öffnen (${uncheckedItemsCount} offene Einträge)`}
            >
              <ShoppingCart className="w-6 h-6" />
              {uncheckedItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {uncheckedItemsCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* User-Info */}
        {user && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            
            {/* Profilbild (falls vorhanden) */}
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt={user.displayName}
                className="w-6 h-6 rounded-full"
              />
            )}
            
            {/* Benutzername oder E-Mail */}
            <span>
              Angemeldet als {user.displayName || user.email}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;