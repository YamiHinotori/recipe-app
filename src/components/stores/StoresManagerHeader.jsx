import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

/**
 * StoresManagerHeader - Header der Läden-Verwaltung
 * 
 * Zeigt Titel, Laden-Anzahl und Hinzufügen-Button
 * 
 * Props:
 * @param {number} storeCount - Anzahl der Läden
 * @param {function} onBack - Callback für Zurück-Button
 * @param {function} onAddStore - Callback für Hinzufügen-Button
 */
const StoresManagerHeader = ({ storeCount, onBack, onAddStore }) => {
  return (
    <div className="flex items-center justify-between">
      
      {/* Zurück-Button und Titel */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Zurück zur Einkaufsliste"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Läden verwalten
          </h1>
          <p className="text-sm text-gray-600">
            {storeCount} {storeCount === 1 ? 'Laden' : 'Läden'}
          </p>
        </div>
      </div>
      
      {/* Neuer Laden Button */}
      <button
        onClick={onAddStore}
        className="bg-green-500 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        title="Neuer Laden"
        aria-label="Neuen Laden hinzufügen"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden md:inline">Neuer Laden</span>
      </button>
    </div>
  );
};

export default StoresManagerHeader;