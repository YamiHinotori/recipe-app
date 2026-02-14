import React from 'react';
import { Plus } from 'lucide-react';

/**
 * AddCategoryForm - Formular zum Hinzufügen neuer Kategorien
 * 
 * Ermöglicht Eingabe von Name und ID für neue Kategorien
 * 
 * Props:
 * @param {object} newCategory - Objekt mit {name, id}
 * @param {function} onCategoryChange - Callback bei Änderung der Formular-Daten
 * @param {function} onAddCategory - Callback beim Hinzufügen
 */
const AddCategoryForm = ({ newCategory, onCategoryChange, onAddCategory }) => {
  /**
   * Prüft ob Formular ausgefüllt ist
   */
  const isFormValid = newCategory.name.trim() && newCategory.id.trim();

  /**
   * Handle Enter-Taste im Formular
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isFormValid) {
      e.preventDefault();
      onAddCategory();
    }
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="font-semibold text-gray-800 mb-3">
        Neue Kategorie hinzufügen
      </h3>
      
      <div className="space-y-3">
        
        {/* Kategorie-Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategorie-Name
          </label>
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => onCategoryChange({ ...newCategory, name: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="z.B. Bio-Produkte"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Kategorie-ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategorie-ID (für System)
          </label>
          <input
            type="text"
            value={newCategory.id}
            onChange={(e) => onCategoryChange({ ...newCategory, id: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="z.B. bio-produkte"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Kleinbuchstaben und Bindestriche, z.B. "bio-produkte"
          </p>
        </div>
        
        {/* Hinzufügen-Button */}
        <button
          onClick={onAddCategory}
          disabled={!isFormValid}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Kategorie hinzufügen
        </button>
      </div>
    </div>
  );
};

export default AddCategoryForm;