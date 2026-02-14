import React from 'react';
import StoreCard from './StoreCard';

/**
 * StoreList - Liste aller verfügbaren Läden mit Auswahl
 * 
 * Zeigt Läden als auswählbare Karten mit Bestätigen/Abbrechen Buttons
 * 
 * Props:
 * @param {array} stores - Verfügbare Laden-Layouts
 * @param {string} selectedStoreId - ID des ausgewählten Ladens
 * @param {function} onSelectStore - Callback bei Auswahl eines Ladens
 * @param {function} onConfirm - Callback beim Bestätigen
 * @param {function} onCancel - Callback beim Abbrechen
 */
const StoreList = ({ 
  stores, 
  selectedStoreId, 
  onSelectStore, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <>
      {/* Beschreibungstext */}
      <p className="text-sm text-gray-600 mb-4">
        Wähle den Laden für die automatische Sortierung:
      </p>
      
      {/* Laden-Karten */}
      <div className="space-y-2">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            isSelected={selectedStoreId === store.id}
            onSelect={() => onSelectStore(store.id)}
          />
        ))}
      </div>

      {/* Aktions-Buttons */}
      <div className="flex gap-3 mt-6">
        {/* Sortieren (Bestätigen) */}
        <button
          onClick={onConfirm}
          disabled={!selectedStoreId}
          className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Sortieren
        </button>
        
        {/* Abbrechen */}
        <button
          onClick={onCancel}
          className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Abbrechen
        </button>
      </div>
    </>
  );
};

export default StoreList;