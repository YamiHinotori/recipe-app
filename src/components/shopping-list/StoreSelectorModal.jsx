import React, { useState } from 'react';
import { X, Store } from 'lucide-react';
import { useStoreLayouts } from '../../context/StoreLayoutsContext';
import ModalHeader from '../global/ModalHeader';
import StoreList from './StoreList';
import EmptyStoreState from './EmptyStoreState';

/**
 * StoreSelectorModal - Modal zur Auswahl eines Ladens für Sortierung
 * 
 * Ermöglicht Auswahl eines Ladens aus der Liste verfügbarer Laden-Layouts
 * für die automatische Sortierung der Einkaufsliste
 * 
 * Props:
 * @param {boolean} isOpen - Modal-Sichtbarkeit
 * @param {function} onClose - Callback beim Schließen
 * @param {function} onSelectStore - Callback bei Laden-Auswahl (storeId als Parameter)
 */
const StoreSelectorModal = ({ isOpen, onClose, onSelectStore }) => {
  const { storeLayouts, selectedStoreId, setSelectedStoreId } = useStoreLayouts();
  
  // Temporäre Auswahl (wird erst bei "Sortieren" übernommen)
  const [tempSelection, setTempSelection] = useState(selectedStoreId);

  // Modal nicht rendern wenn geschlossen
  if (!isOpen) return null;

  /**
   * Bestätigt Auswahl und startet Sortierung
   */
  const handleConfirm = () => {
    if (tempSelection) {
      setSelectedStoreId(tempSelection);
      onSelectStore(tempSelection);
      onClose();
    }
  };

  /**
   * Prüft ob Läden vorhanden sind
   */
  const hasStores = storeLayouts.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        
        {/* Modal-Header */}
        <ModalHeader
          icon={<Store className="w-5 h-5 text-blue-600" />}
          title="Laden auswählen"
          onClose={onClose}
          iconBgColor="bg-blue-100"
        />

        {/* Modal-Inhalt */}
        <div className="p-6">
          {!hasStores ? (
            /* Keine Läden vorhanden */
            <EmptyStoreState />
          ) : (
            /* Laden-Auswahl */
            <StoreList
              stores={storeLayouts}
              selectedStoreId={tempSelection}
              onSelectStore={setTempSelection}
              onConfirm={handleConfirm}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreSelectorModal;