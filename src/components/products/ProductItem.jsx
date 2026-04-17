import React from 'react';
import { Edit2, Trash2, Save, Lock } from 'lucide-react';

/**
 * ProductItem - ANGEPASST mit Ownership-Checks
 * 
 * Zeigt Produkt mit:
 * - "Von Gruppenmitglied" Badge für fremde Produkte
 * - Disabled Edit/Delete Buttons für fremde Produkte
 * - Nur eigene Produkte sind bearbeitbar
 * 
 * Props:
 * @param {object} product - Produkt mit _isOwn, _ownerId
 * @param {array} categories - Verfügbare Kategorien
 * @param {boolean} isEditing - Bearbeitungs-Modus aktiv?
 * @param {object} editForm - Formular-Daten
 * @param {function} onStartEdit - Callback zum Starten
 * @param {function} onSaveEdit - Callback zum Speichern
 * @param {function} onCancelEdit - Callback zum Abbrechen
 * @param {function} onEditFormChange - Callback bei Änderung
 * @param {function} onDelete - Callback zum Löschen
 */
const ProductItem = ({
  product,
  categories,
  isEditing,
  editForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  onDelete
}) => {
  // Prüfe ob Produkt dem User gehört (Default true für Abwärtskompatibilität)
  const isOwn = product._isOwn !== false;

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
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-gray-800">
                {product.name}
              </p>
              
              {/* Badge für fremde Produkte */}
              {!isOwn && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Von Gruppenmitglied
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              Einheit: {product.commonUnit || 'keine Angabe'}
            </p>
          </div>
          
          {/* Aktions-Buttons */}
          <div className="flex items-center gap-2 ml-2">
            {/* Bearbeiten - Disabled wenn nicht eigenes Produkt */}
            <button
              onClick={onStartEdit}
              disabled={!isOwn}
              className={`p-2 rounded-lg transition-colors ${
                isOwn 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-300 cursor-not-allowed opacity-50'
              }`}
              aria-label={`${product.name} bearbeiten`}
              title={!isOwn ? 'Du kannst nur deine eigenen Produkte bearbeiten' : 'Bearbeiten'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            
            {/* Löschen - Disabled wenn nicht eigenes Produkt */}
            <button
              onClick={onDelete}
              disabled={!isOwn}
              className={`p-2 rounded-lg transition-colors ${
                isOwn 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-gray-300 cursor-not-allowed opacity-50'
              }`}
              aria-label={`${product.name} löschen`}
              title={!isOwn ? 'Du kannst nur deine eigenen Produkte löschen' : 'Löschen'}
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