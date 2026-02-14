import React from 'react';
import UncheckedItems from './UncheckedItems';
import CheckedItems from './CheckedItems';

/**
 * ItemsList - Container für alle Einkaufslisteneinträge
 * 
 * Zeigt nicht-abgehakte und abgehakte Items getrennt an
 * 
 * Props:
 * @param {array} uncheckedItems - Nicht-abgehakte Artikel
 * @param {array} checkedItems - Abgehakte Artikel
 * @param {string} editingId - ID des aktuell bearbeiteten Items
 * @param {object} editForm - Formular-Daten für Bearbeitung
 * @param {object} draggedItem - Aktuell gezogenes Item
 * @param {number} dragOverIndex - Index über dem aktuell gehovert wird
 * @param {array} storeCategories - Verfügbare Kategorien
 * @param {function} onToggleItem - Callback beim Abhaken/Aufhaken
 * @param {function} onRemoveItem - Callback beim Löschen
 * @param {function} onStartEdit - Callback beim Starten der Bearbeitung
 * @param {function} onSaveEdit - Callback beim Speichern der Bearbeitung
 * @param {function} onCancelEdit - Callback beim Abbrechen der Bearbeitung
 * @param {function} onEditFormChange - Callback bei Änderung des Edit-Formulars
 * @param {function} onDragStart - Callback bei Drag-Start
 * @param {function} onDragOver - Callback bei Drag-Over
 * @param {function} onDragLeave - Callback bei Drag-Leave
 * @param {function} onDrop - Callback bei Drop
 * @param {function} onDragEnd - Callback bei Drag-End
 * @param {function} onClearChecked - Callback zum Löschen abgehakter Items
 * @param {function} onClearAll - Callback zum Löschen aller Items
 * @param {function} getCategoryName - Gibt Kategorie-Namen für ID zurück
 */
const ItemsList = ({
  uncheckedItems,
  checkedItems,
  editingId,
  editForm,
  draggedItem,
  dragOverIndex,
  storeCategories,
  onToggleItem,
  onRemoveItem,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onClearChecked,
  onClearAll,
  getCategoryName
}) => {
  return (
    <div className="space-y-6">
      
      {/* Nicht-abgehakte Items (aktive Einkaufsliste) */}
      {uncheckedItems.length > 0 && (
        <UncheckedItems
          items={uncheckedItems}
          editingId={editingId}
          editForm={editForm}
          draggedItem={draggedItem}
          dragOverIndex={dragOverIndex}
          storeCategories={storeCategories}
          onToggleItem={onToggleItem}
          onRemoveItem={onRemoveItem}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onEditFormChange={onEditFormChange}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          getCategoryName={getCategoryName}
        />
      )}

      {/* Abgehakte Items (erledigte Artikel) */}
      {checkedItems.length > 0 && (
        <CheckedItems
          items={checkedItems}
          onToggleItem={onToggleItem}
          onRemoveItem={onRemoveItem}
          onClearChecked={onClearChecked}
        />
      )}

      {/* Gesamte Liste löschen */}
      {(uncheckedItems.length > 0 || checkedItems.length > 0) && (
        <button
          onClick={onClearAll}
          className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          Gesamte Liste löschen
        </button>
      )}
    </div>
  );
};

export default ItemsList;