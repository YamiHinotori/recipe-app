import React from 'react';
import { Store, Edit2, Trash2, Settings as SettingsIcon, Save } from 'lucide-react';

/**
 * StoreCard - Karte für einen einzelnen Laden
 * 
 * Zeigt Laden-Info mit Aktions-Buttons oder Bearbeitungs-Modus
 * 
 * Props:
 * @param {object} store - Laden-Objekt {id, name, categories}
 * @param {boolean} isSelected - Ist dieser Laden aktiv ausgewählt?
 * @param {boolean} isEditing - Befindet sich dieser Laden im Bearbeitungs-Modus?
 * @param {string} editName - Name im Bearbeitungs-Modus
 * @param {boolean} isLastStore - Ist dies der letzte Laden? (Löschen deaktivieren)
 * @param {function} onSelectStore - Callback zum Aktivieren des Ladens
 * @param {function} onEditLayout - Callback zum Öffnen des Layout-Editors
 * @param {function} onStartRename - Callback zum Starten des Umbenennens
 * @param {function} onSaveRename - Callback zum Speichern des neuen Namens
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
          {/* Header mit Icon, Name und "Aktiv"-Badge */}
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
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {store.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {store.categories?.length || 0} Kategorien
                </p>
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
            
            {/* Als aktiv setzen */}
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
            
            {/* Layout bearbeiten */}
            <button
              onClick={onEditLayout}
              className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              title="Layout bearbeiten"
              aria-label={`Layout von ${store.name} bearbeiten`}
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            
            {/* Umbenennen */}
            <button
              onClick={onStartRename}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="Umbenennen"
              aria-label={`${store.name} umbenennen`}
            >
              <Edit2 className="w-5 h-5" />
            </button>
            
            {/* Löschen (deaktiviert wenn letzter Laden) */}
            <button
              onClick={onDelete}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isLastStore ? "Letzter Laden kann nicht gelöscht werden" : "Löschen"}
              aria-label={`${store.name} löschen`}
              disabled={isLastStore}
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