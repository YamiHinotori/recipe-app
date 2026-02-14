import React from 'react';

/**
 * IngredientsList - Liste aller Zutaten
 * 
 * Zeigt Zutaten mit Menge und Einheit
 * 
 * Props:
 * @param {array} ingredients - Array von Zutaten {item, amount, unit}
 */
const IngredientsList = ({ ingredients }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Zutaten
      </h2>
      
      <ul className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <li 
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
          >
            {/* Zutaten-Name */}
            <span className="text-gray-800">
              {ingredient.item}
            </span>
            
            {/* Menge und Einheit */}
            <span className="text-gray-600 text-sm whitespace-nowrap ml-4">
              {ingredient.amount} {ingredient.unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientsList;