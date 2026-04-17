import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * EditableItem - Bearbeitungs-Ansicht für einen Artikel
 * 
 * Inline-Formular zum Bearbeiten von Artikeldetails
 * 
 * Props:
 * @param {object} item - Der zu bearbeitende Artikel
 * @param {object} editForm - Formular-Daten {item, amount, unit, category}
 * @param {array} storeCategories - Verfügbare Kategorien
 * @param {function} onEditFormChange - Callback bei Formular-Änderung
 * @param {function} onSaveEdit - Callback beim Speichern
 * @param {function} onCancelEdit - Callback beim Abbrechen
 */
const EditableItem = ({
  item,
  editForm,
  storeCategories,
  onEditFormChange,
  onSaveEdit,
  onCancelEdit
}) => {
  return (
    <div className="flex-1 min-w-0 space-y-2">

      {/* Artikel-Name (volle Breite) */}
      <input
        type="text"
        value={editForm.item}
        onChange={(e) => onEditFormChange({ ...editForm, item: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        placeholder="Artikel"
        autoFocus
      />

      {/* Menge und Einheit nebeneinander */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={editForm.amount}
          onChange={(e) => onEditFormChange({ ...editForm, amount: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Menge"
        />
        <input
          type="text"
          value={editForm.unit}
          onChange={(e) => onEditFormChange({ ...editForm, unit: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Einheit"
        />
      </div>

      {/* Kategorie-Auswahl */}
      <select
        value={editForm.category}
        onChange={(e) => onEditFormChange({ ...editForm, category: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {storeCategories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Speichern / Abbrechen */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onSaveEdit}
          className="flex items-center justify-center gap-1 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors"
        >
          <Check className="w-4 h-4" />
          Speichern
        </button>
        <button
          onClick={onCancelEdit}
          className="flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
          Abbrechen
        </button>
      </div>
    </div>
  );
};

export default EditableItem;