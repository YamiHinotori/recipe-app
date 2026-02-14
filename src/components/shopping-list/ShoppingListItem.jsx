import React from 'react';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';

/**
 * ShoppingListItem - Einzelner Artikel in Normal-Ansicht
 * 
 * Zeigt Artikel mit Checkbox, Drag-Handle und Aktions-Buttons
 * 
 * Props:
 * @param {object} item - Der anzuzeigende Artikel
 * @param {function} onToggle - Callback beim Abhaken/Aufhaken
 * @param {function} onEdit - Callback beim Bearbeiten
 * @param {function} onDelete - Callback beim Löschen
 * @param {function} getCategoryName - Gibt Kategorie-Namen zurück
 * @param {boolean} showDragHandle - Zeigt Drag-Handle (für nicht-abgehakte Items)
 */
const ShoppingListItem = ({
  item,
  onToggle,
  onEdit,
  onDelete,
  getCategoryName,
  showDragHandle = false
}) => {
  return (
    <>
      {/* Drag-Handle (nur für sortierbare Items) */}
      {showDragHandle && (
        <div className="cursor-move touch-none">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
      )}

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={item.checked}
        onChange={onToggle}
        className="w-5 h-5 text-green-600 rounded cursor-pointer flex-shrink-0"
        aria-label={`${item.item} ${item.checked ? 'abhaken' : 'aufhaken'}`}
      />

      {/* Artikel-Informationen */}
      <div className={`flex-1 min-w-0 ${item.checked ? 'line-through text-gray-500' : ''}`}>
        
        {/* Artikelname */}
        <div className="font-medium text-gray-800">
          {item.item}
        </div>

        {/* Menge und Einheit */}
        {(item.amount || item.unit) && (
          <div className="text-sm text-gray-600">
            {item.amount} {item.unit}
          </div>
        )}

        {/* Kategorie und Rezept-Zuordnung */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Kategorie-Badge */}
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {getCategoryName(item.category)}
          </span>

          {/* Rezept-Zuordnung (falls vorhanden) */}
          {item.recipes && item.recipes.length > 0 && (
            <span className="text-xs text-gray-500">
              aus: {item.recipes.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Aktions-Buttons */}
      {!item.checked && onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
          aria-label={`${item.item} bearbeiten`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
        aria-label={`${item.item} löschen`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </>
  );
};

export default ShoppingListItem;