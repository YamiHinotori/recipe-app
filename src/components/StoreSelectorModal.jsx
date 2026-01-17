import React, { useState } from 'react';
import { X, Store, Check, Settings } from 'lucide-react';
import { useStoreLayouts } from '../context/StoreLayoutsContext';

const StoreSelectorModal = ({ isOpen, onClose, onSelectStore }) => {
  const { storeLayouts, selectedStoreId, setSelectedStoreId } = useStoreLayouts();
  const [tempSelection, setTempSelection] = useState(selectedStoreId);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (tempSelection) {
      setSelectedStoreId(tempSelection);
      onSelectStore(tempSelection);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Laden auswählen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {storeLayouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Noch keine Läden angelegt</p>
              <p className="text-sm text-gray-500">
                Erstelle einen Laden im Einstellungs-Menü
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Wähle den Laden für die automatische Sortierung:
              </p>
              
              <div className="space-y-2">
                {storeLayouts.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => setTempSelection(store.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      tempSelection === store.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tempSelection === store.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Store className={`w-5 h-5 ${
                            tempSelection === store.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${
                            tempSelection === store.id ? 'text-blue-900' : 'text-gray-800'
                          }`}>
                            {store.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {store.categories?.length || 0} Kategorien
                          </p>
                        </div>
                      </div>
                      {tempSelection === store.id && (
                        <div className="bg-blue-500 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleConfirm}
                  disabled={!tempSelection}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Sortieren
                </button>
                <button
                  onClick={onClose}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreSelectorModal;