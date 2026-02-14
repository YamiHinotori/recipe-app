import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useShoppingList } from '../context/ShoppingListContext';
import { useRecipes } from '../context/RecipeContext';
import BackButton from '../components/recipe-view/BackButton';
import RecipeHeader from '../components/recipe-view/RecipeHeader';
import RecipeMetaBar from '../components/recipe-view/RecipeMetaBar';
import RecipeTags from '../components/recipe-view/RecipeTags';
import AddToShoppingListButton from '../components/recipe-view/AddToShoppingListButton';
import IngredientsList from '../components/recipe-view/IngredientsList';
import InstructionsList from '../components/recipe-view/InstructionsList';
import RecipeNotes from '../components/recipe-view/RecipeNotes';
import RecipeNotFound from '../components/recipe-view/RecipeNotFound';

/**
 * RecipeView - Detailansicht eines einzelnen Rezepts
 * 
 * Funktionen:
 * - Anzeige aller Rezept-Details
 * - Zur Einkaufsliste hinzufügen
 * - Responsive Hero-Image
 * - Strukturierte Zutaten und Zubereitung
 */
const RecipeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addRecipeToList } = useShoppingList();
  const { recipes } = useRecipes();
  
  // Finde Rezept anhand ID
  const recipe = recipes.find(r => r.id === id);
  
  // Erfolgs-Anzeige für "Zur Liste hinzugefügt"
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Fügt Rezept zur Einkaufsliste hinzu
   */
  const handleAddToShoppingList = () => {
    addRecipeToList(recipe);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  /**
   * Rezept nicht gefunden - zeige Fehlerseite
   */
  if (!recipe) {
    return <RecipeNotFound onBackClick={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      
      {/* Floating Back-Button */}
      <BackButton onClick={() => navigate('/')} />

      {/* Hero-Header mit Bild */}
      <RecipeHeader
        image={recipe.image}
        title={recipe.title}
        description={recipe.description}
      />

      {/* Meta-Info Leiste (Zeit, Portionen, Schwierigkeit) */}
      <RecipeMetaBar
        prepTime={recipe.prepTime}
        cookTime={recipe.cookTime}
        servings={recipe.servings}
        difficulty={recipe.difficulty}
      />

      {/* Tags (Kategorie + Tags) */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <RecipeTags
          category={recipe.category}
          tags={recipe.tags}
        />
      </div>

      {/* Zur Einkaufsliste Button */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <AddToShoppingListButton
          onClick={handleAddToShoppingList}
          showSuccess={showSuccess}
        />
      </div>

      {/* Hauptinhalt */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Zutaten-Liste */}
        <IngredientsList ingredients={recipe.ingredients} />

        {/* Zubereitungs-Schritte */}
        <InstructionsList instructions={recipe.instructions} />

        {/* Notizen / Tipps */}
        {recipe.notes && <RecipeNotes notes={recipe.notes} />}
      </div>
    </div>
  );
};

export default RecipeView;