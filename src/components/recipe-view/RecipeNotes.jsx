import React from 'react';

/**
 * RecipeNotes - Tipps und Notizen zum Rezept
 * 
 * Hervorgehobener Bereich mit Glühbirnen-Icon
 * 
 * Props:
 * @param {string} notes - Notizen/Tipps zum Rezept
 */
const RecipeNotes = ({ notes }) => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 md:p-6">
      <h3 className="font-semibold text-amber-900 mb-2">
        💡 Tipp
      </h3>
      <p className="text-amber-800 text-sm">
        {notes}
      </p>
    </div>
  );
};

export default RecipeNotes;