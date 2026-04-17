import React from 'react';
import { X } from 'lucide-react';

/**
 * IngredientList - Verwaltung der Zutatenliste im Rezeptformular
 * 
 * Ermöglicht dynamisches Hinzufügen, Bearbeiten und Entfernen von Zutaten
 * 
 * Props:
 * @param {array} ingredients - Array von Zutaten-Objekten {item, amount, unit}
 * @param {function} onAdd - Callback zum Hinzufügen einer neuen Zutat
 * @param {function} onUpdate - Callback zum Aktualisieren (index, field, value)
 * @param {function} onRemove - Callback zum Entfernen (index)
 */
const IngredientList = ({ ingredients, onAdd, onUpdate, onRemove }) => {
  return (
    <div className="space-y-3">
      
      {/* Header mit Hinzufügen-Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Zutaten</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Zutat hinzufügen
        </button>
      </div>

      {/* Liste aller Zutaten */}
      {ingredients.map((ingredient, index) => (
        <div key={index} className="space-y-2 bg-gray-50 rounded-lg p-3">

          {/* Zeile 1: Zutat + Entfernen-Button */}
          <div className="flex gap-2">
            <input
              type="text"
              value={ingredient.item}
              onChange={(e) => onUpdate(index, 'item', e.target.value)}
              placeholder="Zutat (z.B. Mehl)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              aria-label="Zutat entfernen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Zeile 2: Menge + Einheit nebeneinander */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={ingredient.amount}
              onChange={(e) => onUpdate(index, 'amount', e.target.value)}
              placeholder="Menge (z.B. 500)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
            <input
              type="text"
              value={ingredient.unit}
              onChange={(e) => onUpdate(index, 'unit', e.target.value)}
              placeholder="Einheit (z.B. g)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
          </div>
        </div>
      ))}

      {/* Hinweis wenn keine Zutaten vorhanden */}
      {ingredients.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Noch keine Zutaten hinzugefügt. Klicke auf "+ Zutat hinzufügen".
        </p>
      )}
    </div>
  );
};

export default IngredientList;