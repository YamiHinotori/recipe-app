import React from 'react';
import StoreCard from './StoreCard';

/**
 * StoresList - Grid-Liste aller Läden
 * 
 * Zeigt alle Läden als Karten in responsivem Grid
 * Stores haben jetzt _isOwn Property für Ownership-Checks
 * 
 * Props:
 * @param {array} stores - Alle Läden (mit _isOwn, _ownerId)
 * @param {string} selectedStoreId - ID des ausgewählten Ladens
 * @param {string} editingId - ID des aktuell umbenannten Ladens
 * @param {string} editName - Neuer Name beim Umbenennen
 * @param {function} onSelectStore - Callback beim Auswählen eines Ladens
 * @param {function} onEditLayout - Callback zum Öffnen des Layout-Editors
 * @param {function} onStartRename - Callback zum Starten des Umbenennens
 * @param {function} onSaveRename - Callback zum Speichern des neuen Namens
 * @param {function} onCancelRename - Callback zum Abbrechen des Umbenennens
 * @param {function} onEditNameChange - Callback bei Änderung des Namens
 * @param {function} onDelete - Callback zum Löschen eines Ladens
 */
const StoresList = ({
  stores,
  selectedStoreId,
  editingId,
  editName,
  onSelectStore,
  onEditLayout,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditNameChange,
  onDelete
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stores.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          isSelected={selectedStoreId === store.id}
          isEditing={editingId === store.id}
          editName={editName}
          isLastStore={stores.length === 1}
          onSelectStore={() => onSelectStore(store.id)}
          onEditLayout={() => onEditLayout(store.id)}
          onStartRename={() => onStartRename(store)}
          onSaveRename={onSaveRename}
          onCancelRename={onCancelRename}
          onEditNameChange={onEditNameChange}
          onDelete={() => onDelete(store.id)}
        />
      ))}
    </div>
  );
};

export default StoresList;