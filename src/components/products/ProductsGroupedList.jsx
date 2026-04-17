import React from 'react';
import CategoryGroup from './CategoryGroup';
import { getCategoryName } from '../../utils/productHelpers';

/**
 * ProductsGroupedList - ANGEPASST für editingProduct statt editingId
 * 
 * Props:
 * @param {object} groupedProducts - Produkte gruppiert nach Kategorie
 * @param {array} products - Alle Produkte
 * @param {array} categories - Verfügbare Kategorien
 * @param {object} editingProduct - Aktuell bearbeitetes Produkt (mit _ownerId, _originalIndex)
 * @param {object} editForm - Formular-Daten für Bearbeitung
 * @param {function} onStartEdit - Callback zum Starten (bekommt product)
 * @param {function} onSaveEdit - Callback zum Speichern
 * @param {function} onCancelEdit - Callback zum Abbrechen
 * @param {function} onEditFormChange - Callback bei Formular-Änderung
 * @param {function} onDelete - Callback zum Löschen (bekommt product)
 */
const ProductsGroupedList = ({
  groupedProducts,
  products,
  categories,
  editingProduct,  // ← Geändert von editingId!
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
          editingProduct={editingProduct}  // ← Geändert!
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