import React from 'react';
import CategoryGroup from './CategoryGroup';
import { getCategoryName } from '../../utils/productHelpers';

/**
 * ProductsGroupedList - Liste aller Produkte gruppiert nach Kategorien
 * 
 * Zeigt Produkte sortiert nach Kategorien mit Header
 * 
 * Props:
 * @param {object} groupedProducts - Produkte gruppiert nach Kategorie {categoryId: [products]}
 * @param {array} products - Alle Produkte (für Index-Berechnung)
 * @param {array} categories - Verfügbare Kategorien
 * @param {number} editingId - ID des aktuell bearbeiteten Produkts
 * @param {object} editForm - Formular-Daten für Bearbeitung
 * @param {function} onStartEdit - Callback zum Starten der Bearbeitung
 * @param {function} onSaveEdit - Callback zum Speichern
 * @param {function} onCancelEdit - Callback zum Abbrechen
 * @param {function} onEditFormChange - Callback bei Formular-Änderung
 * @param {function} onDelete - Callback zum Löschen
 */
const ProductsGroupedList = ({
  groupedProducts,
  products,
  categories,
  editingId,
  editForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  onDelete
}) => {
  /**
   * Sortiert Kategorien nach ihrer Order
   */
  const sortedCategories = Object.entries(groupedProducts)
    .sort(([catA], [catB]) => {
      const orderA = categories.find(c => c.id === catA)?.order || 999;
      const orderB = categories.find(c => c.id === catB)?.order || 999;
      return orderA - orderB;
    });

  return (
    <div className="space-y-6">
      {sortedCategories.map(([categoryId, categoryProducts]) => (
        <CategoryGroup
          key={categoryId}
          categoryId={categoryId}
          categoryName={getCategoryName(categoryId, categories)}
          products={categoryProducts}
          allProducts={products}
          categories={categories}
          editingId={editingId}
          editForm={editForm}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onEditFormChange={onEditFormChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ProductsGroupedList;