import React from 'react';
import { Store, Check } from 'lucide-react';

/**
 * StoreCard - Auswählbare Karte für einen Laden
 * 
 * Zeigt Laden-Name, Anzahl Kategorien und Auswahl-Status
 * 
 * Props:
 * @param {object} store - Laden-Objekt {id, name, categories}
 * @param {boolean} isSelected - Ist dieser Laden ausgewählt?
 * @param {function} onSelect - Callback bei Auswahl
 */
const StoreCard = ({ store, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between">
        
        {/* Icon und Laden-Info */}
        <div className="flex items-center gap-3">
          
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isSelected ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Store className={`w-5 h-5 ${
              isSelected ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          
          {/* Name und Kategorien-Anzahl */}
          <div>
            <p className={`font-semibold ${
              isSelected ? 'text-blue-900' : 'text-gray-800'
            }`}>
              {store.name}
            </p>
            <p className="text-sm text-gray-500">
              {store.categories?.length || 0} Kategorien
            </p>
          </div>
        </div>
        
        {/* Ausgewählt-Indikator */}
        {isSelected && (
          <div className="bg-blue-500 rounded-full p-1">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </button>
  );
};

export default StoreCard;