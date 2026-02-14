import React from 'react';
import { ShoppingCart, Check } from 'lucide-react';

/**
 * AddToShoppingListButton - Button zum Hinzufügen zur Einkaufsliste
 * 
 * Zeigt Erfolgs-State mit Check-Icon
 * 
 * Props:
 * @param {function} onClick - Callback beim Klick
 * @param {boolean} showSuccess - Zeigt Erfolgs-State
 */
const AddToShoppingListButton = ({ onClick, showSuccess }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-semibold shadow-md"
    >
      {showSuccess ? (
        <>
          <Check className="w-5 h-5" />
          Zur Einkaufsliste hinzugefügt!
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Zur Einkaufsliste hinzufügen
        </>
      )}
    </button>
  );
};

export default AddToShoppingListButton;