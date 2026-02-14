import React from 'react';

/**
 * RecipeNotFound - Fehlerseite wenn Rezept nicht gefunden
 * 
 * Zeigt Fehlermeldung mit Zurück-Button
 * 
 * Props:
 * @param {function} onBackClick - Callback für Zurück-Button
 */
const RecipeNotFound = ({ onBackClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <p className="text-gray-500 mb-4">
        Rezept nicht gefunden
      </p>
      <button 
        onClick={onBackClick}
        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
      >
        Zurück zur Übersicht
      </button>
    </div>
  );
};

export default RecipeNotFound;