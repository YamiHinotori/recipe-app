import React from 'react';
import { Plus, ChevronRight, ShoppingCart } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import ModalHeader from '../global/ModalHeader';

/**
 * AddItemModal - Modal zum Hinzufügen von Artikeln
 * 
 * Vollständiges Formular mit Autocomplete, Kategorie-Auswahl und Mengen-Eingabe
 * 
 * Props:
 * @param {object} formData - Formular-Daten {item, amount, unit, category}
 * @param {function} onFormChange - Callback bei Änderung der Formulardaten
 * @param {array} searchResults - Autocomplete-Ergebnisse
 * @param {boolean} showSuggestions - Zeigt Autocomplete-Vorschläge
 * @param {array} storeCategories - Verfügbare Laden-Kategorien
 * @param {ref} itemInputRef - Ref für Input-Fokus
 * @param {function} onSearchInput - Callback bei Sucheingabe
 * @param {function} onSelectProduct - Callback bei Auswahl aus Autocomplete
 * @param {function} onAddItem - Callback beim Hinzufügen
 * @param {function} onClose - Callback beim Schließen
 * @param {function} getCategoryName - Hilfsfunktion für Kategorie-Namen
 * @param {function} setShowSuggestions - Setzt Suggestions-Sichtbarkeit
 */
const AddItemModal = ({
  formData,
  onFormChange,
  searchResults,
  showSuggestions,
  storeCategories,
  itemInputRef,
  onSearchInput,
  onSelectProduct,
  onAddItem,
  onClose,
  getCategoryName,
  setShowSuggestions
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-20 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-96 md:rounded-lg max-h-[90vh] overflow-y-auto">
        
        {/* Modal-Header */}
        <ModalHeader
          icon={<ShoppingCart className="w-5 h-5 text-green-600" />}
          title="Artikel hinzufügen"
          onClose={onClose}
          iconBgColor="bg-green-100"
        />
        
        <div className="p-6 space-y-4">
          
          {/* Artikel-Name mit Autocomplete */}
          <AutocompleteInput
            value={formData.item}
            onChange={onSearchInput}
            searchResults={searchResults}
            showSuggestions={showSuggestions}
            onSelectProduct={onSelectProduct}
            getCategoryName={getCategoryName}
            inputRef={itemInputRef}
            onFocus={() => {
              if (searchResults.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              // Verzögerung damit onClick auf Vorschlag noch funktioniert
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          
          {/* Kategorie-Auswahl */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategorie (Laden-Bereich)
            </label>
            <select
              value={formData.category}
              onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {storeCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hilft beim automatischen Sortieren nach Laden-Layout
            </p>
          </div>

          {/* Menge und Einheit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menge
              </label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => onFormChange({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Einheit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => onFormChange({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="g"
              />
            </div>
          </div>
          
          {/* Aktions-Buttons */}
          <div className="space-y-2">
            
            {/* Primär: Hinzufügen & Weiter */}
            <button
              type="button"
              onClick={(e) => onAddItem(e, true)}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Hinzufügen & Weiter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Sekundäre Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={(e) => onAddItem(e, false)}
                className="bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Nur Hinzufügen
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
        {/* Ende Padding-Container */}
      </div>
    </div>
  );
};

export default AddItemModal;