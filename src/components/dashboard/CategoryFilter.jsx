import React from 'react';

/**
 * CategoryFilter - Kategorie-Buttons für Filterung
 * 
 * Zeigt horizontale scrollbare Liste von Kategorie-Buttons
 * 
 * Props:
 * @param {array} categories - Verfügbare Kategorien (inkl. "Alle")
 * @param {string} selectedCategory - Aktuell ausgewählte Kategorie
 * @param {function} onCategoryChange - Callback bei Klick auf Kategorie
 */
const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
            selectedCategory === category
              ? 'bg-orange-500 text-white shadow-md scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
          }`}
          aria-pressed={selectedCategory === category}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;