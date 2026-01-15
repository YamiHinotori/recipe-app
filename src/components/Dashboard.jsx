import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, Users, ChefHat, Search, ShoppingCart, LogOut, Settings } from 'lucide-react';
import { useShoppingList } from '../context/ShoppingListContext';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { items } = useShoppingList();
  const { user, logout } = useAuth();
  const { recipes, loading } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  // Alle einzigartigen Kategorien extrahieren
  const categories = ['Alle', ...new Set(recipes.map(r => r.category))];

  // Rezepte filtern
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Alle' || recipe.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleRecipeClick = (id) => {
    navigate(`/recipe/${id}`);
  };

  const handleLogout = async () => {
    if (window.confirm('Möchtest du dich wirklich abmelden?')) {
      await logout();
    }
  };

  const uncheckedItemsCount = items.filter(item => !item.checked).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                🍳 Meine Rezepte
              </h1>
              <p className="text-gray-600">
                {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Rezept' : 'Rezepte'} gefunden
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Admin Button */}
              <button
                onClick={() => navigate('/admin')}
                className="bg-purple-500 text-white p-3 rounded-full hover:bg-purple-600 transition-colors shadow-lg"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Shopping List Button */}
              <button
                onClick={() => navigate('/shopping-list')}
                className="relative bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors shadow-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                {uncheckedItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {uncheckedItemsCount}
                  </span>
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 p-3 rounded-full hover:bg-gray-300 transition-colors"
                title="Abmelden"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span>Angemeldet als {user.displayName || user.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Suche und Filter */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Suchleiste */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rezepte durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Kategorie-Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Rezept-Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Lade Rezepte...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Keine Rezepte gefunden</p>
            <p className="text-gray-400 text-sm mt-2">Versuche einen anderen Suchbegriff</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <div
                key={recipe.id}
                onClick={() => handleRecipeClick(recipe.id)}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transform transition-transform hover:scale-105 hover:shadow-md"
              >
                {/* Rezept-Bild */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
                    {recipe.category}
                  </div>
                </div>

                {/* Rezept-Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Meta-Informationen */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{recipe.prepTime + recipe.cookTime} Min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{recipe.servings}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-4 h-4 text-green-500" />
                      <span className="capitalize">{recipe.difficulty}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;