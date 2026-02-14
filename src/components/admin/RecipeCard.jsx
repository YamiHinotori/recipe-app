import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

/**
 * RecipeCard - Einzelne Rezeptkarte in der Admin-Übersicht
 * 
 * Zeigt Vorschau eines Rezepts mit Bearbeitungs- und Lösch-Optionen
 * 
 * Props:
 * @param {object} recipe - Das anzuzeigende Rezept
 * @param {function} onEdit - Callback beim Klick auf Bearbeiten
 * @param {function} onDelete - Callback beim Klick auf Löschen
 */
const RecipeCard = ({ recipe, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      
      {/* Rezeptbild (falls vorhanden) */}
      {recipe.image && (
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      )}

      {/* Rezeptinformationen */}
      <div className="p-4">
        {/* Titel */}
        <h3 className="font-bold text-lg mb-2 line-clamp-1">
          {recipe.title}
        </h3>

        {/* Beschreibung (max. 2 Zeilen) */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {recipe.description || 'Keine Beschreibung vorhanden'}
        </p>

        {/* Aktions-Buttons */}
        <div className="flex gap-2">
          {/* Bearbeiten */}
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 font-medium"
            aria-label={`${recipe.title} bearbeiten`}
          >
            <Edit2 className="w-4 h-4" />
            Bearbeiten
          </button>

          {/* Löschen */}
          <button
            onClick={onDelete}
            className="flex-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1 font-medium"
            aria-label={`${recipe.title} löschen`}
          >
            <Trash2 className="w-4 h-4" />
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;