import React, { useState, useMemo } from 'react';
import { Search, ChefHat } from 'lucide-react';

/**
 * RecipeSelector - Auswahl-Komponente für Rezepte
 * 
 * Features:
 * - Suche nach Rezeptname
 * - Scroll-Liste mit Rezepten
 * - Ausgewähltes Rezept hervorgehoben
 */
const RecipeSelector = ({ recipes, selectedRecipe, onSelectRecipe }) => {
  
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Gefilterte Rezepte basierend auf Suche
   */
  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) {
      return recipes;
    }

    const search = searchTerm.toLowerCase();
    return recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(search) ||
      recipe.category?.toLowerCase().includes(search)
    );
  }, [recipes, searchTerm]);

  return (
    <div className="space-y-3">
      
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        Rezept auswählen
      </label>

      {/* Such-Feld */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rezept suchen..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Rezepte-Liste */}
      <div className="border border-gray-300 rounded-lg max-h-60 md:max-h-96 overflow-y-auto">
        {filteredRecipes.length === 0 ? (
          
          /* Keine Rezepte gefunden */
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? (
              <p>Keine Rezepte gefunden für "{searchTerm}"</p>
            ) : (
              <p>Noch keine Rezepte vorhanden</p>
            )}
          </div>
          
        ) : (
          
          /* Rezepte-Liste */
          <div className="divide-y divide-gray-200">
            {filteredRecipes.map((recipe) => {
              const isSelected = selectedRecipe?.id === recipe.id;
              
              return (
                <button
                  key={recipe.id}
                  onClick={() => onSelectRecipe(recipe)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    
                    {/* Rezept-Bild (falls vorhanden) */}
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ChefHat className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    {/* Rezept-Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${
                        isSelected ? 'text-orange-900' : 'text-gray-900'
                      }`}>
                        {recipe.title}
                      </h4>
                      
                      {recipe.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {recipe.description}
                        </p>
                      )}
                      
                      {recipe.category && (
                        <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {recipe.category}
                        </span>
                      )}
                    </div>

                    {/* Ausgewählt-Indikator */}
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Info-Text */}
      <p className="text-xs text-gray-500">
        {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Rezept' : 'Rezepte'} verfügbar
      </p>
    </div>
  );
};

export default RecipeSelector;