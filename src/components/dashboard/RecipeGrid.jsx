import React from 'react';
import DashboardRecipeCard from './DashboardRecipeCard';
import LoadingSpinner from '../global/LoadingSpinner';
import EmptyState from '../global/EmptyState';

/**
 * RecipeGrid - Grid-Layout für Rezepte im Dashboard
 * 
 * Zeigt Rezepte in responsivem Grid mit Loading- und Empty-States
 * 
 * Props:
 * @param {array} recipes - Anzuzeigende Rezepte
 * @param {boolean} loading - Ladezustand
 * @param {function} onRecipeClick - Callback beim Klick auf Rezept
 */
const RecipeGrid = ({ recipes, loading, onRecipeClick }) => {
  // Loading-State
  if (loading) {
    return <LoadingSpinner text="Lade Rezepte..." />;
  }

  // Empty-State (keine Rezepte gefunden)
  if (recipes.length === 0) {
    return (
      <EmptyState
        title="Keine Rezepte gefunden"
        description="Versuche einen anderen Suchbegriff oder ändere die Kategorie"
      />
    );
  }

  // Grid mit Rezepten
  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <DashboardRecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => onRecipeClick(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecipeGrid;