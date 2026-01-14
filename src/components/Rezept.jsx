import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, Users, ChefHat, ArrowLeft } from 'lucide-react';
import recipesData from '../recipes.json';

const RecipeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = recipesData.recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 mb-4">Rezept nicht gefunden</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg"
        >
          Zurück zur Übersicht
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        aria-label="Zurück"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>

      {/* Header mit Bild */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
          <p className="text-gray-200 text-sm md:text-base">{recipe.description}</p>
        </div>
      </div>

      {/* Info-Leiste */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm">
              {recipe.prepTime + recipe.cookTime} Min
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm">{recipe.servings} Portionen</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <ChefHat className="w-5 h-5 text-green-500" />
            <span className="text-sm capitalize">{recipe.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex flex-wrap gap-2">
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
            {recipe.category}
          </span>
          {recipe.tags.map((tag, index) => (
            <span 
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hauptinhalt */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Zutaten */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Zutaten</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li 
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-gray-800">{ingredient.item}</span>
                <span className="text-gray-600 text-sm whitespace-nowrap ml-4">
                  {ingredient.amount} {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Zubereitung */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Zubereitung</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </span>
                <p className="text-gray-700 pt-1 flex-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Notizen */}
        {recipe.notes && (
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 md:p-6">
            <h3 className="font-semibold text-amber-900 mb-2">💡 Tipp</h3>
            <p className="text-amber-800 text-sm">{recipe.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeView;