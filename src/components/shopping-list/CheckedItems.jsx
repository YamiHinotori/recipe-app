import React from 'react';
import ShoppingListItem from './ShoppingListItem';

/**
 * CheckedItems - Liste der abgehakten Artikel
 * 
 * Zeigt erledigte Artikel mit reduzierter Opacity und Aufräum-Button
 * 
 * Props:
 * @param {array} items - Abgehakte Artikel
 * @param {function} onToggleItem - Callback beim Aufhaken
 * @param {function} onRemoveItem - Callback beim Löschen
 * @param {function} onClearChecked - Callback zum Löschen aller abgehakten Items
 */
const CheckedItems = ({ items, onToggleItem, onRemoveItem, onClearChecked }) => {
  return (
    <div>
      
      {/* Header mit Anzahl und Aufräum-Button */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700">
          Erledigt ({items.length})
        </h2>
        <button
          onClick={onClearChecked}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Aufräumen
        </button>
      </div>

      {/* Liste der abgehakten Items */}
      <div className="bg-white rounded-lg shadow-sm opacity-60">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 flex items-center gap-3 ${
              index !== items.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <ShoppingListItem
              item={item}
              onToggle={() => onToggleItem(item.id)}
              onDelete={() => onRemoveItem(item.id)}
              getCategoryName={() => ''} // Keine Kategorie-Anzeige bei abgehakten Items
              showDragHandle={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckedItems;