import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
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
  const { user } = useAuth();
  const { recipes, loading } = useRecipes();
  
  // Filter-Zustand
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [fading, setFading] = useState(false);

  const changeCategory = useCallback((newCategory) => {
    setFading(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        setSelectedCategory(newCategory);
        setFading(false);
      }, 120);
    });
  }, []);

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
   * Anzahl nicht abgehakter Einkaufslisteneinträge
   */
  const uncheckedItemsCount = items.filter(item => !item.checked).length;

  // Swipe-Geste zum Wechseln der Kategorie
  const touchStart = useRef(null);

  const handleTouchStart = (e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    // Nur auslösen wenn horizontale Bewegung dominiert (kein versehentliches Scrollen)
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

    const currentIndex = categories.indexOf(selectedCategory);
    if (deltaX < 0) {
      // Wisch nach links → nächste Kategorie
      changeCategory(categories[(currentIndex + 1) % categories.length]);
    } else {
      // Wisch nach rechts → vorherige Kategorie
      changeCategory(categories[(currentIndex - 1 + categories.length) % categories.length]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      
      {/* Header mit Titel, User-Info und Aktions-Buttons */}
      <DashboardHeader
        user={user}
        recipeCount={filteredRecipes.length}
        uncheckedItemsCount={uncheckedItemsCount}
        onAdminClick={() => navigate('/settings')}
        onShoppingListClick={() => navigate('/shopping-list')}
        onWochenplanerClick={() => navigate('/wochenplaner')}
      />

      {/* Suche und Kategorie-Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={changeCategory}
      />

      {/* Grid mit allen Rezepten – Swipe links/rechts wechselt Kategorie */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`transition-opacity duration-150 ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        <RecipeGrid
          recipes={filteredRecipes}
          loading={loading}
          onRecipeClick={handleRecipeClick}
        />
      </div>
    </div>
  );
};

export default Dashboard;