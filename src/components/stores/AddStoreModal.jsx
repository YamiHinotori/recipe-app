import React from 'react';
import { Store } from 'lucide-react';
import ModalHeader from '../global/ModalHeader';

/**
 * AddStoreModal - Modal zum Hinzufügen eines neuen Ladens
 * 
 * Einfaches Formular mit Laden-Name Eingabe
 * 
 * Props:
 * @param {string} storeName - Aktueller Wert des Laden-Namens
 * @param {function} onStoreNameChange - Callback bei Namensänderung
 * @param {function} onSubmit - Callback beim Absenden
 * @param {function} onClose - Callback beim Schließen
 */
const AddStoreModal = ({ storeName, onStoreNameChange, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        
        {/* Modal-Header */}
        <ModalHeader
          icon={<Store className="w-5 h-5 text-green-600" />}
          title="Neuen Laden anlegen"
          onClose={onClose}
          iconBgColor="bg-green-100"
        />
        
        {/* Formular */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          
          {/* Laden-Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Laden-Name *
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => onStoreNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="z.B. REWE, EDEKA, Aldi"
              autoFocus
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Der Laden wird mit Standard-Kategorien erstellt, die du anpassen kannst
            </p>
          </div>
          
          {/* Aktions-Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Erstellen
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;