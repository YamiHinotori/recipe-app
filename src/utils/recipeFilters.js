/**
 * recipeFilters - Hilfsfunktionen für Rezept-Filterung und Suche
 * 
 * Enthält Logik für Suche, Filterung und Kategorie-Verwaltung
 */

/**
 * Filtert Rezepte basierend auf Suchbegriff und Kategorie
 * 
 * Sucht in:
 * - Titel
 * - Beschreibung
 * - Tags
 * 
 * @param {array} recipes - Alle Rezepte
 * @param {string} searchTerm - Suchbegriff
 * @param {string} selectedCategory - Ausgewählte Kategorie ("Alle" = keine Filterung)
 * @returns {array} Gefilterte Rezepte
 */
export const filterRecipes = (recipes, searchTerm, selectedCategory) => {
    return recipes.filter(recipe => {
      // Suche in Titel, Beschreibung und Tags
      const matchesSearch = 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(recipe.tags) && 
         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      // Kategorie-Filter
      const matchesCategory = 
        selectedCategory === 'Alle' || 
        recipe.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };
  
  /**
   * Extrahiert alle einzigartigen Kategorien aus Rezepten
   * 
   * @param {array} recipes - Alle Rezepte
   * @returns {array} Array mit Kategorien (inkl. "Alle" am Anfang)
   */
  export const getUniqueCategories = (recipes) => {
    const uniqueCategories = new Set(
      recipes
        .map(recipe => recipe.category)
        .filter(category => category) // Null/undefined entfernen
    );
    
    return ['Alle', ...Array.from(uniqueCategories).sort()];
  };
  
  /**
   * Sucht Rezepte nach Tag
   * 
   * @param {array} recipes - Alle Rezepte
   * @param {string} tag - Zu suchender Tag
   * @returns {array} Rezepte mit diesem Tag
   */
  export const filterByTag = (recipes, tag) => {
    return recipes.filter(recipe => 
      Array.isArray(recipe.tags) && 
      recipe.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  };
  
  /**
   * Sucht Rezepte nach Schwierigkeitsgrad
   * 
   * @param {array} recipes - Alle Rezepte
   * @param {string} difficulty - Schwierigkeitsgrad ("einfach", "mittel", "schwer")
   * @returns {array} Gefilterte Rezepte
   */
  export const filterByDifficulty = (recipes, difficulty) => {
    return recipes.filter(recipe => 
      recipe.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  };
  
  /**
   * Sucht Rezepte nach maximaler Zubereitungszeit
   * 
   * @param {array} recipes - Alle Rezepte
   * @param {number} maxMinutes - Maximale Gesamtzeit in Minuten
   * @returns {array} Rezepte innerhalb der Zeitgrenze
   */
  export const filterByMaxTime = (recipes, maxMinutes) => {
    return recipes.filter(recipe => {
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      return totalTime <= maxMinutes;
    });
  };
  
  /**
   * Sortiert Rezepte nach verschiedenen Kriterien
   * 
   * @param {array} recipes - Zu sortierende Rezepte
   * @param {string} sortBy - Sortierkriterium: 'title', 'time', 'servings', 'difficulty'
   * @param {string} order - Sortierreihenfolge: 'asc' oder 'desc'
   * @returns {array} Sortierte Rezepte
   */
  export const sortRecipes = (recipes, sortBy = 'title', order = 'asc') => {
    const sorted = [...recipes].sort((a, b) => {
      let compareValue = 0;
  
      switch (sortBy) {
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        
        case 'time':
          const timeA = (a.prepTime || 0) + (a.cookTime || 0);
          const timeB = (b.prepTime || 0) + (b.cookTime || 0);
          compareValue = timeA - timeB;
          break;
        
        case 'servings':
          compareValue = (a.servings || 0) - (b.servings || 0);
          break;
        
        case 'difficulty':
          const difficultyOrder = { 'einfach': 1, 'mittel': 2, 'schwer': 3 };
          compareValue = (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
          break;
        
        default:
          compareValue = 0;
      }
  
      return order === 'desc' ? -compareValue : compareValue;
    });
  
    return sorted;
  };
  
  /**
   * Sucht Rezepte die bestimmte Zutaten enthalten
   * 
   * @param {array} recipes - Alle Rezepte
   * @param {array} ingredientNames - Array von Zutatennamen
   * @returns {array} Rezepte die alle angegebenen Zutaten enthalten
   */
  export const filterByIngredients = (recipes, ingredientNames) => {
    return recipes.filter(recipe => {
      if (!Array.isArray(recipe.ingredients)) return false;
      
      return ingredientNames.every(searchIngredient => 
        recipe.ingredients.some(ingredient => 
          ingredient.item.toLowerCase().includes(searchIngredient.toLowerCase())
        )
      );
    });
  };
  
  /**
   * Gibt die häufigsten Tags zurück
   * 
   * @param {array} recipes - Alle Rezepte
   * @param {number} limit - Maximale Anzahl zurückzugebender Tags
   * @returns {array} Array von {tag, count} Objekten, sortiert nach Häufigkeit
   */
  export const getPopularTags = (recipes, limit = 10) => {
    const tagCounts = {};
  
    recipes.forEach(recipe => {
      if (Array.isArray(recipe.tags)) {
        recipe.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
  
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };