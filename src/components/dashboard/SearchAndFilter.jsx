import React from 'react';
import { Search } from 'lucide-react';
import CategoryFilter from './CategoryFilter';

/**
 * SearchAndFilter - Such- und Filterbereich
 * 
 * Kombiniert Suchleiste und Kategorie-Filter
 * 
 * Props:
 * @param {string} searchTerm - Aktueller Suchbegriff
 * @param {function} onSearchChange - Callback bei Änderung der Suche
 * @param {array} categories - Verfügbare Kategorien
 * @param {string} selectedCategory - Aktuell ausgewählte Kategorie
 * @param {function} onCategoryChange - Callback bei Kategorie-Wechsel
 */
const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      
      {/* Suchleiste */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rezepte durchsuchen..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          aria-label="Rezepte durchsuchen"
        />
      </div>

      {/* Kategorie-Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
    </div>
  );
};

export default SearchAndFilter;