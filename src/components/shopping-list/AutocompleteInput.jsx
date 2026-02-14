import React from 'react';

/**
 * AutocompleteInput - Input-Feld mit Autocomplete-Funktionalität
 * 
 * Zeigt Vorschläge aus Produktdatenbank während der Eingabe
 * 
 * Props:
 * @param {string} value - Aktueller Eingabewert
 * @param {function} onChange - Callback bei Änderung
 * @param {array} searchResults - Autocomplete-Ergebnisse
 * @param {boolean} showSuggestions - Zeigt Vorschläge an
 * @param {function} onSelectProduct - Callback bei Auswahl eines Produkts
 * @param {function} getCategoryName - Gibt Kategorie-Namen für ID zurück
 * @param {ref} inputRef - Ref für das Input-Element
 * @param {function} onFocus - Callback bei Fokus
 * @param {function} onBlur - Callback bei Blur
 */
const AutocompleteInput = ({
  value,
  onChange,
  searchResults,
  showSuggestions,
  onSelectProduct,
  getCategoryName,
  inputRef,
  onFocus,
  onBlur
}) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Artikel *
      </label>
      
      {/* Input-Feld */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        placeholder="z.B. Tomaten"
        autoFocus
        autoComplete="off"
      />
      
      {/* Autocomplete-Vorschläge */}
      {showSuggestions && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((product, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectProduct(product)}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
            >
              {/* Produktname */}
              <div className="font-medium text-gray-800">
                {product.name}
              </div>
              
              {/* Kategorie und übliche Einheit */}
              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {getCategoryName(product.category)}
                </span>
                <span>• übliche Einheit: {product.commonUnit}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Hinweis für neues Produkt */}
      {value.length >= 2 && searchResults.length === 0 && !showSuggestions && (
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
          <p className="text-xs text-amber-800">
            💡 Neues Produkt - wird zur Datenbank hinzugefügt
          </p>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;