import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Settings, ShoppingCart, LogOut } from 'lucide-react';
import { useShoppingList } from '../context/ShoppingListContext';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchAndFilter from '../components/dashboard/SearchAndFilter';
import RecipeGrid from '../components/dashboard/RecipeGrid';
import { filterRecipes, getUniqueCategories } from '../utils/recipeFilters';

/**
 * Dashboard - Hauptseite mit Rezeptübersicht
 * 
 * Funktionen:
 * - Anzeige aller Rezepte in Grid-Ansicht
 * - Suche nach Titel, Beschreibung oder Tags
 * - Filterung nach Kategorien
 * - Navigation zu Rezeptdetails, Admin-Panel, Einkaufsliste
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { items } = useShoppingList();
  const { user, logout } = useAuth();
  const { recipes, loading } = useRecipes();
  
  // Filter-Zustand
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  /**
   * Extrahiert alle einzigartigen Kategorien aus Rezepten
   */
  const categories = getUniqueCategories(recipes);

  /**
   * Gefilterte Rezepte basierend auf Suche und Kategorie
   */
  const filteredRecipes = filterRecipes(recipes, searchTerm, selectedCategory);

  /**
   * Navigiert zur Rezeptdetail-Seite
   */
  const handleRecipeClick = (id) => {
    navigate(`/recipe/${id}`);
  };

  /**
   * Meldet Benutzer nach Bestätigung ab
   */
  const handleLogout = async () => {
    if (window.confirm('Möchtest du dich wirklich abmelden?')) {
      await logout();
    }
  };

  /**
   * Anzahl nicht abgehakter Einkaufslisteneinträge
   */
  const uncheckedItemsCount = items.filter(item => !item.checked).length;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header mit Titel, User-Info und Aktions-Buttons */}
      <DashboardHeader
        user={user}
        recipeCount={filteredRecipes.length}
        uncheckedItemsCount={uncheckedItemsCount}
        onAdminClick={() => navigate('/admin')}
        onShoppingListClick={() => navigate('/shopping-list')}
        onWochenplanerClick={() => navigate('/wochenplaner')}
        onLogoutClick={handleLogout}
      />

      {/* Suche und Kategorie-Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Grid mit allen Rezepten */}
      <RecipeGrid
        recipes={filteredRecipes}
        loading={loading}
        onRecipeClick={handleRecipeClick}
      />
    </div>
  );
};

export default Dashboard;