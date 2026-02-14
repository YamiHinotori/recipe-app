import React from 'react';
import { Clock, Users, ChefHat } from 'lucide-react';

/**
 * DashboardRecipeCard - Rezeptkarte für Dashboard-Ansicht
 * 
 * Zeigt Rezept mit Bild, Meta-Informationen und Tags
 * Anders als AdminRecipeCard: Clickable, keine Edit/Delete Buttons
 * 
 * Props:
 * @param {object} recipe - Das anzuzeigende Rezept
 * @param {function} onClick - Callback beim Klick auf die Karte
 */
const DashboardRecipeCard = ({ recipe, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-md"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Rezept ${recipe.title} öffnen`}
    >
      
      {/* Rezept-Bild mit Kategorie-Badge */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Kategorie-Badge */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          {recipe.category}
        </div>
      </div>

      {/* Rezept-Informationen */}
      <div className="p-4">
        
        {/* Titel */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {recipe.title}
        </h3>

        {/* Beschreibung (max. 2 Zeilen) */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Meta-Informationen (Zeit, Portionen, Schwierigkeit) */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          
          {/* Gesamtzeit */}
          <div className="flex items-center gap-1" title="Gesamtzeit">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{recipe.prepTime + recipe.cookTime} Min</span>
          </div>

          {/* Portionen */}
          <div className="flex items-center gap-1" title="Portionen">
            <Users className="w-4 h-4 text-blue-500" />
            <span>{recipe.servings}</span>
          </div>

          {/* Schwierigkeitsgrad */}
          <div className="flex items-center gap-1" title="Schwierigkeit">
            <ChefHat className="w-4 h-4 text-green-500" />
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        </div>

        {/* Tags (max. 3 anzeigen) */}
        {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
            
            {/* Anzeige wenn mehr Tags vorhanden sind */}
            {recipe.tags.length > 3 && (
              <span className="text-gray-400 text-xs px-2 py-1">
                +{recipe.tags.length - 3} mehr
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRecipeCard;