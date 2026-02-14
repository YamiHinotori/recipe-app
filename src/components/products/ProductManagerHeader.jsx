import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

/**
 * ProductManagerHeader - Header der Produktverwaltung
 * 
 * Zeigt Titel, Produktanzahl und Hinzufügen-Button
 * 
 * Props:
 * @param {number} productCount - Anzahl der Produkte
 * @param {function} onBack - Callback für Zurück-Button
 * @param {function} onAddProduct - Callback für Hinzufügen-Button
 */
const ProductManagerHeader = ({ productCount, onBack, onAddProduct }) => {
  return (
    <div className="flex items-center justify-between">
      
      {/* Zurück-Button und Titel */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Zurück zum Admin Panel"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Produktdatenbank
          </h1>
          <p className="text-sm text-gray-600">
            {productCount} Produkte
          </p>
        </div>
      </div>
      
      {/* Neues Produkt Button */}
      <button
        onClick={onAddProduct}
        className="bg-green-500 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        title="Neues Produkt"
        aria-label="Neues Produkt hinzufügen"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden md:inline">Neues Produkt</span>
      </button>
    </div>
  );
};

export default ProductManagerHeader;