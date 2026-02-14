import React from 'react';
import { Clock, Users, ChefHat } from 'lucide-react';

/**
 * RecipeMetaBar - Info-Leiste mit Meta-Informationen
 * 
 * Zeigt Zeit, Portionen und Schwierigkeit
 * 
 * Props:
 * @param {number} prepTime - Vorbereitungszeit in Minuten
 * @param {number} cookTime - Kochzeit in Minuten
 * @param {number} servings - Anzahl Portionen
 * @param {string} difficulty - Schwierigkeitsgrad
 */
const RecipeMetaBar = ({ prepTime, cookTime, servings, difficulty }) => {
  const totalTime = prepTime + cookTime;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex flex-wrap gap-4 justify-center md:justify-start max-w-4xl mx-auto">
        
        {/* Gesamtzeit */}
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="text-sm">
            {totalTime} Min
          </span>
        </div>
        
        {/* Portionen */}
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-5 h-5 text-blue-500" />
          <span className="text-sm">
            {servings} Portionen
          </span>
        </div>
        
        {/* Schwierigkeit */}
        <div className="flex items-center gap-2 text-gray-700">
          <ChefHat className="w-5 h-5 text-green-500" />
          <span className="text-sm capitalize">
            {difficulty}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecipeMetaBar;