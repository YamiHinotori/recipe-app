import React from 'react';
import { X, User, Users } from 'lucide-react';

/**
 * ShoppingListSelectorModal - Modal zur Auswahl der Zielliste
 * 
 * Ermöglicht Auswahl zwischen persönlicher und gemeinsamer Liste
 * 
 * Props:
 * @param {boolean} isOpen - Modal-Sichtbarkeit
 * @param {function} onClose - Callback beim Schließen
 * @param {function} onSelectList - Callback bei Auswahl (scope als Parameter: 'private' oder 'group')
 * @param {boolean} hasGroup - Hat der User eine Gruppe?
 */
const ShoppingListSelectorModal = ({ isOpen, onClose, onSelectList, hasGroup }) => {
  if (!isOpen) return null;

  const handleSelect = (scope) => {
    onSelectList(scope);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Liste auswählen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Zu welcher Einkaufsliste möchtest du die Zutaten hinzufügen?
          </p>

          <div className="space-y-3">
            
            {/* Gemeinsame Liste (nur wenn Gruppe vorhanden) */}
            {hasGroup && (
              <button
                onClick={() => handleSelect('group')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 group-hover:bg-green-200 rounded-full p-2">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Gemeinsame Liste
                    </p>
                    <p className="text-sm text-gray-500">
                      Für alle Gruppenmitglieder sichtbar
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* Persönliche Liste */}
            <button
              onClick={() => handleSelect('private')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 group-hover:bg-purple-200 rounded-full p-2">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Persönliche Liste
                  </p>
                  <p className="text-sm text-gray-500">
                    Nur für dich sichtbar
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListSelectorModal;