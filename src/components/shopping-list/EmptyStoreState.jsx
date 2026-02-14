import React from 'react';

/**
 * EmptyStoreState - Anzeige wenn keine Läden vorhanden sind
 * 
 * Informiert Benutzer dass noch keine Läden angelegt wurden
 * und verweist auf Einstellungs-Menü
 */
const EmptyStoreState = () => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">
        Noch keine Läden angelegt
      </p>
      <p className="text-sm text-gray-500">
        Erstelle einen Laden im Einstellungs-Menü
      </p>
    </div>
  );
};

export default EmptyStoreState;