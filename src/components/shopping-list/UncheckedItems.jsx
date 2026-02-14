import React from 'react';
import ShoppingListItem from './ShoppingListItem';
import EditableItem from './EditableItem';

/**
 * UncheckedItems - Liste der nicht-abgehakten Artikel
 * 
 * Zeigt aktive Einkaufsliste mit Drag & Drop und Edit-Funktionalität
 * 
 * Props:
 * @param {array} items - Nicht-abgehakte Artikel
 * @param {string} editingId - ID des aktuell bearbeiteten Items
 * @param {object} editForm - Formular-Daten für Bearbeitung
 * @param {object} draggedItem - Aktuell gezogenes Item
 * @param {number} dragOverIndex - Index über dem aktuell gehovert wird
 * @param {array} storeCategories - Verfügbare Kategorien
 * @param {function} onToggleItem - Callback beim Abhaken
 * @param {function} onRemoveItem - Callback beim Löschen
 * @param {function} onStartEdit - Callback beim Starten der Bearbeitung
 * @param {function} onSaveEdit - Callback beim Speichern
 * @param {function} onCancelEdit - Callback beim Abbrechen
 * @param {function} onEditFormChange - Callback bei Formular-Änderung
 * @param {function} onDragStart - Callback bei Drag-Start
 * @param {function} onDragOver - Callback bei Drag-Over
 * @param {function} onDragLeave - Callback bei Drag-Leave
 * @param {function} onDrop - Callback bei Drop
 * @param {function} onDragEnd - Callback bei Drag-End
 * @param {function} getCategoryName - Gibt Kategorie-Namen zurück
 */
const UncheckedItems = ({
  items,
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
  getCategoryName
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable={editingId !== item.id}
          onDragStart={(e) => onDragStart(e, item, index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, index)}
          onDragEnd={onDragEnd}
          className={`p-4 flex items-center gap-3 transition-all ${
            index !== items.length - 1 ? 'border-b border-gray-100' : ''
          } ${
            dragOverIndex === index ? 'border-t-4 border-blue-500' : ''
          } ${
            draggedItem?.index === index ? 'opacity-50' : ''
          } ${
            editingId !== item.id ? 'cursor-move' : ''
          }`}
        >
          {/* Bearbeitungs-Modus */}
          {editingId === item.id ? (
            <EditableItem
              item={item}
              editForm={editForm}
              storeCategories={storeCategories}
              onEditFormChange={onEditFormChange}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
            />
          ) : (
            /* Normal-Ansicht */
            <ShoppingListItem
              item={item}
              onToggle={() => onToggleItem(item.id)}
              onEdit={() => onStartEdit(item)}
              onDelete={() => onRemoveItem(item.id)}
              getCategoryName={getCategoryName}
              showDragHandle={true}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default UncheckedItems;