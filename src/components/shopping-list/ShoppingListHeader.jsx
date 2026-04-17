import React from 'react';
import { ArrowLeft, Plus, Store } from 'lucide-react';

/**
 * ShoppingListHeader - Header der Einkaufsliste
 *
 * Props:
 * @param {number} itemCount - Anzahl nicht-abgehakter Artikel
 * @param {function} onBack - Callback für Zurück-Button
 * @param {function} onSortByStore - Callback für Sortierung nach Laden
 * @param {function} onAddItem - Callback für Hinzufügen-Button
 * @param {boolean} showSortButton - Zeigt Sortier-Button wenn > 1 Artikel
 */
const ShoppingListHeader = ({
  itemCount,
  onBack,
  onSortByStore,
  onAddItem,
  showSortButton
}) => {
  return (
    <div className="flex items-center justify-between">

      {/* Zurück-Button und Titel */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
          aria-label="Zurück zum Dashboard"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Einkaufsliste
          </h1>
          <p className="text-sm text-gray-600">
            {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}
          </p>
        </div>
      </div>

      {/* Aktions-Buttons */}
      <div className="flex items-center gap-2">

        {/* Nach Laden sortieren (nur wenn > 1 Artikel) */}
        {showSortButton && (
          <button
            onClick={onSortByStore}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
            title="Nach Laden-Layout sortieren"
            aria-label="Nach Laden-Layout sortieren"
          >
            <Store className="w-5 h-5" />
          </button>
        )}

        {/* Artikel hinzufügen */}
        <button
          onClick={onAddItem}
          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors shadow-lg"
          title="Artikel hinzufügen"
          aria-label="Neuen Artikel hinzufügen"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ShoppingListHeader;