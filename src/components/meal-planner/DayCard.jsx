import React from 'react';
import { Link } from 'react-router';
import { Plus, ChefHat, FileText, StickyNote } from 'lucide-react';

/**
 * DayCard - Karte für einen Wochentag
 * 
 * DREI Zustände:
 * 1. Leer (nicht geplant)
 * 2. Freitext
 * 3. Rezept (mit Link)
 */
const DayCard = ({ dayKey, dayLabel, meal, onClick }) => {
  
  // ========================================================================
  // ZUSTAND 1: Leer / Nicht geplant
  // ========================================================================
  if (!meal) {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
      >
        {/* Tag-Name */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {dayLabel}
        </h3>
        
        {/* Leerer Zustand */}
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 group-hover:text-blue-500 transition-colors">
          <Plus className="w-12 h-12 mb-2" />
          <p className="text-sm font-medium">Mahlzeit planen</p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // ZUSTAND 2 & 3: Geplant (Freitext oder Rezept)
  // ========================================================================
  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:shadow-md transition-shadow">
      
      {/* Header: Tag-Name + Typ-Icon */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {dayLabel}
        </h3>
        
        {/* Icon je nach Typ */}
        {meal.recipeId ? (
          <ChefHat className="w-5 h-5 text-orange-500" title="Rezept" />
        ) : (
          <FileText className="w-5 h-5 text-blue-500" title="Freitext" />
        )}
      </div>

      {/* Body: Mahlzeit-Info */}
      <div className="p-4">
        
        {/* Rezept mit Link */}
        {meal.recipeId && meal.recipeName && (
          <Link
            to={`/recipe/${meal.recipeId}`}
            className="block mb-3 text-gray-900 hover:text-orange-600 font-medium transition-colors"
            onClick={(e) => e.stopPropagation()} // Verhindert onClick des Cards
          >
            {meal.recipeName}
          </Link>
        )}

        {/* Freitext */}
        {meal.mealText && (
          <p className="text-gray-900 font-medium mb-3">
            {meal.mealText}
          </p>
        )}

        {/* Notizen (optional) */}
        {meal.notes && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <StickyNote className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                {meal.notes}
              </p>
            </div>
          </div>
        )}

        {/* Bearbeiten-Button */}
        <button
          onClick={onClick}
          className="mt-4 w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          Bearbeiten
        </button>
      </div>
    </div>
  );
};

export default DayCard;