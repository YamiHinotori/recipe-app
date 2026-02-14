import React from 'react';
import { Edit2, Trash2, Save } from 'lucide-react';

/**
 * ProductItem - Einzelnes Produkt in der Liste
 * 
 * Zeigt Produkt mit Bearbeiten/Löschen oder Bearbeitungs-Formular
 * 
 * Props:
 * @param {object} product - Produkt-Objekt {name, category, commonUnit}
 * @param {number} globalIndex - Index im gesamten Produkte-Array
 * @param {array} categories - Verfügbare Kategorien
 * @param {boolean} isEditing - Ist dieses Produkt im Bearbeitungs-Modus?
 * @param {object} editForm - Formular-Daten {name, category, commonUnit}
 * @param {function} onStartEdit - Callback zum Starten der Bearbeitung
 * @param {function} onSaveEdit - Callback zum Speichern
 * @param {function} onCancelEdit - Callback zum Abbrechen
 * @param {function} onEditFormChange - Callback bei Formular-Änderung
 * @param {function} onDelete - Callback zum Löschen
 */
const ProductItem = ({
  product,
  globalIndex,
  categories,
  isEditing,
  editForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  onDelete
}) => {
  return (
    <div className="p-4">
      {isEditing ? (
        /* Bearbeitungs-Modus */
        <div className="space-y-3">
          {/* Produktname */}
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Produktname"
            autoFocus
          />
          
          {/* Kategorie und Einheit */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={editForm.category}
              onChange={(e) => onEditFormChange({ ...editForm, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              value={editForm.commonUnit}
              onChange={(e) => onEditFormChange({ ...editForm, commonUnit: e.target.value })}
              placeholder="Einheit"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {/* Speichern / Abbrechen */}
          <div className="flex gap-2">
            <button
              onClick={onSaveEdit}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-4 h-4" />
              Speichern
            </button>
            <button
              onClick={onCancelEdit}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        /* Normal-Modus */
        <div className="flex items-center justify-between">
          {/* Produkt-Info */}
          <div>
            <p className="font-medium text-gray-800">
              {product.name}
            </p>
            <p className="text-sm text-gray-500">
              Einheit: {product.commonUnit || 'keine Angabe'}
            </p>
          </div>
          
          {/* Aktions-Buttons */}
          <div className="flex items-center gap-2">
            {/* Bearbeiten */}
            <button
              onClick={onStartEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label={`${product.name} bearbeiten`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            
            {/* Löschen */}
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={`${product.name} löschen`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductItem;