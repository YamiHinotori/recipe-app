import React from 'react';
import { Store, Edit2, Trash2, Settings as SettingsIcon, Save, Lock } from 'lucide-react';

/**
 * StoreCard - ANGEPASST mit Ownership-Checks
 * 
 * Zeigt Laden-Info mit:
 * - "Von Gruppenmitglied" Badge für fremde Stores
 * - Disabled Edit/Delete/Layout Buttons für fremde Stores
 * - Nur eigene Stores sind bearbeitbar
 * 
 * Props:
 * @param {object} store - Laden mit _isOwn, _ownerId
 * @param {boolean} isSelected - Ist dieser Laden aktiv?
 * @param {boolean} isEditing - Bearbeitungs-Modus?
 * @param {string} editName - Name im Bearbeitungs-Modus
 * @param {boolean} isLastStore - Letzter Laden? (Löschen deaktivieren)
 * @param {function} onSelectStore - Callback zum Aktivieren
 * @param {function} onEditLayout - Callback für Layout-Editor
 * @param {function} onStartRename - Callback für Umbenennen
 * @param {function} onSaveRename - Callback zum Speichern
 * @param {function} onCancelRename - Callback zum Abbrechen
 * @param {function} onEditNameChange - Callback bei Namensänderung
 * @param {function} onDelete - Callback zum Löschen
 */
const StoreCard = ({
  store,
  isSelected,
  isEditing,
  editName,
  isLastStore,
  onSelectStore,
  onEditLayout,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditNameChange,
  onDelete
}) => {
  // Prüfe ob Store dem User gehört (Default true für Abwärtskompatibilität)
  const isOwn = store._isOwn !== false;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-6 border-2 transition-all ${
        isSelected ? 'border-blue-500' : 'border-transparent'
      }`}
    >
      {isEditing ? (
        /* Bearbeitungs-Modus: Name ändern */
        <div className="space-y-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={onSaveRename}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-4 h-4" />
              Speichern
            </button>
            <button
              onClick={onCancelRename}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        /* Normal-Modus: Laden-Info und Buttons */
        <>
          {/* Header mit Icon, Name und Badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isSelected ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Store className={`w-6 h-6 ${
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              
              {/* Name und Kategorien-Anzahl */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {store.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {store.categoryOrder?.length || 0} Kategorien
                </p>
                
                {/* Badge für fremde Stores */}
                {!isOwn && (
                  <div className="mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Von Gruppenmitglied
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* "Aktiv"-Badge */}
            {isSelected && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                Aktiv
              </span>
            )}
          </div>

          {/* Aktions-Buttons */}
          <div className="flex gap-2">
            
            {/* Als aktiv setzen - IMMER möglich */}
            <button
              onClick={onSelectStore}
              className={`flex-1 py-2 rounded-lg transition-colors font-medium ${
                isSelected
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Als aktiv setzen
            </button>
            
            {/* Layout bearbeiten - Disabled wenn nicht eigener Store */}
            <button
              onClick={onEditLayout}
              disabled={!isOwn}
              className={`p-2 rounded-lg transition-colors ${
                isOwn
                  ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
              }`}
              title={!isOwn ? 'Du kannst nur deine eigenen Läden bearbeiten' : 'Layout bearbeiten'}
              aria-label={`Layout von ${store.name} bearbeiten`}
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            
            {/* Umbenennen - Disabled wenn nicht eigener Store */}
            <button
              onClick={onStartRename}
              disabled={!isOwn}
              className={`p-2 rounded-lg transition-colors ${
                isOwn
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
              }`}
              title={!isOwn ? 'Du kannst nur deine eigenen Läden umbenennen' : 'Umbenennen'}
              aria-label={`${store.name} umbenennen`}
            >
              <Edit2 className="w-5 h-5" />
            </button>
            
            {/* Löschen - Disabled wenn nicht eigener Store ODER letzter Store */}
            <button
              onClick={onDelete}
              disabled={!isOwn || isLastStore}
              className={`p-2 rounded-lg transition-colors ${
                isOwn && !isLastStore
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
              }`}
              title={
                !isOwn 
                  ? 'Du kannst nur deine eigenen Läden löschen'
                  : isLastStore 
                    ? "Letzter Laden kann nicht gelöscht werden" 
                    : "Löschen"
              }
              aria-label={`${store.name} löschen`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StoreCard;