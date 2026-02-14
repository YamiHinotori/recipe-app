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
    <div className="flex-1 space-y-2">
      
      {/* Artikel-Name, Menge, Einheit */}
      <div className="flex gap-2">
        <input
          type="text"
          value={editForm.item}
          onChange={(e) => onEditFormChange({ ...editForm, item: e.target.value })}
          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Artikel"
          autoFocus
        />
        <input
          type="text"
          value={editForm.amount}
          onChange={(e) => onEditFormChange({ ...editForm, amount: e.target.value })}
          className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Menge"
        />
        <input
          type="text"
          value={editForm.unit}
          onChange={(e) => onEditFormChange({ ...editForm, unit: e.target.value })}
          className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Einheit"
        />
      </div>

      {/* Kategorie-Auswahl */}
      <select
        value={editForm.category}
        onChange={(e) => onEditFormChange({ ...editForm, category: e.target.value })}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {storeCategories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Speichern / Abbrechen */}
      <div className="flex gap-2">
        <button
          onClick={onSaveEdit}
          className="flex-1 p-2 text-green-600 hover:bg-green-50 rounded font-medium text-sm transition-colors"
        >
          <Check className="w-5 h-5 inline mr-1" />
          Speichern
        </button>
        <button
          onClick={onCancelEdit}
          className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded font-medium text-sm transition-colors"
        >
          <X className="w-5 h-5 inline mr-1" />
          Abbrechen
        </button>
      </div>
    </div>
  );
};

export default EditableItem;