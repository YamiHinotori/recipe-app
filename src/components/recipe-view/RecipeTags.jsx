import React from 'react';

/**
 * RecipeTags - Kategorie und Tags
 * 
 * Zeigt Kategorie-Badge und alle Tags
 * 
 * Props:
 * @param {string} category - Rezept-Kategorie
 * @param {array} tags - Array von Tags
 */
const RecipeTags = ({ category, tags }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Kategorie */}
      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
        {category}
      </span>
      
      {/* Tags */}
      {Array.isArray(tags) && tags.map((tag, index) => (
        <span 
          key={index}
          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
};

export default RecipeTags;