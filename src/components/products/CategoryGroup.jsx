import React from 'react';
import ProductItem from './ProductItem';

/**
 * CategoryGroup - Gruppe von Produkten einer Kategorie
 * 
 * Zeigt Kategorie-Header und alle Produkte dieser Kategorie
 * 
 * Props:
 * @param {string} categoryId - ID der Kategorie
 * @param {string} categoryName - Name der Kategorie
 * @param {array} products - Produkte dieser Kategorie
 * @param {array} allProducts - Alle Produkte (für Index-Berechnung)
 * @param {array} categories - Verfügbare Kategorien
 * @param {number} editingId - ID des bearbeiteten Produkts
 * @param {object} editForm - Formular-Daten
 * @param {function} onStartEdit - Callback zum Starten der Bearbeitung
 * @param {function} onSaveEdit - Callback zum Speichern
 * @param {function} onCancelEdit - Callback zum Abbrechen
 * @param {function} onEditFormChange - Callback bei Formular-Änderung
 * @param {function} onDelete - Callback zum Löschen
 */
const CategoryGroup = ({
  categoryId,
  categoryName,
  products,
  allProducts,
  categories,
  editingId,
  editForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  onDelete
}) => {
  return (
    <div>
      {/* Kategorie-Header */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
          {categoryName}
        </span>
        <span className="text-sm text-gray-500">
          ({products.length})
        </span>
      </h2>
      
      {/* Produkte dieser Kategorie */}
      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
        {products.map((product, idx) => {
          // Globalen Index im gesamten Produkte-Array finden
          const globalIndex = allProducts.findIndex(p => 
            p.name === product.name && 
            p.category === product.category
          );
          
          return (
            <ProductItem
              key={idx}
              product={product}
              globalIndex={globalIndex}
              categories={categories}
              isEditing={editingId === globalIndex}
              editForm={editForm}
              onStartEdit={() => onStartEdit(product, globalIndex)}
              onSaveEdit={() => onSaveEdit(globalIndex)}
              onCancelEdit={onCancelEdit}
              onEditFormChange={onEditFormChange}
              onDelete={() => onDelete(globalIndex)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGroup;