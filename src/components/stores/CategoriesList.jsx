import React from 'react';
import CategoryItem from './CategoryItem';

/**
 * CategoriesList - Liste aller Kategorien mit Drag & Drop
 * 
 * Zeigt alle Kategorien in sortierter Reihenfolge mit
 * Drag & Drop Funktionalität
 * 
 * Props:
 * @param {array} categories - Array von Kategorien
 * @param {function} onDragStart - Callback bei Drag-Start
 * @param {function} onDragOver - Callback bei Drag-Over
 * @param {function} onRemoveCategory - Callback zum Löschen
 */
const CategoriesList = ({ 
  categories, 
  onDragStart, 
  onDragOver, 
  onRemoveCategory 
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-800 mb-3">
        Kategorien (in Reihenfolge)
      </h3>
      
      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Noch keine Kategorien vorhanden</p>
          <p className="text-sm">Füge unten eine neue Kategorie hinzu</p>
        </div>
      ) : (
        categories.map((category, index) => (
          <CategoryItem
            key={category.id}
            category={category}
            index={index}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onRemove={() => onRemoveCategory(category.id)}
          />
        ))
      )}
    </div>
  );
};

export default CategoriesList;