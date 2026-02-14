import React from 'react';
import { ChefHat } from 'lucide-react';

/**
 * LoginHeader - Header mit Logo und Willkommenstext
 * 
 * Zeigt ChefHat Icon und Titel
 */
const LoginHeader = () => {
  return (
    <>
      {/* Logo/Icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-orange-100 p-4 rounded-full">
          <ChefHat className="w-12 h-12 text-orange-600" />
        </div>
      </div>

      {/* Titel */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Willkommen zurück!
      </h1>
      
      {/* Untertitel */}
      <p className="text-center text-gray-600 mb-8">
        Melde dich an um deine Rezepte und Einkaufsliste zu synchronisieren
      </p>
    </>
  );
};

export default LoginHeader;