import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';

/**
 * CategoryItem - Einzelne Kategorie in der Liste
 * 
 * Zeigt Kategorie mit Drag-Handle, Position, Name und Löschen-Button
 * 
 * Props:
 * @param {object} category - Kategorie-Objekt {id, name, order}
 * @param {number} index - Position in der Liste (0-basiert)
 * @param {function} onDragStart - Callback bei Drag-Start
 * @param {function} onDragOver - Callback bei Drag-Over
 * @param {function} onRemove - Callback zum Löschen
 */
const CategoryItem = ({ 
  category, 
  index, 
  onDragStart, 
  onDragOver, 
  onRemove 
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 cursor-move hover:border-blue-300 transition-colors"
    >
      {/* Drag-Handle */}
      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
      
      {/* Position (1-basiert für Anzeige) */}
      <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
        {index + 1}
      </span>
      
      {/* Kategorie-Info */}
      <div className="flex-1">
        <p className="font-medium text-gray-800">
          {category.name}
        </p>
        <p className="text-xs text-gray-500">
          {category.id}
        </p>
      </div>
      
      {/* Löschen-Button */}
      <button
        onClick={onRemove}
        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
        aria-label={`${category.name} löschen`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CategoryItem;